import { useState, useEffect } from 'react';
import { RaffleCard } from './RaffleCard';
import { CreateRaffleForm } from './CreateRaffleForm';
import { Button } from './Button';
import { PayPalSettingsModal } from './PayPalSettings';
import { getAllRaffles, closeRaffle, deleteRaffle, getTicketsByRaffleId, drawWinner, getAllSkillQuestions, updateSkillQuestion, deactivateSkillQuestion } from '../lib/api';
import type { Raffle, SkillQuestion, Ticket } from '../types';
import { RefreshCw, TicketCheck, AlertCircle, Loader2, X, LogOut, Key, CreditCard } from 'lucide-react';

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
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const [showPayPalSettings, setShowPayPalSettings] = useState(false);
  const [skillQuestions, setSkillQuestions] = useState<SkillQuestion[]>([]);
  const [isLoadingSkillQuestions, setIsLoadingSkillQuestions] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [skillQuestionError, setSkillQuestionError] = useState('');
  const [skillQuestionSuccess, setSkillQuestionSuccess] = useState('');

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

  const loadSkillQuestions = async () => {
    try {
      setIsLoadingSkillQuestions(true);
      const data = await getAllSkillQuestions();
      setSkillQuestions(data);
    } catch (err) {
      setSkillQuestionError(err instanceof Error ? err.message : 'Failed to load skill questions');
    } finally {
      setIsLoadingSkillQuestions(false);
    }
  };

  useEffect(() => {
    loadRaffles();
    loadSkillQuestions();
  }, []);

  const handleStartEditQuestion = (question: SkillQuestion) => {
    setSkillQuestionError('');
    setSkillQuestionSuccess('');
    setEditingQuestionId(question.id);
    setEditPrompt(question.prompt);
    setEditAnswer(question.answer);
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditPrompt('');
    setEditAnswer('');
  };

  const handleSaveQuestion = async (id: string) => {
    if (!editPrompt.trim() || !editAnswer.trim()) {
      setSkillQuestionError('Question and answer are both required');
      return;
    }

    try {
      setSkillQuestionError('');
      setSkillQuestionSuccess('');
      await updateSkillQuestion(id, { prompt: editPrompt, answer: editAnswer });
      await loadSkillQuestions();
      setEditingQuestionId(null);
      setEditPrompt('');
      setEditAnswer('');
      setSkillQuestionSuccess('Skill question updated');
    } catch (err) {
      setSkillQuestionError(err instanceof Error ? err.message : 'Failed to update skill question');
    }
  };

  const handleDeactivateQuestion = async (id: string) => {
    if (!confirm('Deactivate this skill question? It will no longer be selectable for new raffles.')) {
      return;
    }

    try {
      setSkillQuestionError('');
      setSkillQuestionSuccess('');
      await deactivateSkillQuestion(id);
      await loadSkillQuestions();
      setSkillQuestionSuccess('Skill question deactivated');
    } catch (err) {
      setSkillQuestionError(err instanceof Error ? err.message : 'Failed to deactivate skill question');
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

      <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark">Skill Question Bank</h3>
            <p className="text-sm text-brand-green">Edit or deactivate existing questions</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadSkillQuestions}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {skillQuestionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {skillQuestionError}
          </div>
        )}
        {skillQuestionSuccess && (
          <div className="bg-brand-green-muted border border-brand-green rounded-lg p-3 text-brand-green-dark text-sm">
            {skillQuestionSuccess}
          </div>
        )}

        {isLoadingSkillQuestions ? (
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading skill questions...
          </div>
        ) : skillQuestions.length === 0 ? (
          <p className="text-sm text-brand-green">No skill questions found yet.</p>
        ) : (
          <div className="space-y-3">
            {skillQuestions.map((question) => {
              const isEditing = editingQuestionId === question.id;

              return (
                <div key={question.id} className="border border-brand-cream-border rounded-lg p-3 sm:p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${question.is_active ? 'bg-brand-green-muted text-brand-green-dark' : 'bg-gray-100 text-gray-600'}`}>
                      {question.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleStartEditQuestion(question)}>
                          Edit
                        </Button>
                        {question.is_active && (
                          <Button size="sm" variant="outline" onClick={() => handleDeactivateQuestion(question.id)}>
                            Deactivate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-brand-green-dark mb-1">Question</label>
                        <input
                          type="text"
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-green-dark mb-1">Answer</label>
                        <input
                          type="text"
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveQuestion(question.id)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={handleCancelEditQuestion}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-brand-green-dark"><strong>Q:</strong> {question.prompt}</p>
                      <p className="text-brand-green"><strong>A:</strong> {question.answer}</p>
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
