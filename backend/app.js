const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK_PATH || './serviceAccountKey.json');

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};

// VALIDATE FIREBASE_STORAGE_BUCKET FORMAT
if (process.env.FIREBASE_STORAGE_BUCKET) {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  // Check for correct format (.appspot.com)
  if (bucket.includes('.firebasestorage.app')) {
    console.warn('⚠️ FIREBASE_STORAGE_BUCKET should use .appspot.com format, not .firebasestorage.app');
    console.warn(`   Current: ${bucket}`);
    console.warn(`   Change to: ${bucket.replace('.firebasestorage.app', '.appspot.com')}`);
  }
  
  firebaseConfig.storageBucket = bucket;
  console.log(`✅ Firebase Storage bucket configured: ${bucket}`);
} else {
  console.warn('⚠️ FIREBASE_STORAGE_BUCKET not set. Recording storage will be disabled.');
  console.warn('   To enable: Add FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com to .env');
}

admin.initializeApp(firebaseConfig);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/agent', require('./routes/agent.routes'));
app.use('/api/call', require('./routes/call.routes'));
app.use('/api/transcript', require('./routes/transcript.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

module.exports = app;