import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { RaffleCard } from './RaffleCard';
import { CreateRaffleForm } from './CreateRaffleForm';
import { Button } from './Button';
import { PayPalSettingsModal } from './PayPalSettings';
import { SkillQuestionBank } from './SkillQuestionBank';
import { getAllRaffles, closeRaffle, deleteRaffle, getTicketsByRaffleId, drawWinner, getAllUsers, updateUser, deleteUser } from '../lib/api';
import type { Raffle, Ticket, User } from '../types';
import { RefreshCw, TicketCheck, AlertCircle, Loader2, X, LogOut, Key, CreditCard, Users } from 'lucide-react';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

async function sendWinnerEmail(params: {
  winner_name: string;
  winner_email: string;
  raffle_title: string;
  winning_ticket: string;
  prize_description: string;
}) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) return;
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, 'winner_notification', params, EMAILJS_PUBLIC_KEY);
  } catch {
    // Silent fail — don't block the draw
  }
}

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [raffleTickets, setRaffleTickets] = useState<Ticket[]>([]);
  const [showTickets, setShowTickets] = useState(false);
  const [drawResult, setDrawResult] = useState<{winningTicket: number; winner: Ticket | null} | null>(null);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [raffleToDraw, setRaffleToDraw] = useState<Raffle | null>(null);
  const [winningTicketInput, setWinningTicketInput] = useState('');
  const [drawError, setDrawError] = useState('');
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const [showPayPalSettings, setShowPayPalSettings] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');

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

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserError('');
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadRaffles();
    loadUsers();
  }, []);

  const handleStartEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword('');
    setUserError('');
    setUserSuccess('');
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditUserName('');
    setEditUserEmail('');
    setEditUserPassword('');
  };

  const handleSaveUser = async (id: string) => {
    if (!editUserName.trim() || !editUserEmail.trim()) {
      setUserError('Name and email are required');
      return;
    }

    try {
      setUserError('');
      setUserSuccess('');
      await updateUser(id, {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        ...(editUserPassword.trim() ? { password: editUserPassword.trim() } : {}),
      });
      await loadUsers();
      setEditingUserId(null);
      setEditUserName('');
      setEditUserEmail('');
      setEditUserPassword('');
      setUserSuccess('User updated');
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.name === 'Jonathan') {
      setUserError('The main admin user cannot be deleted');
      return;
    }

    if (!confirm(`Delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setUserError('');
      setUserSuccess('');
      await deleteUser(user.id);
      await loadUsers();
      setUserSuccess('User deleted');
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (newPassword.length < 4) {
      setPasswordChangeError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    setPasswordChangeSuccess('Password changed successfully!');
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
      const raffle = raffles.find((item) => item.id === id) || null;
      const tickets = await getTicketsByRaffleId(id);
      
      if (tickets.length === 0) {
        setError('No tickets sold for this raffle');
        return;
      }

      setDrawError('');
      setWinningTicketInput('');
      setRaffleToDraw(raffle);
      setRaffleTickets(tickets);
      setShowDrawModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draw winner');
    }
  };

  const confirmDrawWinner = async () => {
    if (!raffleToDraw) return;

    const winningNumber = parseInt(winningTicketInput, 10);
    if (Number.isNaN(winningNumber)) {
      setDrawError('Enter a valid winning ticket number');
      return;
    }

    const winningTicket = raffleTickets.find((ticket) => ticket.ticket_number === winningNumber) || null;
    if (!winningTicket) {
      setDrawError('That ticket number has not been sold for this raffle');
      return;
    }

    try {
      setDrawError('');
      await drawWinner(raffleToDraw.id, winningNumber);
      
      // Send winner notification email
      if (winningTicket) {
        await sendWinnerEmail({
          winner_name: winningTicket.buyer_name,
          winner_email: winningTicket.buyer_email,
          raffle_title: raffleToDraw.title,
          winning_ticket: winningTicket.ticket_number.toString(),
          prize_description: raffleToDraw.description || 'Handmade Jonny Carr Cue'
        });
      }
      
      await loadRaffles();
      setShowDrawModal(false);
      setRaffleToDraw(null);
      setWinningTicketInput('');
      setDrawResult({
        winningTicket: winningNumber,
        winner: winningTicket
      });
    } catch (err) {
      setDrawError(err instanceof Error ? err.message : 'Failed to draw winner');
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">Admin Panel</h2>
          <p className="text-brand-green text-sm sm:text-base">Manage raffles and view ticket sales</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowPayPalSettings(true)} className="text-sm">
            <CreditCard className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">PayPal Settings</span>
            <span className="sm:hidden">PayPal</span>
          </Button>
          <Button variant="secondary" onClick={() => setShowChangePassword(true)} className="text-sm">
            <Key className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Change Password</span>
            <span className="sm:hidden">Password</span>
          </Button>
          <Button variant="secondary" onClick={loadRaffles} className="text-sm">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onLogout} className="text-sm">
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* PayPal Settings Modal */}
      <PayPalSettingsModal
        isOpen={showPayPalSettings}
        onClose={() => setShowPayPalSettings(false)}
      />

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-brand-cream-border">
            <div className="h-1 bg-brand-gold" />
            <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-gold" />
                Change Password
              </h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-brand-green hover:text-brand-green-dark"
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
                <div className="bg-brand-green-muted border border-brand-green rounded-lg p-3 text-brand-green-dark text-sm">
                  {passwordChangeSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-green-dark mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
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
        </div>
      )}

      <CreateRaffleForm onSuccess={loadRaffles} />

      <SkillQuestionBank />

      <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-gold" />
              User Management
            </h3>
            <p className="text-sm text-brand-green">View and manage all registered users</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadUsers}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {userError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {userError}
          </div>
        )}
        {userSuccess && (
          <div className="bg-brand-green-muted border border-brand-green rounded-lg p-3 text-brand-green-dark text-sm">
            {userSuccess}
          </div>
        )}

        {isLoadingUsers ? (
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-brand-green">No users found.</p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <div key={user.id} className="bg-white rounded-lg border border-brand-cream-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-brand-green-dark">{user.name}</p>
                      <p className="text-sm text-brand-green break-all">{user.email}</p>
                      <p className="text-xs text-brand-green mt-1">Joined {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                    {!isEditing && (
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button size="sm" variant="secondary" onClick={() => handleStartEditUser(user)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-brand-green-dark mb-1">Name</label>
                        <input
                          type="text"
                          value={editUserName}
                          onChange={(e) => setEditUserName(e.target.value)}
                          className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-green-dark mb-1">Email</label>
                        <input
                          type="email"
                          value={editUserEmail}
                          onChange={(e) => setEditUserEmail(e.target.value)}
                          className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-green-dark mb-1">New Password (optional)</label>
                        <input
                          type="password"
                          value={editUserPassword}
                          onChange={(e) => setEditUserPassword(e.target.value)}
                          className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                          placeholder="Leave blank to keep existing password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveUser(user.id)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={handleCancelEditUser}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 flex items-center gap-2 text-sm" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-green" />
          <p className="text-brand-green mt-2 text-sm">Loading raffles...</p>
        </div>
      ) : raffles.length === 0 ? (
        <div className="text-center py-12 bg-brand-cream-light rounded-xl border-2 border-brand-cream-border">
          <TicketCheck className="w-12 h-12 text-brand-cream-border mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-green-dark">No Raffles Yet</h3>
          <p className="text-brand-green text-sm">Create your first raffle using the button above</p>
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
          <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-brand-cream-border">
            <div className="h-1 bg-brand-gold" />
            <div className="p-4 sm:p-6 border-b border-brand-cream-border flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark truncate">{selectedRaffle.title}</h3>
                <p className="text-xs sm:text-sm text-brand-green">{raffleTickets.length} tickets sold</p>
              </div>
              <button
                onClick={() => setShowTickets(false)}
                className="text-brand-green hover:text-brand-green-dark flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-3 sm:p-6">
              {raffleTickets.length === 0 ? (
                <p className="text-center text-brand-green py-8">No tickets sold yet</p>
              ) : (
                <div className="overflow-x-auto -mx-3 px-3">
                  <table className="w-full min-w-[400px]">
                    <thead className="bg-brand-cream">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-brand-green-dark">Ticket #</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-brand-green-dark">Buyer</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-brand-green-dark">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-cream-border">
                      {raffleTickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-brand-gold text-sm">#{ticket.ticket_number}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-brand-green-dark text-sm">{ticket.buyer_name}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-brand-green text-sm break-all">{ticket.buyer_email}</td>
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

      {showDrawModal && raffleToDraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-md w-full border-2 border-brand-cream-border">
            <div className="h-1 bg-brand-gold" />
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark">Enter Winning Ticket</h3>
                  <p className="text-sm text-brand-green">{raffleToDraw.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDrawModal(false);
                    setRaffleToDraw(null);
                    setWinningTicketInput('');
                    setDrawError('');
                  }}
                  className="text-brand-green hover:text-brand-green-dark"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {drawError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {drawError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-green-dark mb-1">
                  Winning ticket number
                </label>
                <input
                  type="number"
                  min="1"
                  value={winningTicketInput}
                  onChange={(e) => setWinningTicketInput(e.target.value)}
                  className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                  placeholder="Enter sold ticket number"
                />
              </div>

              <div className="bg-brand-cream rounded-lg p-3 border border-brand-cream-border">
                <p className="text-xs text-brand-green mb-1">Sold ticket numbers</p>
                <p className="text-sm text-brand-green-dark break-words">
                  {raffleTickets.map((ticket) => `#${ticket.ticket_number}`).join(', ')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDrawModal(false);
                    setRaffleToDraw(null);
                    setWinningTicketInput('');
                    setDrawError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="button" onClick={confirmDrawWinner} className="flex-1">
                  Confirm Draw
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draw Result Modal */}
      {drawResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-md w-full text-center max-h-[90vh] overflow-y-auto border-2 border-brand-gold">
            <div className="h-1 bg-brand-gold" />
            <div className="p-4 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
              <TicketCheck className="w-8 h-8 sm:w-10 sm:h-10 text-brand-gold" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-brand-green-dark mb-2">Winner Drawn!</h3>
            <div className="bg-brand-green rounded-lg p-4 sm:p-6 mb-4 border border-brand-gold">
              <p className="text-xs sm:text-sm text-brand-cream mb-1 sm:mb-2">Winning Ticket Number</p>
              <p className="text-4xl sm:text-5xl font-bold text-brand-gold">#{drawResult.winningTicket}</p>
            </div>
            {drawResult.winner && (
              <div className="text-left bg-brand-cream rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-brand-cream-border">
                <p className="text-xs sm:text-sm text-brand-green mb-1">Winner:</p>
                <p className="font-semibold text-brand-green-dark text-sm sm:text-base">{drawResult.winner.buyer_name}</p>
                <p className="text-xs sm:text-sm text-brand-green break-all">{drawResult.winner.buyer_email}</p>
              </div>
            )}
            <Button onClick={() => setDrawResult(null)} className="w-full">
              Close
            </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
