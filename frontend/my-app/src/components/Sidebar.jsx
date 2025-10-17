import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Create Agent', path: '/create-agent', icon: '🤖' },
    { name: 'Upload Contacts', path: '/upload-csv', icon: '📥' },
    { name: 'Call History', path: '/calls', icon: '📞' },
    { name: 'Analytics', path: '/sentiment', icon: '📈' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div
      className="w-64 h-screen fixed left-0 top-0 flex flex-col shadow-sm"
      style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Logo Header */}
      <div className="p-6">
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))'
          }}
        >
          <h1 className="text-xl font-bold text-white">Callistro</h1>
          <p className="text-xs text-white/80 mt-1">AI Calling Platform</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const activeStyle = isActive
            ? { backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)' }
            : {};

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? '' : 'text-gray-600 hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text)]'}`}
              style={activeStyle}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>Version 1.0.0</span>
          <span>© 2025 Callisto</span>
        </div>
      </div>
    </div>
  );
}