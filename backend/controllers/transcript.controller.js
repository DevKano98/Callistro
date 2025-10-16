const firebaseService = require('../services/firebaseService');

const getTranscript = async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await firebaseService.getDocument('calls', callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    res.json({
      transcript: call.transcript || 'No transcript yet.',
      summary: call.summary || '—',
      sentiment: call.sentiment || 'neutral',
      mp3Url: call.mp3Url || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
};

module.exports = { getTranscript };