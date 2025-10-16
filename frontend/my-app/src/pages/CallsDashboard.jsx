import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Card from '../components/Card';
import Button from '../components/Button';
import AgentSelector from '../components/AgentSelector';
import { API_ENDPOINTS } from '../config/api';

export default function CallsDashboard() {
  const [calls, setCalls] = useState([]);
  const { currentAgent } = useStore();

  useEffect(() => {
    const fetchCalls = async () => {
      const res = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${currentAgent?.id || ''}`);
      const data = await res.json();
      setCalls(data.calls || []);
    };
    fetchCalls();
  }, [currentAgent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Call History</h1>
        <p className="text-sm text-text-muted mt-1">Manage and review your calls</p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-white mb-4">Select Agent</h2>
        <AgentSelector />
      </Card>
      
      {currentAgent && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-white">
                {currentAgent.agentName} - Call Logs
              </h3>
              <p className="text-sm text-text-muted">Total calls: {calls.length}</p>
            </div>
            <Button
              onClick={async () => {
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
                    alert(`❌ Error starting calls: ${error.message}\n\nCheck the browser console for more details.`);
                  }
                }}
              >
                Start Calls
              </Button>
          </div>
          <div className="space-y-3">
            {calls.length === 0 ? (
              <Card className="p-6">
                <div className="text-center text-text-muted">
                  <p>No calls found for this agent.</p>
                  <p className="text-sm mt-2">Upload a CSV and click "Start Calls" to begin.</p>
                </div>
              </Card>
            ) : (
              calls.map((call) => (
                <Card key={call.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-base font-mono text-white">{call.phoneNumber}</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${
                          call.status === 'completed' ? 'bg-success/20 text-success' :
                          call.status === 'failed' ? 'bg-danger/20 text-danger' : 
                          call.status === 'initiated' ? 'bg-primary/20 text-primary' :
                          'bg-surface-light text-text-muted'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                      
                      {call.status === 'completed' && (
                        <div className="flex items-center gap-3">
                          <a 
                            href={`/transcripts/${call.id}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            View Full Transcript & Details →
                          </a>
                        </div>
                      )}
                      
                      {call.mp3Url && (
                        <div className="mt-3">
                          <audio 
                            controls 
                            src={call.mp3Url} 
                            className="w-full max-w-md h-9"
                            style={{ accentColor: '#3b82f6' }}
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
    </div>
  );
}