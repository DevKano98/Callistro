import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalCalls: 0,
    completedCalls: 0,
    leadsGenerated: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await fetch(`${API_ENDPOINTS.GET_DASHBOARD_STATS}?userId=${user.uid}`);
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Recent activity: fetch user's agents and recent calls
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.uid) return;

      try {
        // Fetch agents for the user
        const agentsRes = await fetch(`${API_ENDPOINTS.GET_AGENTS}?userId=${user.uid}`);
        const agentsData = await agentsRes.json();
        const agents = agentsData.agents || [];

        // For each agent, fetch calls and collect them
        const callsPromises = agents.map(async (agent) => {
          const res = await fetch(`${API_ENDPOINTS.GET_CALLS}?agentId=${agent.id}`);
          const data = await res.json();
          return (data.calls || []).map(c => ({ ...c, agentName: agent.agentName }));
        });

        const callsArrays = await Promise.all(callsPromises);
        const allCalls = callsArrays.flat();

        // Sort by completedAt or createdAt desc
        allCalls.sort((a, b) => {
          const ta = new Date(a.completedAt || a.createdAt || 0).getTime();
          const tb = new Date(b.completedAt || b.createdAt || 0).getTime();
          return tb - ta;
        });

        setRecentCalls(allCalls.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch recent calls:', err);
      }
    };

    fetchRecent();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Agents',
      value: stats.activeAgents,
      icon: '🤖',
      color: 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]',
      growth: '+12%'
    },
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      icon: '📞',
      color: 'bg-indigo-50 text-indigo-600',
      growth: '+8%'
    },
    {
      title: 'Completed Calls',
      value: stats.completedCalls,
      icon: '✅',
      color: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      growth: '+24%'
    },
    {
      title: 'Leads Generated',
      value: stats.leadsGenerated,
      icon: '🎯',
      color: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
      growth: '+18%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your calling campaigns</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                {stat.icon}
              </div>
              
              <div>
                {/* Title */}
                <div className="text-sm font-medium text-gray-500">
                  {stat.title}
                </div>
                
                {/* Value */}
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                    {stat.growth}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentCalls.length === 0 ? (
            <div className="text-sm text-gray-500">No recent activity found.</div>
          ) : (
            recentCalls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-surface-light)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)]">
                  📞
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {call.summary ? call.summary : `Call with ${call.phoneNumber}`}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {call.agentName ? `${call.agentName} · ` : ''}{call.completedAt ? new Date(call.completedAt).toLocaleString() : new Date(call.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}