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
      // Validate email format
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      // Validate password
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      if (DEVELOPMENT_MODE) {
        // Development mode: Mock login
        console.log('🔧 Dev mode login:', email);
        setUser({ uid: 'dev-user-' + Date.now(), email });
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
      
      let errorMessage = 'Authentication failed: ';
      
      if (err.code === 'auth/invalid-email') {
        errorMessage += 'Invalid email format';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage += 'Email already registered. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage += 'Password should be at least 6 characters';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage += 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage += 'Incorrect password';
      } else {
        errorMessage += err.message;
      }
      
      errorMessage += '\n\n💡 Tip: Enable Email/Password auth in Firebase Console';
      errorMessage += '\n   Or use Development Mode (see README)';
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo and Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Callisto
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Get started for free'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-light focus:ring-opacity-20 text-gray-900 text-sm transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-light focus:ring-opacity-20 text-gray-900 text-sm transition-colors"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 text-base font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-gray-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500 space-x-4">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}