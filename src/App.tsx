import { useState, useEffect } from 'react';
import { RaffleCard } from './components/RaffleCard';
import { AdminPanel } from './components/AdminPanel';
import { UserAuth } from './components/UserAuth';
import { AccountSettings } from './components/AccountSettings';
import { MyTickets } from './components/MyTickets';
import { getActiveRaffles, getUserByEmail } from './lib/api';
import type { Raffle, User } from './types';
import { Ticket, Users, User as UserIcon, LogOut, Shield, Menu, X, Settings, PoundSterling } from 'lucide-react';

// Admin user name
const ADMIN_USERNAME = 'Jonathan';
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

function App() {
  const [activeTab, setActiveTab] = useState<'raffles' | 'tickets' | 'admin' | 'auth'>('raffles');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

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
  const featuredRaffle = raffles[0] || null;
  const otherRaffles = raffles.slice(1);
  const featuredAvailableTickets = featuredRaffle
    ? featuredRaffle.total_tickets - featuredRaffle.tickets_sold
    : 0;
  const featuredProgress = featuredRaffle
    ? Math.round((featuredRaffle.tickets_sold / featuredRaffle.total_tickets) * 100)
    : 0;
  const featuredRevenue = featuredRaffle
    ? (featuredRaffle.total_tickets * featuredRaffle.price_per_ticket).toFixed(2)
    : '0.00';

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

  const handleUserUpdate = (updated: User) => {
    setUser(updated);
    localStorage.setItem('session_email', updated.email);
  };

  const handleTabChange = (tab: 'raffles' | 'tickets' | 'admin' | 'auth') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-brand-green shadow-lg border-b-4 border-brand-gold sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_SRC}
                alt="Jonny Carr Cues"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleTabChange('raffles')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === 'raffles'
                    ? 'bg-brand-gold text-brand-green-dark'
                    : 'text-brand-cream hover:bg-brand-green-light'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  Raffles
                </span>
              </button>

              {user && (
                <button
                  onClick={() => handleTabChange('tickets')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === 'tickets'
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    My Tickets
                  </span>
                </button>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === 'admin'
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Admin
                  </span>
                </button>
              )}
              
              {user ? (
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-brand-green-light">
                  <span className="text-sm text-brand-cream hidden lg:inline mr-1">Hello, {user.name}</span>
                  <button
                    onClick={() => setShowAccountSettings(true)}
                    className="px-3 py-2 rounded-lg font-medium text-brand-cream hover:bg-brand-green-light transition-colors flex items-center gap-1.5 text-sm"
                    title="Account Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg font-medium text-brand-cream hover:bg-brand-green-light transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleTabChange('auth')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === 'auth'
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
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
              className="md:hidden p-2 rounded-lg text-brand-cream hover:bg-brand-green-light"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-brand-gold bg-brand-green-dark">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => handleTabChange('raffles')}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                  activeTab === 'raffles'
                    ? 'bg-brand-gold text-brand-green-dark'
                    : 'text-brand-cream hover:bg-brand-green-light'
                }`}
              >
                <Ticket className="w-5 h-5" />
                Raffles
              </button>

              {user && (
                <button
                  onClick={() => handleTabChange('tickets')}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'tickets'
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  My Tickets
                </button>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'admin'
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
              )}
              
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-brand-cream border-t border-brand-green-light mt-2 pt-2">
                    Signed in as <span className="font-medium text-brand-gold">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { setShowAccountSettings(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg font-medium text-brand-cream hover:bg-brand-green-light transition-colors flex items-center gap-3"
                  >
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg font-medium text-brand-cream hover:bg-brand-green-light transition-colors flex items-center gap-3"
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
                      ? 'bg-brand-gold text-brand-green-dark'
                      : 'text-brand-cream hover:bg-brand-green-light'
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

      {/* Account Settings Modal */}
      {showAccountSettings && user && (
        <AccountSettings
          user={user}
          onUpdate={handleUserUpdate}
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-brand-green rounded-xl sm:rounded-2xl overflow-hidden border-2 border-brand-gold mb-6 sm:mb-8 shadow-lg">
              <div className="px-6 sm:px-10 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center rounded-full border border-brand-gold/40 bg-brand-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-4">
                    Handmade cue raffles
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-brand-cream mb-2 font-serif">
                    Win a Handmade Jonny Carr Cue
                  </h2>
                  <p className="text-brand-cream-dark text-base sm:text-lg mb-6 max-w-2xl mx-auto lg:mx-0">
                    Enter our exclusive raffles for a chance to own a beautifully crafted, handmade snooker cue.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center lg:items-start gap-3 sm:gap-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2 text-brand-gold bg-brand-green-light/60 rounded-lg px-4 py-3 border border-brand-gold/20">
                      <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold">{raffles.length} Active Raffles</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-gold bg-brand-green-light/60 rounded-lg px-4 py-3 border border-brand-gold/20">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold">{raffles.reduce((acc, r) => acc + r.tickets_sold, 0)} Tickets Sold</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-sm rounded-2xl bg-brand-cream/95 border border-brand-gold/40 shadow-2xl p-4 sm:p-6">
                    <img
                      src={LOGO_SRC}
                      alt="Jonny Carr Cues"
                      className="w-full max-h-[320px] object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="h-1 bg-brand-gold" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brand-green mx-auto"></div>
                <p className="text-brand-green mt-4 font-medium">Loading raffles...</p>
              </div>
            ) : raffles.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-brand-cream-light rounded-xl shadow-sm border-2 border-brand-cream-border">
                <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-brand-cream-border mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-brand-green-dark mb-2">No Active Raffles</h3>
                <p className="text-brand-green text-sm sm:text-base">Check back soon for new raffles!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {featuredRaffle && (
                  <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-brand-gold font-semibold">Featured raffle</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-brand-green-dark">Current Live Draw</h3>
                      </div>
                      <p className="text-sm text-brand-green">Everything is focused on this raffle.</p>
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                      <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-brand-gold font-semibold mb-1">Tickets left</p>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-3xl font-bold text-brand-green-dark">{featuredAvailableTickets}</p>
                            <p className="text-sm text-brand-green">remaining from {featuredRaffle.total_tickets}</p>
                          </div>
                          <Ticket className="w-6 h-6 text-brand-gold flex-shrink-0" />
                        </div>
                      </div>
                      <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-brand-gold font-semibold mb-1">Ticket price</p>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-3xl font-bold text-brand-green-dark">£{featuredRaffle.price_per_ticket}</p>
                            <p className="text-sm text-brand-green">£{featuredRevenue} total prize pot</p>
                          </div>
                          <PoundSterling className="w-6 h-6 text-brand-gold flex-shrink-0" />
                        </div>
                      </div>
                      <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-brand-gold font-semibold mb-1">Live progress</p>
                        <div className="flex items-end justify-between gap-3 mb-3">
                          <div>
                            <p className="text-3xl font-bold text-brand-green-dark">{featuredProgress}%</p>
                            <p className="text-sm text-brand-green">{featuredRaffle.tickets_sold} tickets sold</p>
                          </div>
                          <Users className="w-6 h-6 text-brand-gold flex-shrink-0" />
                        </div>
                        <div className="w-full h-2 rounded-full bg-brand-cream-border overflow-hidden">
                          <div className="h-full bg-brand-green rounded-full" style={{ width: `${featuredProgress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="max-w-4xl mx-auto">
                      <RaffleCard
                        raffle={featuredRaffle}
                        user={user}
                        onRequireLogin={() => handleTabChange('auth')}
                        onRefresh={loadRaffles}
                      />
                    </div>
                  </section>
                )}

                {otherRaffles.length > 0 && (
                  <section className="space-y-4">
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-brand-green-dark">Other Active Raffles</h4>
                      <p className="text-sm text-brand-green">Secondary raffles are shown here when more than one is live.</p>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                      {otherRaffles.map(raffle => (
                        <RaffleCard
                          key={raffle.id}
                          raffle={raffle}
                          user={user}
                          onRequireLogin={() => handleTabChange('auth')}
                          onRefresh={loadRaffles}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'auth' && (
          <UserAuth onLogin={handleLogin} />
        )}

        {activeTab === 'tickets' && user && (
          <MyTickets user={user} />
        )}
        
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-green border-t-4 border-brand-gold mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center gap-3">
            <img src={LOGO_SRC} alt="Jonny Carr Cues" className="h-12 w-auto object-contain opacity-90" />
            <p className="text-brand-cream text-sm">&copy; {new Date().getFullYear()} Jonny Carr Cues Hand Made. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
