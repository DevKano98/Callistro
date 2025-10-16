import { useState } from 'react';
import { auth, useStore } from '../store/useStore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Button from '../components/Button';

const DEVELOPMENT_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (DEVELOPMENT_MODE) {
        // Development mode: Mock login
        console.log('🔧 Dev mode login:', email);
        setUser({ uid: 'dev-user-' + Date.now(), email: email || 'dev@example.com' });
        return;
      }

      // Production: Use Firebase
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      alert('Authentication failed: ' + err.message + '\n\nℹ️ To bypass Firebase, add VITE_DEV_MODE=true to your .env file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-surface p-8 rounded-lg w-full max-w-md border border-surface-light">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Callisto
          </h1>
          <p className="text-sm text-text-muted">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-md border border-surface-light focus:border-primary focus:outline-none text-white text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-md border border-surface-light focus:border-primary focus:outline-none text-white text-sm"
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full mt-6">
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-text-muted">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}