import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import UploadCSV from './pages/UploadCSV';
import CallsDashboard from './pages/CallsDashboard';
import TranscriptPage from './pages/TranscriptPage';
import SentimentInsights from './pages/SentimentInsights';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function ProtectedRoute({ children }) {
  const { user } = useStore();
  return user ? children : <Navigate to="/auth" />;
}

export default function App() {
  const { user } = useStore();

  return (
    <BrowserRouter>
      {user ? (
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden ml-64">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/create-agent" element={<CreateAgent />} />
                  <Route path="/upload-csv" element={<UploadCSV />} />
                  <Route path="/calls" element={<CallsDashboard />} />
                  <Route path="/transcripts/:callId" element={<TranscriptPage />} />
                  <Route path="/sentiment" element={<SentimentInsights />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/auth" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}