import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export default function TranscriptPage() {
  const { callId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!callId) return;

    let mounted = true;
    const fetchTranscript = async () => {
      console.debug('[TranscriptPage] fetching transcript for callId:', callId);
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`${API_ENDPOINTS.GET_TRANSCRIPT}/${callId}`);
        console.debug('[TranscriptPage] fetch completed, status:', res.status);
        const json = await res.json();
        console.debug('[TranscriptPage] response json:', json);
        if (!mounted) return;
        if (!res.ok) {
          setError(json.error || 'Failed to load transcript');
          setData(null);
        } else {
          setData(json);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Transcript fetch failed:', err);
        setError(err.message || 'Network error');
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTranscript();
    return () => { mounted = false; };
  }, [callId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-[var(--color-text-secondary)]">Loading call details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Unable to load transcript</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Call Details</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Transcript and recording</p>
      </div>

      {/* Recording Player - First for easy access */}
      {data.mp3Url && (
        <Card className="p-6 bg-gradient-to-r from-surface to-surface-light">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
              </svg>
            </div>
            <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">Call Recording</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Listen to the full conversation</p>
            </div>
          </div>
          <audio 
            controls 
            src={data.mp3Url} 
            className="w-full h-10"
            style={{ accentColor: '#3b82f6' }}
          />
        </Card>
      )}

      {/* Transcript */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Conversation Transcript</h2>
        <div className="bg-[var(--color-background)] rounded-md p-4 max-h-96 overflow-y-auto">
          <p className="whitespace-pre-wrap text-sm text-[var(--color-text)] leading-relaxed">
            {data.transcript || 'No transcript available yet. The conversation may still be in progress.'}
          </p>
        </div>
      </Card>

      {/* Summary and Sentiment in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">AI Summary</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
            {data.summary || 'Summary will be generated after the call completes.'}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Sentiment Analysis</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={
              data.sentiment === 'positive' ? { backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' } :
              data.sentiment === 'negative' ? { backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)' } :
              { backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-secondary)' }
            }>
              {data.sentiment === 'positive' ? '😊' :
               data.sentiment === 'negative' ? '😞' : '😐'}
            </div>
            <div>
              <p className="text-lg font-semibold capitalize" style={
                data.sentiment === 'positive' ? { color: 'var(--color-success)' } :
                data.sentiment === 'negative' ? { color: 'var(--color-danger)' } :
                { color: 'var(--color-text-secondary)' }
              }>
                {data.sentiment || 'Neutral'}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Call sentiment</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}