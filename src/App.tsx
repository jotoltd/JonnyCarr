import { useState, useEffect } from 'react';
import { RaffleCard } from './components/RaffleCard';
import { AdminPanel } from './components/AdminPanel';
import { UserAuth } from './components/UserAuth';
import { getActiveRaffles, getUserByEmail } from './lib/api';
import type { Raffle, User } from './types';
import { Ticket, Users, Sparkles, User as UserIcon, LogOut, Shield, Menu, X } from 'lucide-react';

// Admin user name
const ADMIN_USERNAME = 'Jonathan';

function App() {
  const [activeTab, setActiveTab] = useState<'raffles' | 'admin' | 'auth'>('raffles');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const sessionEmail = localStorage.getItem('session_email');
    if (sessionEmail) {
      getUserByEmail(sessionEmail).then(u => {
        if (u) setUser(u);
        else localStorage.removeItem('session_email');
      });
    }
  }, []);

  // No localStorage persistence - all user data in database only
  const isAdmin = user?.name === ADMIN_USERNAME;

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
    localStorage.setItem('session_email', userData.email);
    setActiveTab('raffles');
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('session_email');
    setActiveTab('raffles');
    setMobileMenuOpen(false);
  };

  const handleTabChange = (tab: 'raffles' | 'admin' | 'auth') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Jonny Carr Cue</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Your chance to win amazing prizes!</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleTabChange('raffles')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === 'raffles'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  Raffles
                </span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Admin
                  </span>
                </button>
              )}
              
              {user ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <span className="text-sm text-gray-600 hidden lg:inline">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleTabChange('auth')}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === 'auth'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4" />
                    Login
                  </span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => handleTabChange('raffles')}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                  activeTab === 'raffles'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Ticket className="w-5 h-5" />
                Raffles
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
              )}
              
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-100 mt-2 pt-2">
                    Signed in as <span className="font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleTabChange('auth')}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'auth'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-6 sm:mb-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                  Welcome to Jonny Carr Cue
                </h2>
                <p className="text-indigo-100 text-base sm:text-lg mb-4 sm:mb-6">
                  Buy tickets for our exciting raffles and be in with a chance to win amazing prizes! 
                  All proceeds go to great causes.
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{raffles.length} Active Raffles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{raffles.reduce((acc, r) => acc + r.tickets_sold, 0)} Tickets Sold</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading raffles...</p>
              </div>
            ) : raffles.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Active Raffles</h3>
                <p className="text-gray-600 text-sm sm:text-base">Check back soon for new raffles!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {raffles.map(raffle => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onRefresh={loadRaffles}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'auth' && (
          <UserAuth onLogin={handleLogin} />
        )}
        
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Jonny Carr Cue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
