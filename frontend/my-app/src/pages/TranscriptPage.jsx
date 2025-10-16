import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import { API_ENDPOINTS } from '../config/api';

export default function TranscriptPage() {
  const { callId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.GET_TRANSCRIPT}/${callId}`)
      .then(res => res.json())
      .then(setData);
  }, [callId]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-text-muted">Loading call details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Call Details</h1>
        <p className="text-sm text-text-muted mt-1">Transcript and recording</p>
      </div>

      {/* Recording Player - First for easy access */}
      {data.mp3Url && (
        <Card className="p-6 bg-gradient-to-r from-surface to-surface-light">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Call Recording</h2>
              <p className="text-xs text-text-muted">Listen to the full conversation</p>
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
        <h2 className="text-base font-semibold text-white mb-4">Conversation Transcript</h2>
        <div className="bg-background rounded-md p-4 max-h-96 overflow-y-auto">
          <p className="whitespace-pre-wrap text-sm text-text leading-relaxed">
            {data.transcript || 'No transcript available yet. The conversation may still be in progress.'}
          </p>
        </div>
      </Card>

      {/* Summary and Sentiment in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-3">AI Summary</h2>
          <p className="text-sm text-text-muted">
            {data.summary || 'Summary will be generated after the call completes.'}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-3">Sentiment Analysis</h2>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              data.sentiment === 'positive' ? 'bg-success/20 text-success' :
              data.sentiment === 'negative' ? 'bg-danger/20 text-danger' : 
              'bg-surface-light text-text-muted'
            }`}>
              {data.sentiment === 'positive' ? '😊' :
               data.sentiment === 'negative' ? '😞' : '😐'}
            </div>
            <div>
              <p className={`text-lg font-semibold capitalize ${
                data.sentiment === 'positive' ? 'text-success' :
                data.sentiment === 'negative' ? 'text-danger' : 'text-text-muted'
              }`}>
                {data.sentiment || 'Neutral'}
              </p>
              <p className="text-xs text-text-muted">Call sentiment</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}