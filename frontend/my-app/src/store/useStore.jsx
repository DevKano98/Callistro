import { create } from 'zustand';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// 🔧 DEVELOPMENT MODE: Set to true to bypass Firebase Auth
const DEVELOPMENT_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

const firebaseConfig = {
   apiKey: "AIzaSyCK0ml3tyqwd1t4MYGUFtjzvnQyVCiVjEY",
  authDomain: "callistro-35865.firebaseapp.com",
  databaseURL: "https://callistro-35865-default-rtdb.firebaseio.com",
  projectId: "callistro-35865",
  storageBucket: "callistro-35865.firebasestorage.app",
  messagingSenderId: "388936894177",
  appId: "1:388936894177:web:bd80258ee38eb05202d9a0"
};

let app, auth;

// Initialize Firebase only if not in dev mode
if (!DEVELOPMENT_MODE) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('💡 Enable VITE_DEV_MODE=true to bypass Firebase');
  }
} else {
  console.log('🔧 Development Mode: Firebase Auth bypassed');
  // Mock auth for development
  auth = {
    currentUser: { uid: 'dev-user-123', email: 'dev@example.com' },
    signOut: () => Promise.resolve()
  };
}

const useStore = create((set) => {
  // In development mode, auto-login
  if (DEVELOPMENT_MODE) {
    console.log('🔧 Auto-logged in as dev@example.com');
    setTimeout(() => {
      set({ user: { uid: 'dev-user-123', email: 'dev@example.com' } });
    }, 100);
  } else {
    // Production: Use Firebase auth state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ user: { uid: user.uid, email: user.email } });
      } else {
        set({ user: null });
      }
    });
  }

  return {
    user: DEVELOPMENT_MODE ? { uid: 'dev-user-123', email: 'dev@example.com' } : null,
    currentAgent: null,
    agents: [],
    calls: [],
    settings: { voicePreference: 'female', pitch: 1.0 },
    setUser: (user) => set({ user }),
    setCurrentAgent: (agent) => set({ currentAgent: agent }),
    setAgents: (agents) => set({ agents }),
    setCalls: (calls) => set({ calls }),
    updateSettings: (settings) =>
      set((state) => ({ settings: { ...state.settings, ...settings } })),
  };
});

export { useStore, auth };