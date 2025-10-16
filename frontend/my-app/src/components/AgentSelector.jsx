import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { API_ENDPOINTS } from '../config/api';
import Button from './Button';

export default function AgentSelector() {
  const { agents, currentAgent, setAgents, setCurrentAgent, user } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.GET_AGENTS}?userId=${user.uid}`);
        const data = await response.json();
        if (data.agents) {
          setAgents(data.agents);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [user, setAgents]);

  const handleAgentSelect = (agent) => {
    setCurrentAgent(agent);
  };

  if (loading) {
    return <div className="text-center">Loading agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="bg-surface p-4 rounded-lg">
        <p className="text-gray-400 mb-2">No agents created yet.</p>
        <Button onClick={() => window.location.href = '/create-agent'}>
          Create Your First Agent
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Select Agent</h3>
      <div className="space-y-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => handleAgentSelect(agent)}
            className={`w-full text-left p-3 rounded transition ${
              currentAgent?.id === agent.id
                ? 'bg-primary text-white'
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            <div className="font-medium">{agent.agentName}</div>
            <div className="text-sm opacity-75">{agent.company}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
