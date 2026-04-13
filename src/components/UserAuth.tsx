import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import type { User } from '../types';
import { registerUser, loginUser, createAdminUser } from '../lib/api';
import { AlertCircle, Shield } from 'lucide-react';

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

interface UserAuthProps {
  onLogin: (user: User) => void;
}

export function UserAuth({ onLogin }: UserAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login via database
        const user = await loginUser(email, password);
        if (user) {
          onLogin(user);
        }
      } else {
        // Register via database
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const user = await registerUser(email, password, name);
        onLogin(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4 sm:px-0">
      <div className="bg-brand-cream-light rounded-xl shadow-lg border-2 border-brand-cream-border overflow-hidden">
        <div className="h-1 bg-brand-gold" />
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <img
              src={LOGO_SRC}
              alt="Jonny Carr Cues"
              className="w-24 h-auto object-contain mx-auto mb-4"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-brand-green mt-1 text-sm sm:text-base">
              {isLogin ? 'Sign in to your account' : 'Register to buy raffle tickets'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-brand-green-dark mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-green-dark mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-green-dark mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-green text-sm sm:text-base">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-brand-gold hover:text-brand-gold-dark font-semibold mt-1 text-sm sm:text-base"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </div>

          {/* Debug: Create Admin Button */}
          <div className="mt-4 pt-4 border-t border-brand-cream-border">
            <button
              type="button"
              onClick={async () => {
                try {
                  await createAdminUser('josh@gmail.com', 'lalala14', 'Josh');
                  setError('');
                  alert('✅ Admin user created! You can now log in with:\nEmail: josh@gmail.com\nPassword: lalala14');
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Failed';
                  if (msg.includes('already exists')) {
                    alert('ℹ️ Admin user already exists. Try logging in with:\nEmail: josh@gmail.com\nPassword: lalala14');
                  } else {
                    alert('❌ Error: ' + msg);
                  }
                }
              }}
              className="text-xs text-brand-green-dark hover:text-brand-gold flex items-center justify-center gap-1 w-full"
            >
              <Shield className="w-3 h-3" />
              Setup Admin (Josh)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
