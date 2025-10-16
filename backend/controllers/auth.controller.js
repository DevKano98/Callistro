const admin = require('firebase-admin');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: userRecord.uid, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Firebase Admin doesn't support password login directly
    // In real app, use client-side Firebase Auth + ID token verification
    const user = await admin.auth().getUserByEmail(email);
    res.json({ uid: user.uid, email });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

module.exports = { register, login };