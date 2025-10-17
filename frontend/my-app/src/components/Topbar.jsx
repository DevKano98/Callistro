import { auth, useStore } from '../store/useStore';
import { signOut } from 'firebase/auth';

export default function Topbar() {
  const { user } = useStore();
  
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search calls, agents, or transcripts..."
            className="w-full pl-10 pr-4 py-2 text-sm text-[var(--color-text)] bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', boxShadow: '0 0 0 2px var(--color-surface)' }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-700">{user?.email}</div>
            <div className="text-xs text-gray-500">Admin Account</div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="ml-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}