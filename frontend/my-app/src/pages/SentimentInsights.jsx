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
        const agentsResponse = await fetch(`${API_ENDPOINTS.GET_AGENTS}?userId=${user.uid}`);
        const agentsData = await agentsResponse.json();
        
        if (agentsData.agents) {
          let allCalls = [];
          for (const agent of agentsData.agents) {
            const callsResponse = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${agent.id}`);
            const callsData = await callsResponse.json();
            if (callsData.calls) {
              allCalls = [...allCalls, ...callsData.calls];
            }
          }
          
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <Card className="p-8">
          <div className="animate-pulse grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const total = sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative;
  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Sentiment Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Track customer satisfaction and call outcomes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Positive Sentiment */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[var(--color-success-bg)] flex items-center justify-center text-2xl">
              😊
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-success)] mb-1">
                {sentimentStats.positive}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Positive Calls ({getPercentage(sentimentStats.positive)}%)
              </div>
            </div>
          </div>
        </Card>

        {/* Neutral Sentiment */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
              😐
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700 mb-1">
                {sentimentStats.neutral}
              </div>
              <div className="text-sm text-gray-500">
                Neutral Calls ({getPercentage(sentimentStats.neutral)}%)
              </div>
            </div>
          </div>
        </Card>

        {/* Negative Sentiment */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center text-2xl">
              😞
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-danger)] mb-1">
                {sentimentStats.negative}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                Negative Calls ({getPercentage(sentimentStats.negative)}%)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sentiment Progress */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Distribution</h2>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="transition-all duration-500" 
              style={{ width: `${getPercentage(sentimentStats.positive)}%`, backgroundColor: 'var(--color-success)' }}
            />
            <div 
              className="transition-all duration-500" 
              style={{ width: `${getPercentage(sentimentStats.neutral)}%`, backgroundColor: 'var(--color-border)' }}
            />
            <div 
              className="transition-all duration-500" 
              style={{ width: `${getPercentage(sentimentStats.negative)}%`, backgroundColor: 'var(--color-danger)' }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <div>Positive ({getPercentage(sentimentStats.positive)}%)</div>
          <div>Neutral ({getPercentage(sentimentStats.neutral)}%)</div>
          <div>Negative ({getPercentage(sentimentStats.negative)}%)</div>
        </div>
      </Card>
    </div>
  );
}