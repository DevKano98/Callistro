const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

const db = admin.firestore();

// Initialize storage bucket safely
let bucket = null;
try {
  bucket = getStorage().bucket();
} catch (error) {
  console.warn('Firebase Storage bucket not configured. File uploads will be disabled.');
  console.warn('To enable storage, set FIREBASE_STORAGE_BUCKET in your .env file');
}

// Firestore
const addDocument = async (collection, data) => {
  try {
    return await db.collection(collection).add(data);
  } catch (error) {
    console.error(`Error adding document to ${collection}:`, error);
    throw error;
  }
};

const getDocument = async (collection, id) => {
  try {
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error(`Error getting document ${id} from ${collection}:`, error);
    throw error;
  }
};

const updateDocument = async (collection, id, data) => {
  try {
    await db.collection(collection).doc(id).update(data);
  } catch (error) {
    console.error(`Error updating document ${id} in ${collection}:`, error);
    throw error;
  }
};

const deleteDocument = async (collection, id) => {
  try {
    await db.collection(collection).doc(id).delete();
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collection}:`, error);
    throw error;
  }
};

const getDocuments = async (collection, field, value) => {
  try {
    const snapshot = await db.collection(collection).where(field, '==', value).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collection} where ${field}==${value}:`, error);
    throw error;
  }
};

const getAllDocuments = async (collection) => {
  try {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting all documents from ${collection}:`, error);
    throw error;
  }
};

// Storage
const uploadFile = async (filename, buffer) => {
  // SKIP UPLOAD IF NO BUCKET - Don't throw error, just return null
  if (!bucket) {
    console.warn('⚠️ Skipping recording upload - FIREBASE_STORAGE_BUCKET not configured');
    return null;
  }
  
  try {
    const file = bucket.file(filename);
    await file.save(buffer, { contentType: 'audio/mpeg' });
    await file.makePublic();
    return file.publicUrl();
  } catch (error) {
    console.error('❌ Firebase Storage upload failed:', error.message);
    return null;
  }
};

module.exports = {
  addDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  getAllDocuments,
  uploadFile,
  db,
  bucket,
};