import { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function CreateAgent() {
  const [agentName, setAgentName] = useState('');
  const [company, setCompany] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentAgent, user } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.CREATE_AGENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, company, prompt, userId: user?.uid }),
      });
      const data = await res.json();
      if (data.id) {
        setCurrentAgent({ id: data.id, agentName: data.agentName, callFlow: data.callFlow });
        alert('Agent created!');
      } else {
        alert('Failed to create agent: ' + (data.error || 'Unknown error'));
      }
    } catch {
      alert('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Create AI Agent</h1>
        <p className="text-sm text-text-muted mt-1">Configure your AI calling agent</p>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Agent Name</label>
            <input
              type="text"
              placeholder="e.g., Sarah"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-md border border-surface-light focus:border-primary focus:outline-none text-white text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Company Name</label>
            <input
              type="text"
              placeholder="e.g., TechCorp Inc"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-md border border-surface-light focus:border-primary focus:outline-none text-white text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Call Flow Instructions</label>
            <textarea
              placeholder="Describe what the agent should say and do. Example: 'Introduce as Sarah from TechCorp. Ask if they use a CRM. If yes, offer a demo. If no, explain benefits and ask if interested.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-md border border-surface-light focus:border-primary focus:outline-none text-white text-sm resize-none"
              rows="5"
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Agent...' : 'Create Agent'}
          </Button>
        </form>
      </Card>
    </div>
  );
}