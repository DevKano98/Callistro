import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function SettingsPage() {
  const { settings, updateSettings, user } = useStore();
  const [voice, setVoice] = useState(settings.voicePreference);
  const [pitch, setPitch] = useState(settings.pitch);

  useEffect(() => {
    setVoice(settings.voicePreference);
    setPitch(settings.pitch);
  }, [settings]);

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await fetch(`${API_ENDPOINTS.GET_SETTINGS}?userId=${user.uid}`);
        const data = await response.json();
        if (data.settings) {
          updateSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [user, updateSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateSettings({ voicePreference: voice, pitch });
    await fetch(API_ENDPOINTS.UPDATE_SETTINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.uid, voicePreference: voice, pitch }),
    });
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Configure your AI voice preferences</p>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Voice Type</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-[var(--color-text)] text-sm"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Voice Pitch: <span className="text-[var(--color-primary)]">{pitch.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
              <span>Lower (0.5)</span>
              <span>Normal (1.0)</span>
              <span>Higher (2.0)</span>
            </div>
          </div>
          
          <Button type="submit">Save Settings</Button>
        </form>
      </Card>
    </div>
  );
}