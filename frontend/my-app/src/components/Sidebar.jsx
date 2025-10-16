import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Create Agent', path: '/create-agent' },
    { name: 'Upload Contacts', path: '/upload-csv' },
    { name: 'Call History', path: '/calls' },
    { name: 'Analytics', path: '/sentiment' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-surface-light flex flex-col">
      <div className="p-6 border-b border-surface-light">
        <h1 className="text-xl font-bold text-white">Callisto</h1>
        <p className="text-xs text-text-muted mt-1">AI Calling Platform</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-surface-light hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-surface-light">
        <div className="text-xs text-text-muted">
          <div>Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}