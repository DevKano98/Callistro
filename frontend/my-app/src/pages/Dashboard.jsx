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

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Monitor your calling campaigns</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Active Agents</div>
          <div className="text-3xl font-bold text-white">{stats.activeAgents}</div>
        </Card>
        
        <Card className="p-5">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Total Calls</div>
          <div className="text-3xl font-bold text-white">{stats.totalCalls}</div>
        </Card>
        
        <Card className="p-5">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Completed</div>
          <div className="text-3xl font-bold text-success">{stats.completedCalls}</div>
        </Card>
        
        <Card className="p-5">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Leads Generated</div>
          <div className="text-3xl font-bold text-warning">{stats.leadsGenerated}</div>
        </Card>
      </div>
    </div>
  );
}