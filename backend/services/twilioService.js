const twilio = require('twilio');

// Initialize Twilio client safely
let client = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized');
  } else {
    console.warn('⚠️ Twilio credentials not configured. Calls will be simulated.');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Twilio client:', error.message);
}

async function makeCall(to, twimlUrl) {
  try {
    // If Twilio is not configured, simulate the call
    if (!client) {
      console.log(`📞 SIMULATED CALL to ${to} with TwiML: ${twimlUrl}`);
      return `simulated_call_${Date.now()}`;
    }

    // Check required parameters
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable is not set');
    }

    if (!process.env.BASE_URL) {
      console.warn('BASE_URL not set, using default');
    }

    console.log(`📞 Creating real call to ${to} from ${process.env.TWILIO_PHONE_NUMBER}`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    const call = await client.calls.create({
      url: twimlUrl,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      method: 'GET',
      statusCallback: `${baseUrl}/api/call/webhook/call-status`,
      statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
      record: true,
      recordingStatusCallback: `${baseUrl}/api/call/webhook/recording-status`,
      recordingStatusCallbackEvent: ['completed'],
      recordingChannels: 'dual',
      trim: 'trim-silence'
    });
    
    console.log(`📞 REAL CALL initiated to ${to}, SID: ${call.sid}`);
    return call.sid;
  } catch (err) {
    console.error('❌ Twilio call creation failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error details:', err.moreInfo);
    throw err;
  }
}

module.exports = { makeCall };