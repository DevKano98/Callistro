const csvParser = require('../utils/csv.Parser');
const twilioService = require('../services/twilioService');
const firebaseService = require('../services/firebaseService');
const cloudinaryService = require('../services/cloudinaryService');
const { getIntent } = require('../utils/intentClassifier');

function escapeXml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Upload CSV → create call records
const uploadCSV = async (req, res) => {
  try {
    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const phoneNumbers = await csvParser.parseCSV(req.file.buffer);
    if (phoneNumbers.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers found in CSV' });
    }

    const createdCalls = [];
    for (const number of phoneNumbers) {
      const callDoc = await firebaseService.addDocument('calls', {
        phoneNumber: number,
        agentId,
        status: 'pending',
        currentState: 'start',
        transcriptChunks: [],
        createdAt: new Date().toISOString(),
      });
      createdCalls.push(callDoc);
    }

    res.status(200).json({ success: true, count: createdCalls.length });
  } catch (err) {
    console.error('CSV upload error:', err);
    res.status(500).json({ error: 'CSV upload failed: ' + (err.message || 'Unknown error') });
  }
};

// Start calls
const startCalls = async (req, res) => {
  try {
    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const calls = await firebaseService.getDocuments('calls', 'agentId', agentId);
    const pendingCalls = calls.filter(call => call.status === 'pending');

    if (pendingCalls.length === 0) {
      return res.status(200).json({ 
        success: true, 
        initiated: 0, 
        message: 'No pending calls found. Upload a CSV first.' 
      });
    }

    // Deduplicate by phone number
    const uniqueMap = new Map();
    for (const call of pendingCalls) {
      if (!uniqueMap.has(call.phoneNumber)) {
        uniqueMap.set(call.phoneNumber, call);
      }
    }
    const uniqueCalls = Array.from(uniqueMap.values());

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    let initiatedCount = 0;

    // Process calls ONE BY ONE sequentially with delay
    const delayBetweenCalls = Number(process.env.DELAY_BETWEEN_CALLS_MS) || 2000; // 2 seconds default
    
    for (let i = 0; i < uniqueCalls.length; i++) {
      const call = uniqueCalls[i];
      try {
        console.log(`📞 [${i + 1}/${uniqueCalls.length}] Calling ${call.phoneNumber} (Call ID: ${call.id})...`);
        const twimlUrl = `${baseUrl}/api/call/twiml/${call.id}`;
        const twilioCallSid = await twilioService.makeCall(call.phoneNumber, twimlUrl);
        await firebaseService.updateDocument('calls', call.id, { 
          status: 'initiated', 
          callSid: twilioCallSid,
          initiatedAt: new Date().toISOString()
        });
        initiatedCount++;
        console.log(`✅ Call initiated: ${call.id} → Twilio SID: ${twilioCallSid}`);
        
        // Wait before next call (except for last one)
        if (i < uniqueCalls.length - 1) {
          console.log(`⏳ Waiting ${delayBetweenCalls}ms before next call...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        }
      } catch (err) {
        console.error(`❌ Failed to call ${call.phoneNumber}:`, err.message);
        await firebaseService.updateDocument('calls', call.id, { 
          status: 'failed',
          error: err.message 
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      initiated: initiatedCount,
      total: uniqueCalls.length
    });
  } catch (err) {
    console.error('Start calls error:', err);
    res.status(500).json({ error: 'Call initiation failed: ' + (err.message || 'Unknown error') });
  }
};

// Serve TwiML for current state
const getTwiML = async (req, res) => {
  try {
    const { callId } = req.params;

    // Validate callId
    if (!callId || callId.length < 10) {
      console.warn('⚠️ Invalid callId format:', callId);
      return res.type('xml').send('<Response><Say>Invalid call.</Say></Response>');
    }

    // Fetch call record
    const call = await firebaseService.getDocument('calls', callId);
    if (!call || !call.agentId) {
      console.warn(`⚠️ Call document not found or missing agentId: ${callId}`, call);
      return res.type('xml').send('<Response><Say>Call not found.</Say></Response>');
    }

    // Fetch agent
    const agent = await firebaseService.getDocument('agents', call.agentId);
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${call.agentId}`);
      return res.type('xml').send('<Response><Say>Agent not found.</Say></Response>');
    }

    // Check if realtime mode is on (optional)
    // VALIDATE BASE_URL FOR REALTIME - Must be https://
    if (process.env.REALTIME_ENABLED === 'true') {
      try {
        const base = process.env.BASE_URL || '';
        const url = new URL(base);
        if (url.protocol === 'https:') {
          const host = url.host;
          const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${host}/realtime?agentId=${agent.id}&callId=${callId}" />
  </Connect>
</Response>`;
          return res.type('xml').send(twiml);
        } else {
          console.warn('⚠️ BASE_URL must start with https:// for REALTIME_ENABLED. Falling back to standard TwiML.');
        }
      } catch (e) {
        console.warn('⚠️ Invalid BASE_URL for realtime. Falling back to standard TwiML.');
      }
    }

    // Fallback: Say + Gather
    const intro = agent.callFlow?.states?.start?.say 
      || `Hello, this is ${agent.agentName || 'an AI agent'} from ${agent.company || 'our company'}.`;
    const safeIntro = escapeXml(intro);

    const twiml = `<Response>
  <Say voice="alice">${safeIntro}</Say>
  <Gather input="speech" language="en-US" speechModel="phone_call"
    action="${process.env.BASE_URL || 'http://localhost:5000'}/api/call/webhook/response/${callId}"
    speechTimeout="2" />
</Response>`;

    res.type('xml').send(twiml);
  } catch (err) {
    console.error('TwiML generation error:', err);
    res.type('xml').send('<Response><Say>System error.</Say></Response>');
  }
};

// Handle user speech response
const handleSpeechResponse = async (req, res) => {
  try {
    const { callId } = req.params;
    const { SpeechResult = '' } = req.body;

    if (!callId) {
      return res.type('xml').send('<Response><Say>Invalid request.</Say></Response>');
    }

    const call = await firebaseService.getDocument('calls', callId);
    if (!call) {
      console.warn(`CallCheck response: call not found ${callId}`);
      return res.type('xml').send('<Response><Say>Call ended.</Say></Response>');
    }

    const agent = await firebaseService.getDocument('agents', call.agentId);
    if (!agent) {
      return res.type('xml').send('<Response><Say>Agent unavailable.</Say></Response>');
    }

    // ANTI-REPETITION: Save user response with speaker labels
    const userMessage = `User: ${SpeechResult}`;
    const newChunks = [...(call.transcriptChunks || []), userMessage];
    
    // Use intent-based flow (not real-time Gemini to avoid cost/latency)
    const intent = getIntent(SpeechResult, agent.callFlow?.keywords || {});
    const currentState = call.currentState || 'start';
    const stateConfig = agent.callFlow?.states?.[currentState] || {};
    const nextStateKey = stateConfig.next?.[intent] || stateConfig.next?.fallback || 'start';
    const nextState = agent.callFlow?.states?.[nextStateKey];

    if (!nextState) {
      return res.type('xml').send('<Response><Say>Thank you!</Say></Response>');
    }

    // ANTI-REPETITION: Check if we've already said this exact phrase
    const lastBotReply = call.lastBotReply || '';
    let botReply = nextState.say || 'Thank you.';
    
    // If we're about to repeat, add variation
    if (botReply === lastBotReply && !nextState.end) {
      console.log(`⚠️ Detected potential repetition, adding variation`);
      botReply = `I understand. ${botReply}`;
    }
    
    // Add bot response to transcript
    const botMessage = `Agent: ${botReply}`;
    const updatedChunks = [...newChunks, botMessage];

    const safeReply = escapeXml(botReply);
    const twiml = `<Response>
  <Say voice="alice">${safeReply}</Say>
  ${nextState.end ? '' : `<Gather input="speech" language="en-US" speechModel="phone_call"
    action="${process.env.BASE_URL || 'http://localhost:5000'}/api/call/webhook/response/${callId}"
    speechTimeout="2" />`}
</Response>`;

    // ANTI-REPETITION: Update with conversation history and last reply
    await firebaseService.updateDocument('calls', callId, { 
      transcriptChunks: updatedChunks,
      currentState: nextStateKey,
      lastBotReply: botReply,
      conversationTurns: (call.conversationTurns || 0) + 1
    });

    res.type('xml').send(twiml);
  } catch (err) {
    console.error('Speech response error:', err);
    res.type('xml').send('<Response><Say>Sorry, I missed that.</Say></Response>');
  }
};

// Call status webhook (from Twilio)
const handleCallStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, RecordingUrl, RecordingSid, RecordingDuration } = req.body;
    console.log(`📟 Call status webhook:`, { CallSid, CallStatus, RecordingUrl, RecordingSid });

    // Find call by Twilio's CallSid
    const matches = await firebaseService.getDocuments('calls', 'callSid', CallSid);
    const call = matches[0];

    if (!call) {
      console.warn(`⚠️ No call record found for Twilio SID: ${CallSid}`);
      return res.status(200).send('<Response></Response>');
    }

    console.log(`📋 Found call record: ${call.id} (${call.phoneNumber})`);

    // RECORDING WILL BE HANDLED BY SEPARATE WEBHOOK
    // Do not download/upload here - recording webhook handles it
    let mp3Url = call.mp3Url || '';
    console.log(`📋 Current recording status: ${mp3Url ? 'Available' : 'Pending'}`);

    // Update call status
    const updateData = {
      lastStatus: CallStatus,
      lastStatusAt: new Date().toISOString()
    };

    // Finalize if call ended
    const endedStatuses = ['completed', 'busy', 'no-answer', 'failed', 'canceled'];
    if (endedStatuses.includes(CallStatus)) {
      console.log(`📞 Call ${CallStatus}: ${call.phoneNumber}`);
      
      const transcript = (call.transcriptChunks || []).join('\n');
      let summary = 'No conversation recorded', sentiment = 'neutral', leadScore = 0;

      // Run sentiment analysis if we have transcript
      if (transcript && transcript.trim().length > 10) {
        console.log(`🤖 Running sentiment analysis on transcript (${transcript.length} chars)...`);
        try {
          const gemini = require('../services/geminiService');
          const analysis = await gemini.analyzeTranscript(transcript);
          
          console.log(`✅ Sentiment analysis complete:`, analysis);
          
          summary = analysis.summary || summary;
          sentiment = analysis.sentiment || sentiment;
          leadScore = typeof analysis.leadScore === 'number' ? analysis.leadScore : leadScore;
        } catch (err) {
          console.error('❌ Transcript analysis failed:', err.message);
          summary = 'Analysis failed: ' + err.message;
        }
      } else {
        console.log(`⚠️ No transcript available for analysis (length: ${transcript?.length || 0})`);
        if (CallStatus !== 'completed') {
          summary = `Call ${CallStatus} - no conversation`;
        }
      }

      updateData.status = CallStatus === 'completed' ? 'completed' : 'failed';
      updateData.transcript = transcript;
      updateData.summary = summary;
      updateData.sentiment = sentiment;
      updateData.leadScore = leadScore;
      updateData.mp3Url = mp3Url;
      updateData.completedAt = new Date().toISOString();
      updateData.recordingDuration = RecordingDuration || 0;

      console.log(`📊 Final call data:`, {
        status: updateData.status,
        sentiment,
        leadScore,
        hasRecording: !!mp3Url,
        transcriptLength: transcript?.length || 0
      });
    }

    await firebaseService.updateDocument('calls', call.id, updateData);
    res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('❌ Call status webhook error:', err);
    res.status(200).send('<Response></Response>');
  }
};

// Get calls for dashboard
const getCalls = async (req, res) => {
  try {
    const { agentId } = req.query;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }
    const calls = await firebaseService.getDocuments('calls', 'agentId', agentId);
    res.json({ calls });
  } catch (err) {
    console.error('Get calls error:', err);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const agents = await firebaseService.getDocuments('agents', 'userId', userId);
    const agentIds = agents.map(a => a.id);

    let allCalls = [];
    for (const agentId of agentIds) {
      const calls = await firebaseService.getDocuments('calls', 'agentId', agentId);
      allCalls = [...allCalls, ...calls];
    }

    const completedCalls = allCalls.filter(c => c.status === 'completed');
    const leadsGenerated = completedCalls.filter(c => c.leadScore >= 7).length;

    const stats = {
      activeAgents: agents.length,
      totalCalls: allCalls.length,
      completedCalls: completedCalls.length,
      leadsGenerated
    };

    res.json({ stats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Recording status webhook (separate from call status)
const handleRecordingStatus = async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingSid, RecordingStatus, RecordingDuration } = req.body;
    console.log(`🎙️ Recording webhook:`, { CallSid, RecordingSid, RecordingStatus, RecordingUrl });

    // ONLY PROCESS WHEN RECORDING IS COMPLETED - Prevent early 404 errors
    if (RecordingStatus !== 'completed') {
      console.log(`⏳ Recording status: ${RecordingStatus}, waiting for completion...`);
      return res.status(200).send('<Response></Response>');
    }

    // Find call by Twilio's CallSid
    const matches = await firebaseService.getDocuments('calls', 'callSid', CallSid);
    const call = matches[0];

    if (!call) {
      console.warn(`⚠️ No call record found for recording: ${CallSid}`);
      return res.status(200).send('<Response></Response>');
    }

    // CLOUDINARY INTEGRATION - Download from Twilio and upload to Cloudinary
    if (RecordingUrl && !call.mp3Url) {
      try {
        console.log(`🎙️ Processing recording: ${RecordingSid}`);
        
        // Use Cloudinary service to handle download + upload
        const cloudinaryResult = await cloudinaryService.processTwilioRecording(
          RecordingUrl,
          CallSid,
          RecordingSid
        );
        
        if (cloudinaryResult) {
          // SUCCESS: Save Cloudinary public URL and metadata to Firestore
          await firebaseService.updateDocument('calls', call.id, {
            mp3Url: cloudinaryResult.url, // Public Cloudinary URL
            recordingDuration: RecordingDuration || 0,
            recordingSid: RecordingSid,
            cloudinaryPublicId: cloudinaryResult.publicId,
            recordingBytes: cloudinaryResult.bytes,
            recordingUploadedAt: new Date().toISOString(),
            recordingProvider: 'cloudinary'
          });
          
          console.log(`✅ Recording saved to Firestore with Cloudinary URL`);
        } else {
          // Upload failed - save metadata only
          console.warn('⚠️ Recording could not be uploaded to Cloudinary');
          await firebaseService.updateDocument('calls', call.id, {
            recordingDuration: RecordingDuration || 0,
            recordingSid: RecordingSid,
            recordingStatus: 'upload_failed',
            uploadError: 'Cloudinary not configured or upload failed'
          });
        }
      } catch (err) {
        console.error('❌ Recording processing error:', err.message);
        // Save error info
        await firebaseService.updateDocument('calls', call.id, {
          recordingSid: RecordingSid,
          recordingStatus: 'error',
          uploadError: err.message
        });
      }
    }

    res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('❌ Recording webhook error:', err);
    res.status(200).send('<Response></Response>');
  }
};

// Debug endpoint to check calls in database
const debugCalls = async (req, res) => {
  try {
    const { agentId } = req.query;
    
    if (agentId) {
      const calls = await firebaseService.getDocuments('calls', 'agentId', agentId);
      res.json({ 
        agentId,
        totalCalls: calls.length,
        calls: calls.map(c => ({
          id: c.id,
          phoneNumber: c.phoneNumber,
          status: c.status,
          createdAt: c.createdAt,
          agentId: c.agentId
        }))
      });
    } else {
      const allCalls = await firebaseService.getAllDocuments('calls');
      res.json({ 
        totalCalls: allCalls.length,
        calls: allCalls.map(c => ({
          id: c.id,
          phoneNumber: c.phoneNumber,
          status: c.status,
          createdAt: c.createdAt,
          agentId: c.agentId
        }))
      });
    }
  } catch (err) {
    console.error('Debug calls error:', err);
    res.status(500).json({ error: 'Failed to debug calls: ' + err.message });
  }
};

module.exports = {
  uploadCSV,
  startCalls,
  getTwiML,
  handleSpeechResponse,
  handleCallStatus,
  handleRecordingStatus,
  getCalls,
  getDashboardStats,
  debugCalls
};