import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function SentimentInsights() {
  const [sentimentStats, setSentimentStats] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    const fetchSentimentStats = async () => {
      if (!user?.uid) return;
      
      try {
        // Get user's agents
        const agentsResponse = await fetch(`${API_ENDPOINTS.GET_AGENTS}?userId=${user.uid}`);
        const agentsData = await agentsResponse.json();
        
        if (agentsData.agents) {
          // Get all calls for user's agents and calculate sentiment
          let allCalls = [];
          for (const agent of agentsData.agents) {
            const callsResponse = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${agent.id}`);
            const callsData = await callsResponse.json();
            if (callsData.calls) {
              allCalls = [...allCalls, ...callsData.calls];
            }
          }
          
          // Calculate sentiment stats
          const stats = {
            positive: allCalls.filter(call => call.sentiment === 'positive').length,
            neutral: allCalls.filter(call => call.sentiment === 'neutral').length,
            negative: allCalls.filter(call => call.sentiment === 'negative').length
          };
          
          setSentimentStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch sentiment stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentStats();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4">Sentiment Overview</h2>
        <div className="text-center">Loading...</div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Sentiment Overview</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-900/30 p-4 rounded">
          <div className="text-2xl font-bold text-green-400">{sentimentStats.positive}</div>
          <div>Positive</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-2xl font-bold">{sentimentStats.neutral}</div>
          <div>Neutral</div>
        </div>
        <div className="bg-red-900/30 p-4 rounded">
          <div className="text-2xl font-bold text-red-400">{sentimentStats.negative}</div>
          <div>Negative</div>
        </div>
      </div>
    </Card>
  );
}