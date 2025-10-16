import { auth, useStore } from '../store/useStore';
import { signOut } from 'firebase/auth';

export default function Topbar() {
  const { user } = useStore();
  
  return (
    <header className="bg-surface border-b border-surface-light px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{user?.email}</div>
          <div className="text-xs text-text-muted">Admin</div>
        </div>
      </div>
      <button
        onClick={() => signOut(auth)}
        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors"
      >
        Sign Out
      </button>
    </header>
  );
}