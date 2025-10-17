const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Initialize Cloudinary with environment variables
let cloudinaryConfigured = false;

try {
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary initialized:', process.env.CLOUDINARY_CLOUD_NAME);
  } else {
    console.warn('⚠️ Cloudinary not configured. Recording uploads will be disabled.');
    console.warn('   Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env');
  }
} catch (error) {
  console.error('❌ Failed to initialize Cloudinary:', error.message);
}

/**
 * Download Twilio recording using Recording SID with authentication
 * @param {string} recordingUrl - Twilio recording URL (from webhook)
 * @returns {Promise<Buffer>} - Audio file buffer
 */
async function downloadTwilioRecording(recordingUrl) {
  try {
    const mp3Url = `${recordingUrl}.mp3`;
    console.log(`📥 Downloading Twilio recording: ${mp3Url}`);
    
    // SECURE: Use Twilio credentials for download (backend only)
    const response = await axios.get(mp3Url, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      },
      timeout: 30000,
      headers: {
        'Accept': 'audio/mpeg'
      }
    });
    
    console.log(`✅ Recording downloaded: ${response.data.length} bytes`);
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Twilio recording download failed:', error.message);
    throw new Error(`Failed to download recording: ${error.message}`);
  }
}

/**
 * Upload recording buffer to Cloudinary
 * @param {Buffer} buffer - Audio file buffer
 * @param {string} filename - Desired filename (e.g., "CA123_RE456")
 * @returns {Promise<Object>} - Cloudinary upload result with secure_url
 */
async function uploadToCloudinary(buffer, filename) {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Skipping Cloudinary upload - not configured');
    return null;
  }

  try {
    console.log(`☁️ Uploading to Cloudinary: ${filename}`);
    
    // Convert buffer to base64 data URI
    const base64Audio = buffer.toString('base64');
    const dataUri = `data:audio/mpeg;base64,${base64Audio}`;
    
    // FIXED: Use folder OR public_id with path, not both
    // resource_type: 'video' supports audio files (.mp3, .wav)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataUri, {
        resource_type: 'video',
        folder: 'callisto_recordings',
        public_id: filename,
        overwrite: false
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    console.log(`✅ Uploaded to Cloudinary:`, {
      url: result.secure_url,
      duration: result.duration,
      size: result.bytes
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return null;
  }
}

/**
 * Complete workflow: Download from Twilio → Upload to Cloudinary
 * @param {string} recordingUrl - Twilio recording URL
 * @param {string} callSid - Twilio call SID
 * @param {string} recordingSid - Twilio recording SID
 * @returns {Promise<Object|null>} - Cloudinary result or null
 */
async function processTwilioRecording(recordingUrl, callSid, recordingSid) {
  try {
    console.log(`🔄 Processing recording: ${recordingSid}`);
    
    // Step 1: Download from Twilio (with auth)
    const buffer = await downloadTwilioRecording(recordingUrl);
    
    // Step 2: Upload to Cloudinary
    const filename = `${callSid}_${recordingSid}`;
    const cloudinaryResult = await uploadToCloudinary(buffer, filename);
    
    if (!cloudinaryResult) {
      console.warn('⚠️ Recording downloaded but not uploaded to Cloudinary');
      return null;
    }
    
    console.log(`✅ Recording processing complete: ${cloudinaryResult.url}`);
    return cloudinaryResult;
    
  } catch (error) {
    console.error('❌ Recording processing failed:', error.message);
    return null;
  }
}

/**
 * Delete a recording from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID of the recording
 * @returns {Promise<boolean>} - True if deletion was successful
 */
async function deleteRecording(publicId) {
  if (!cloudinaryConfigured) {
    console.warn('⚠️ Cannot delete recording - Cloudinary not configured');
    return false;
  }

  try {
    console.log(`☁️ Deleting from Cloudinary: ${publicId}`);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, {
        resource_type: 'video'
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log(`✅ Deleted from Cloudinary:`, result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary deletion failed:', error.message);
    throw error;
  }
}

module.exports = {
  downloadTwilioRecording,
  uploadToCloudinary,
  processTwilioRecording,
  deleteRecording,
  isConfigured: () => cloudinaryConfigured
};
