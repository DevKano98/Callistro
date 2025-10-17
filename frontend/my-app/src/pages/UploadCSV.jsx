import { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import Card from '../components/Card';
import AgentSelector from '../components/AgentSelector';
import { API_ENDPOINTS } from '../config/api';

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentAgent } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !currentAgent) return;

    const formData = new FormData();
    formData.append('csv', file);
    formData.append('agentId', currentAgent.id);

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.UPLOAD_CSV, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Uploaded ${data.count} numbers!`);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Upload Contacts</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Import phone numbers from CSV file</p>
      </div>
      
      <Card className="p-6">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Select Agent</h2>
        <AgentSelector />
      </Card>
      
      {currentAgent && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              Upload CSV for: {currentAgent.agentName}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              CSV file should have a column named 'phone' or 'phoneNumber'
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)] file:cursor-pointer"
                required
              />
            </div>
            
            <Button type="submit" disabled={loading || !file}>
              {loading ? 'Uploading...' : 'Upload Phone Numbers'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}