const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI safely
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized');
  } else {
    console.warn('⚠️ Gemini API key not configured. Using fallback call flows.');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Gemini AI:', error.message);
}

async function generateCallFlow(prompt) {
  try {
    // If Gemini AI is not configured, return a fallback call flow
    if (!genAI) {
      console.log('📝 Using fallback call flow for prompt:', prompt.substring(0, 100) + '...');
      return {
        states: {
          start: {
            say: "Hello! Are you interested in our product?",
            next: { yes: "close", no: "close", fallback: "start" }
          },
          close: {
            say: "Thank you for your time!",
            end: true
          }
        },
        keywords: {
          yes: ["yes", "yeah", "sure", "okay", "yep"],
          no: ["no", "nah", "not", "busy", "later"]
        }
      };
    }

    // GEMINI 2.5 INTEGRATION - Use latest model with better reasoning
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    console.log(`🤖 Generating call flow with ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(`
      You are designing a PHONE CALL state machine for an AI agent.
      Use the following instruction to tailor tone, intro, and goals:
      ---
      ${prompt}
      ---
      Output STRICT JSON with fields:
      {
        "states": {
          "start": { "say": string, "next": {"yes": string, "no": string, "fallback": string} },
          "...": { "say": string, "next": {...}, "end"?: true }
        },
        "keywords": {
          "yes": string[],
          "no": string[],
          "fallback"?: string[]
        }
      }
      Constraints:
      - Start state key MUST be "start"
      - Each "say" MUST explicitly introduce the agent by name and company on first turn
      - Keep each "say" under 15 words, Indian English friendly
      - Provide realistic sales/qualification branches (yes/no/fallback) that align with goals
      - DO NOT include markdown or commentary, JSON ONLY
    `);
    const response = result.response.text().trim();
    const jsonStr = response.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonStr);
  } catch (err) {
    // UPDATED FOR GEMINI MODEL FIX - Better error logging
    if (err.message && err.message.includes('404')) {
      console.error('❌ Invalid GEMINI_MODEL in .env. Check available models at https://ai.google.dev/models/gemini');
      console.error('Current model:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');
    } else {
      console.error('❌ Gemini flow error:', err.message);
    }
    return {
      states: {
        start: {
          say: "Hello! Are you interested in our product?",
          next: { yes: "close", no: "close", fallback: "start" }
        },
        close: {
          say: "Thank you for your time!",
          end: true
        }
      },
      keywords: {
        yes: ["yes", "yeah", "sure"],
        no: ["no", "nah", "not"]
      }
    };
  }
}

async function analyzeTranscript(transcript) {
  try {
    // GEMINI 2.5 FOR ANALYSIS - Better sentiment understanding
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(`
      Analyze this call transcript and provide a SHORT, RELEVANT summary.
      
      Transcript:
      "${transcript}"
      
      Return JSON with:
      - summary: SHORT 1-2 sentence summary of what happened (avoid generic phrases)
      - sentiment: "positive", "neutral", or "negative"
      - leadScore: 1-10 (how likely to convert)
      - keyInfo: Key takeaway or action item (one line)
      
      RULES:
      - Keep summary under 50 words
      - Be specific to THIS conversation
      - Avoid generic phrases like "the conversation was about..."
      - Focus on outcome and next steps
      
      Return ONLY valid JSON, no markdown.
    `);
    const response = result.response.text().trim();
    const jsonStr = response.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonStr);
  } catch (err) {
    return {
      summary: "Analysis failed.",
      sentiment: "neutral",
      leadScore: 0,
      keyInfo: ""
    };
  }
}

/**
 * Generate a short next reply (<= 15 words) given agent system prompt and last user text.
 * Enhanced with anti-repetition and natural conversation rules.
 */
async function generateDynamicReply(agentSystemPrompt, lastUserText, conversationSummary = '', lastBotReply = '') {
  try {
    if (!genAI) {
      return 'Could you please clarify?';
    }
    // GEMINI 2.5 FOR DYNAMIC REPLIES - Better context understanding & no repetition
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(`
      You are a PHONE CALL sales agent having a REAL-TIME conversation.
      
      CRITICAL RULES (MUST FOLLOW):
      1. NEVER repeat the same line twice - if you said it before, rephrase completely
      2. ALWAYS respond contextually to what the user JUST said
      3. Do NOT restart your pitch or introduction unless explicitly asked
      4. Keep responses under 15 words, natural and conversational (like a real caller)
      5. If user is silent/unclear, try variations like "Are you still there?" or "Should I continue?"
      6. Use natural human tone with slight variations - avoid robotic patterns
      7. Move the conversation FORWARD - no looping back
      
      YOUR ROLE:
      ---
      ${agentSystemPrompt}
      ---
      
      CONVERSATION SO FAR:
      ${conversationSummary}
      
      YOUR LAST REPLY: "${lastBotReply}"
      USER JUST SAID: "${lastUserText}"
      
      YOUR RESPONSE MUST:
      - Be COMPLETELY DIFFERENT from your last reply (never repeat)
      - Directly address what user just said
      - Stay under 15 words
      - Sound like a real human having a conversation
      - Move toward next step (qualification, demo booking, or natural close)
      - Plain text only, no markdown
      
      Generate your next response:
    `);
    return (result.response.text() || '').trim().replace(/^"|"$/g, '');
  } catch (err) {
    return 'Thanks. Could you share more details?';
  }
}

module.exports = { generateCallFlow, analyzeTranscript, generateDynamicReply };