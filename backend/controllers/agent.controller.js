const agentService = require('../services/geminiService');
const firebaseService = require('../services/firebaseService');
const cloudinaryService = require('../services/cloudinaryService');

const createAgent = async (req, res) => {
  try {
    const { agentName, company, prompt, userId } = req.body;
    // ANTI-REPETITION SYSTEM PROMPT - Prepended to prevent robotic loops
    const fullPrompt = `AgentName: ${agentName}\nCompany: ${company}\nGuidance: ${prompt}\n\nGoals:\n- Qualify lead and book a meeting/demo when appropriate\n- Be concise, courteous, and proactive\n- Always introduce as ${agentName} from ${company}\n- Keep each utterance under 15 words\n- Use Indian English where helpful (en-IN tone)\n\nCRITICAL: You must NOT repeat the same phrase multiple times. Each response must move the conversation forward. If user is silent, respond with a variation like "Are you still there?" instead of repeating. Never loop back to the same question.`;
    const callFlow = await agentService.generateCallFlow(fullPrompt);

    const agentRef = await firebaseService.addDocument('agents', {
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
    const agents = await firebaseService.getDocuments('agents', 'userId', userId);
    res.json({ agents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

// Delete agent and all related data
const deleteAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { userId } = req.query;

    // Verify agent exists and belongs to user
    const agent = await firebaseService.getDocument('agents', agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    if (agent.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this agent' });
    }

    // Get all calls for this agent
    const calls = await firebaseService.getDocuments('calls', 'agentId', agentId);
    
    // Delete all related resources (recordings, transcripts, calls)
    const deletions = calls.map(async (call) => {
      // Delete recording from Cloudinary if exists
      if (call.cloudinaryPublicId) {
        try {
          await cloudinaryService.deleteRecording(call.cloudinaryPublicId);
        } catch (err) {
          console.warn(`Failed to delete recording for call ${call.id}:`, err.message);
        }
      }
      
      // Delete the call document
      try {
        await firebaseService.deleteDocument('calls', call.id);
      } catch (err) {
        console.error(`Failed to delete call ${call.id}:`, err.message);
        throw err; // Let outer catch handle this
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletions);

    // Finally delete the agent
    await firebaseService.deleteDocument('agents', agentId);

    res.json({ message: 'Agent and related data deleted successfully' });
  } catch (err) {
    console.error('Error deleting agent:', err);
    res.status(500).json({ error: 'Failed to delete agent and related data' });
  }
};

module.exports = { createAgent, getAgents, deleteAgent };