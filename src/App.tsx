import { useState, useEffect } from 'react';
import { RaffleCard } from './components/RaffleCard';
import { AdminPanel } from './components/AdminPanel';
import { getActiveRaffles } from './lib/api';
import type { Raffle } from './types';
import { Ticket, Users, Sparkles, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'raffles' | 'admin'>('raffles');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
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
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'raffles' ? (
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
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
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
