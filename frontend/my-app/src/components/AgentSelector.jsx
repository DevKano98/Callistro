import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import Button from './Button';
import Modal from './Modal';

export default function AgentSelector() {
  const navigate = useNavigate();
  const { agents, currentAgent, setAgents, setCurrentAgent, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

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

  const handleDeleteClick = (agent, e) => {
    e.stopPropagation(); // Prevent selecting the agent when clicking delete
    setAgentToDelete(agent);
    setDeleteModalOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    try {
      setLoading(true);
      const res = await apiRequest(`${API_ENDPOINTS.DELETE_AGENT}/${agentToDelete.id}?userId=${user?.uid}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete agent');
      }

      // Update local state
      setAgents(agents.filter(a => a.id !== agentToDelete.id));
      if (currentAgent?.id === agentToDelete.id) {
        setCurrentAgent(null);
      }
      setDeleteModalOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[var(--color-surface)]">
        <p className="text-[var(--color-text-secondary)] mb-2">No agents created yet.</p>
        <Button onClick={() => navigate('/create-agent')}>
          Create Your First Agent
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-[var(--color-surface)]">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Select Agent</h3>
      <div className="space-y-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => handleAgentSelect(agent)}
            className={`w-full text-left p-3 rounded transition ${
              currentAgent?.id === agent.id
                ? ''
                : ''
            }`}
            style={currentAgent?.id === agent.id ? { backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' } : { backgroundColor: 'transparent', color: 'var(--color-text)' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{agent.agentName}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{agent.company}</div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(agent, e)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors rounded-full hover:bg-[var(--color-danger-bg)]"
              >
                <span className="sr-only">Delete agent</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </button>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAgentToDelete(null);
        }}
        title="Delete Agent"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Are you sure you want to delete <span className="font-medium text-[var(--color-text)]">{agentToDelete?.agentName}</span>?
            This will permanently delete the agent and all associated calls, transcripts, and recordings.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setAgentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAgent}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Agent'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
