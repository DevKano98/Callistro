const agentService = require('../services/geminiService');
const db = require('../services/firebaseService');

const createAgent = async (req, res) => {
  try {
    const { agentName, company, prompt, userId } = req.body;
    // ANTI-REPETITION SYSTEM PROMPT - Prepended to prevent robotic loops
    const fullPrompt = `AgentName: ${agentName}\nCompany: ${company}\nGuidance: ${prompt}\n\nGoals:\n- Qualify lead and book a meeting/demo when appropriate\n- Be concise, courteous, and proactive\n- Always introduce as ${agentName} from ${company}\n- Keep each utterance under 15 words\n- Use Indian English where helpful (en-IN tone)\n\nCRITICAL: You must NOT repeat the same phrase multiple times. Each response must move the conversation forward. If user is silent, respond with a variation like "Are you still there?" instead of repeating. Never loop back to the same question.`;
    const callFlow = await agentService.generateCallFlow(fullPrompt);

    const agentRef = await db.addDocument('agents', {
      agentName,
      company,
      prompt: fullPrompt,
      callFlow, // ← now a state machine
      userId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ id: agentRef.id, agentName, callFlow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create agent' });
  }
};

const getAgents = async (req, res) => {
  try {
    const { userId } = req.query;
    const agents = await db.getDocuments('agents', 'userId', userId);
    res.json({ agents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

module.exports = { createAgent, getAgents };