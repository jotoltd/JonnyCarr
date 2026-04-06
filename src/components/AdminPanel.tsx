import { useState, useEffect } from 'react';
import { RaffleCard } from './RaffleCard';
import { CreateRaffleForm } from './CreateRaffleForm';
import { Button } from './Button';
import { getAllRaffles, closeRaffle, deleteRaffle, getTicketsByRaffleId, drawWinner } from '../lib/api';
import type { Raffle, Ticket } from '../types';
import { Shield, RefreshCw, TicketCheck, AlertCircle, Loader2, X, Lock, User, LogOut, Key } from 'lucide-react';

// Default credentials
const DEFAULT_USERNAME = 'Jonathan';
const DEFAULT_PASSWORD = 'R1l3yj014!';

// Get stored credentials or use defaults
const getStoredCredentials = () => {
  const stored = localStorage.getItem('adminCredentials');
  if (stored) {
    return JSON.parse(stored);
  }
  return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
};

// Save credentials to localStorage
const saveCredentials = (username: string, password: string) => {
  localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
};

export function AdminPanel() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [raffleTickets, setRaffleTickets] = useState<Ticket[]>([]);
  const [showTickets, setShowTickets] = useState(false);
  const [drawResult, setDrawResult] = useState<{winningTicket: number; winner: Ticket | null} | null>(null);
  
  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const credentials = getStoredCredentials();

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRaffles();
      setRaffles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load raffles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRaffles();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === credentials.username && password === credentials.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (currentPassword !== credentials.password) {
      setPasswordChangeError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordChangeError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    saveCredentials(credentials.username, newPassword);
    setPasswordChangeSuccess('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordChangeSuccess('');
    }, 2000);
  };

  const handleCloseRaffle = async (id: string) => {
    try {
      await closeRaffle(id);
      await loadRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close raffle');
    }
  };

  const handleDrawWinner = async (id: string) => {
    try {
      const tickets = await getTicketsByRaffleId(id);
      
      if (tickets.length === 0) {
        setError('No tickets sold for this raffle');
        return;
      }

      // Simulate draw animation
      const winningTicket = tickets[Math.floor(Math.random() * tickets.length)];
      
      await drawWinner(id, winningTicket.ticket_number);
      await loadRaffles();
      
      setDrawResult({
        winningTicket: winningTicket.ticket_number,
        winner: winningTicket
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draw winner');
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this raffle? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteRaffle(id);
      await loadRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete raffle');
    }
  };

  const viewTickets = async (raffle: Raffle) => {
    try {
      const tickets = await getTicketsByRaffleId(raffle.id);
      setRaffleTickets(tickets);
      setSelectedRaffle(raffle);
      setShowTickets(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-12 px-4 sm:px-0">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 sm:px-4 py-2 border text-sm sm:text-base"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 sm:px-4 py-2 border text-sm sm:text-base"
                placeholder="Enter password"
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage raffles and view ticket sales</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowChangePassword(true)} className="text-sm">
            <Key className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Change Password</span>
            <span className="sm:hidden">Password</span>
          </Button>
          <Button variant="secondary" onClick={loadRaffles} className="text-sm">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="text-sm">
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordChangeError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {passwordChangeError}
                </div>
              )}
              {passwordChangeSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                  {passwordChangeSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateRaffleForm onSuccess={loadRaffles} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-600 mt-2 text-sm">Loading raffles...</p>
        </div>
      ) : raffles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <TicketCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No Raffles Yet</h3>
          <p className="text-gray-600 text-sm">Create your first raffle using the button above</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {raffles.map(raffle => (
            <div key={raffle.id} className="relative">
              <RaffleCard
                raffle={raffle}
                isAdmin={true}
                onRefresh={loadRaffles}
                onClose={handleCloseRaffle}
                onDraw={handleDrawWinner}
                onDelete={handleDeleteRaffle}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-16 sm:top-4 sm:right-20 text-xs sm:text-sm"
                onClick={() => viewTickets(raffle)}
              >
                <span className="hidden sm:inline">View Tickets</span>
                <span className="sm:hidden">Tickets</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Tickets Modal */}
      {showTickets && selectedRaffle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedRaffle.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{raffleTickets.length} tickets sold</p>
              </div>
              <button
                onClick={() => setShowTickets(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-3 sm:p-6">
              {raffleTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tickets sold yet</p>
              ) : (
                <div className="overflow-x-auto -mx-3 px-3">
                  <table className="w-full min-w-[400px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Ticket #</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Buyer</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {raffleTickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-indigo-600 text-sm">#{ticket.ticket_number}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-sm">{ticket.buyer_name}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm break-all">{ticket.buyer_email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Draw Result Modal */}
      {drawResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-8 text-center max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TicketCheck className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Winner Drawn!</h3>
            <div className="bg-purple-50 rounded-lg p-4 sm:p-6 mb-4">
              <p className="text-xs sm:text-sm text-purple-700 mb-1 sm:mb-2">Winning Ticket Number</p>
              <p className="text-4xl sm:text-5xl font-bold text-purple-900">#{drawResult.winningTicket}</p>
            </div>
            {drawResult.winner && (
              <div className="text-left bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Winner:</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{drawResult.winner.buyer_name}</p>
                <p className="text-xs sm:text-sm text-gray-600 break-all">{drawResult.winner.buyer_email}</p>
              </div>
            )}
            <Button onClick={() => setDrawResult(null)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
