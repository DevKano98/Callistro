import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import AgentSelector from '../components/AgentSelector';
import { API_ENDPOINTS } from '../config/api';

export default function CallsDashboard() {
  const [calls, setCalls] = useState([]);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const { currentAgent } = useStore();

  useEffect(() => {
    const fetchCalls = async () => {
      if (!currentAgent?.id) {
        setCalls([]);
        return;
      }

      const res = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${currentAgent.id}`);
      const data = await res.json();
      setCalls(data.calls || []);
    };
    fetchCalls();
  }, [currentAgent]);

  const handleDeleteCall = async (call) => {
    setSelectedCall(call);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API_ENDPOINTS.DELETE_CALL}/${selectedCall.id}`, {
        method: 'DELETE'
      });
      setCalls(calls.filter(c => c.id !== selectedCall.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete call');
    }
  };

  const handleStartCalls = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.START_CALLS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: currentAgent.id }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.initiated > 0) {
          alert(`✅ ${data.message || `Started ${data.initiated} calls!`}`);
        } else {
          alert(`ℹ️ ${data.message || 'No calls were initiated.'}`);
        }
        // Refresh calls
        const callsResponse = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${currentAgent.id}`);
        const callsData = await callsResponse.json();
        setCalls(callsData.calls || []);
      } else {
        alert(`❌ Failed to start calls: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Call initiation error:', error);
      alert(`❌ Error starting calls: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Call History</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and review your calls</p>
      </div>

      {/* Agent Selector */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Agent</h2>
        <AgentSelector />
      </Card>
      
      {currentAgent && (
        <div className="space-y-6">
          {/* Actions Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentAgent.agentName} - Call Logs
              </h3>
              <p className="text-sm text-gray-500">Total calls: {calls.length}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleStartCalls}
              >
                Start Calls
              </Button>
            </div>
          </div>

          {/* Calls List */}
          <div className="space-y-4">
            {calls.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-4">
                    📞
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
                  <p className="text-gray-500">Upload a CSV and click "Start Calls" to begin making calls.</p>
                </div>
              </Card>
            ) : (
              calls.map((call) => (
                <Card key={call.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Call Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-base font-medium text-gray-900">{call.phoneNumber}</span>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={
                            call.status === 'completed' ? { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' } :
                            call.status === 'failed' ? { backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' } :
                            call.status === 'initiated' ? { backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' } :
                            { backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-secondary)' }
                          }
                        >
                          {call.status}
                        </span>
                      </div>
                      
                      {/* Call Details */}
                      <div className="flex items-center gap-4 text-sm">
                        {call.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                navigate(`/transcripts/${call.id}`);
                              } catch (err) {
                                console.error('Navigation error:', err);
                              }
                            }}
                            className="inline-flex items-center text-primary hover:text-primary-hover font-medium bg-transparent border-0 p-0"
                          >
                            View Transcript
                            <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteCall(call)}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {/* Audio Player */}
                      {call.mp3Url && (
                        <div className="mt-4">
                          <audio 
                            controls 
                            src={call.mp3Url} 
                            className="w-full max-w-md rounded-lg shadow-sm"
                            style={{ accentColor: '#4F46E5' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Call"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this call? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete Call
            </Button>
          </div>
        </div>
      </Modal>
        </div>
  );
}
