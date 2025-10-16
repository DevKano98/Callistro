import { create } from 'zustand';

// DEVELOPMENT MODE STORE - No Firebase required
// Use this when Firebase auth is not configured

const mockUser = {
  uid: 'dev-user-123',
  email: 'dev@example.com'
};

const useStore = create((set) => ({
  user: mockUser, // Auto-logged in for development
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
}));

// Mock auth object for compatibility
const auth = {
  currentUser: mockUser,
  signOut: () => Promise.resolve()
};

export { useStore, auth };
