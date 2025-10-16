/**
 * Demo Script: Test Twilio Recording Download & Cloudinary Upload
 * 
 * This script demonstrates:
 * 1. Downloading a Twilio recording with authentication
 * 2. Converting to base64 and uploading to Cloudinary
 * 3. Storing metadata in Firebase Firestore
 * 
 * Usage:
 *   node scripts/testCloudinaryUpload.js <RecordingUrl> <CallSid> <RecordingSid>
 * 
 * Example:
 *   node scripts/testCloudinaryUpload.js \
 *     https://api.twilio.com/2010-04-01/Accounts/AC.../Recordings/RE123 \
 *     CA123456789 \
 *     RE123456789
 */

require('dotenv').config();
const cloudinaryService = require('../services/cloudinaryService');
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK_PATH || '../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testRecordingUpload(recordingUrl, callSid, recordingSid) {
  console.log('\n🚀 Starting Cloudinary Upload Test\n');
  console.log('Configuration:');
  console.log('  Cloudinary:', cloudinaryService.isConfigured() ? '✅ Configured' : '❌ Not configured');
  console.log('  Twilio SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('  Recording URL:', recordingUrl);
  console.log('\n');

  try {
    // Step 1: Process recording (download from Twilio + upload to Cloudinary)
    console.log('Step 1: Processing recording...');
    const result = await cloudinaryService.processTwilioRecording(
      recordingUrl,
      callSid,
      recordingSid
    );

    if (!result) {
      console.error('\n❌ Recording processing failed');
      console.log('\nPossible issues:');
      console.log('  - Cloudinary not configured (check .env)');
      console.log('  - Twilio credentials invalid');
      console.log('  - Recording URL not accessible');
      process.exit(1);
    }

    console.log('\n✅ Recording processed successfully!');
    console.log('Cloudinary Result:', {
      url: result.url,
      publicId: result.publicId,
      duration: result.duration,
      size: `${(result.bytes / 1024).toFixed(2)} KB`
    });

    // Step 2: Save metadata to Firestore
    console.log('\nStep 2: Saving metadata to Firestore...');
    const metadata = {
      callSid: callSid,
      recordingSid: recordingSid,
      mp3Url: result.url,
      cloudinaryPublicId: result.publicId,
      recordingBytes: result.bytes,
      recordingDuration: result.duration || 0,
      uploadedAt: new Date().toISOString(),
      recordingProvider: 'cloudinary',
      testUpload: true
    };

    const docRef = await db.collection('test_recordings').add(metadata);
    console.log('✅ Metadata saved to Firestore:', docRef.id);

    // Step 3: Verify the URL is accessible
    console.log('\nStep 3: Verifying URL accessibility...');
    const axios = require('axios');
    const testResponse = await axios.head(result.url);
    console.log('✅ URL is publicly accessible (Status:', testResponse.status, ')');

    console.log('\n🎉 Test Complete! Recording is available at:');
    console.log('   ', result.url);
    console.log('\n✅ No username/password will be required to play this recording');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: node testCloudinaryUpload.js <RecordingUrl> <CallSid> <RecordingSid>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/testCloudinaryUpload.js \\');
  console.error('    https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE456 \\');
  console.error('    CA123456789 \\');
  console.error('    RE456789012');
  process.exit(1);
}

const [recordingUrl, callSid, recordingSid] = args;
testRecordingUpload(recordingUrl, callSid, recordingSid);
