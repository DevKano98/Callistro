const firebaseService = require('../services/firebaseService');

const updateSettings = async (req, res) => {
  try {
    const { userId, voicePreference, pitch } = req.body;
    const existing = await firebaseService.getDocuments('settings', 'userId', userId);
    if (existing.length > 0) {
      await firebaseService.updateDocument('settings', existing[0].id, { voicePreference, pitch });
    } else {
      await firebaseService.addDocument('settings', { userId, voicePreference, pitch });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
};

const getSettings = async (req, res) => {
  try {
    const { userId } = req.query;
    const settings = await firebaseService.getDocuments('settings', 'userId', userId);
    if (settings.length > 0) {
      res.json({ settings: settings[0] });
    } else {
      res.json({ settings: { voicePreference: 'female', pitch: 1.0 } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

module.exports = { updateSettings, getSettings };