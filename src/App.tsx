import { useState, useEffect } from 'react';
import { RaffleCard } from './components/RaffleCard';
import { AdminPanel } from './components/AdminPanel';
import { UserAuth } from './components/UserAuth';
import { getActiveRaffles } from './lib/api';
import type { Raffle, User } from './types';
import { Ticket, Users, Sparkles, User as UserIcon, LogOut, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'raffles' | 'admin' | 'auth'>('raffles');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Check for logged in user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Secret admin access - triple-click on logo
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 3) {
        setShowAdminModal(true);
        setClickCount(0);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveRaffles();
      setRaffles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load raffles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRaffles();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setActiveTab('raffles');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput === 'admin123') {
      setShowAdminModal(false);
      setActiveTab('admin');
      setAdminKeyInput('');
    } else {
      alert('Invalid admin key');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Access Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Admin Access
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAdminAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Key
                </label>
                <input
                  type="password"
                  value={adminKeyInput}
                  onChange={e => setAdminKeyInput(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border"
                  placeholder="Enter admin key"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleLogoClick}
              title="Triple-click for admin access"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jonny Carr Cue</h1>
                <p className="text-xs text-gray-500">Your chance to win amazing prizes!</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('raffles')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'raffles'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Raffles
                </span>
              </button>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'auth'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Login / Register
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to Jonny Carr Cue
                </h2>
                <p className="text-indigo-100 text-lg mb-6">
                  Buy tickets for our exciting raffles and be in with a chance to win amazing prizes! 
                  All proceeds go to great causes.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    <span>{raffles.length} Active Raffles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{raffles.reduce((acc, r) => acc + r.tickets_sold, 0)} Tickets Sold</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading raffles...</p>
              </div>
            ) : raffles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Raffles</h3>
                <p className="text-gray-600">Check back soon for new raffles!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {raffles.map(raffle => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onRefresh={loadRaffles}
                    user={user}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'auth' && (
          <UserAuth onLogin={handleLogin} />
        )}
        
        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Jonny Carr Cue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
