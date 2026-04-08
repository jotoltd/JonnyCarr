import { useState, useEffect } from 'react';
import { Trophy, Ticket, Calendar, X, Crown, Gift } from 'lucide-react';
import { getCompletedRaffles, getTicketsByRaffleId } from '../lib/api';
import type { Raffle, Ticket as TicketType } from '../types';

export function PastWinners() {
  const [completedRaffles, setCompletedRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [winningTicket, setWinningTicket] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompletedRaffles();
  }, []);

  const loadCompletedRaffles = async () => {
    try {
      setIsLoading(true);
      const raffles = await getCompletedRaffles();
      setCompletedRaffles(raffles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load past raffles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewWinner = async (raffle: Raffle) => {
    if (!raffle.winning_ticket_number) return;
    
    try {
      const tickets = await getTicketsByRaffleId(raffle.id);
      const winner = tickets.find(t => t.ticket_number === raffle.winning_ticket_number);
      setWinningTicket(winner || null);
      setSelectedRaffle(raffle);
    } catch (err) {
      console.error('Failed to load winner details');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brand-green mx-auto"></div>
        <p className="text-brand-green mt-4 font-medium">Loading past winners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-brand-cream-light rounded-xl shadow-sm border-2 border-brand-cream-border">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (completedRaffles.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 bg-brand-cream-light rounded-xl shadow-sm border-2 border-brand-cream-border">
        <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-brand-cream-border mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-brand-green-dark mb-2">No Completed Raffles Yet</h3>
        <p className="text-brand-green text-sm sm:text-base">Check back soon to see our winners!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Crown className="w-6 h-6 text-brand-gold" />
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-green-dark">Past Winners</h2>
        </div>
        <p className="text-brand-green max-w-2xl mx-auto">
          Congratulations to all our winners! See the lucky ticket numbers that won these beautiful handmade cues.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {completedRaffles.map((raffle) => (
          <div 
            key={raffle.id} 
            className="bg-brand-cream-light rounded-xl shadow-md overflow-hidden border-2 border-brand-cream-border hover:border-brand-gold transition-colors"
          >
            {/* Gold top accent */}
            <div className="h-1 bg-brand-gold" />
            
            {/* Image */}
            {raffle.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={raffle.image_url}
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-brand-gold text-brand-green-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Winner Drawn
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-bold text-brand-green-dark mb-2">{raffle.title}</h3>
              
              {/* Stats */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-brand-green">
                  <Ticket className="w-4 h-4 text-brand-gold" />
                  <span>{raffle.tickets_sold} / {raffle.total_tickets} tickets sold</span>
                </div>
                {raffle.drawn_at && (
                  <div className="flex items-center gap-2 text-brand-green">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <span>Drawn {new Date(raffle.drawn_at).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>

              {/* Winning Ticket */}
              {raffle.winning_ticket_number ? (
                <div className="bg-brand-green rounded-lg p-4 border border-brand-gold">
                  <div className="flex items-center gap-2 text-brand-gold mb-2">
                    <Gift className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Winning Ticket</span>
                  </div>
                  <div className="text-3xl font-bold text-brand-cream mb-2">
                    #{raffle.winning_ticket_number}
                  </div>
                  <button
                    onClick={() => handleViewWinner(raffle)}
                    className="text-xs text-brand-cream-dark hover:text-brand-cream underline underline-offset-2 transition-colors"
                  >
                    View Winner Details
                  </button>
                </div>
              ) : (
                <div className="bg-brand-cream-dark rounded-lg p-4 text-center">
                  <p className="text-brand-green text-sm">Raffle closed - no winner drawn</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Winner Details Modal */}
      {selectedRaffle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-md w-full border-2 border-brand-gold">
            <div className="h-1 bg-brand-gold" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-brand-green-dark">Winner Details</h3>
                <button
                  onClick={() => {
                    setSelectedRaffle(null);
                    setWinningTicket(null);
                  }}
                  className="text-brand-green hover:text-brand-green-dark p-1 hover:bg-brand-cream rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-brand-gold">
                  <Trophy className="w-8 h-8 text-brand-gold" />
                </div>
                <h4 className="font-bold text-brand-green-dark text-lg">{selectedRaffle.title}</h4>
                <p className="text-4xl font-bold text-brand-gold mt-2">
                  #{selectedRaffle.winning_ticket_number}
                </p>
              </div>

              {winningTicket ? (
                <div className="bg-white rounded-lg p-4 border border-brand-cream-border space-y-3">
                  <div>
                    <p className="text-xs text-brand-green uppercase tracking-wider">Winner</p>
                    <p className="font-semibold text-brand-green-dark">{winningTicket.buyer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-green uppercase tracking-wider">Email</p>
                    <p className="text-brand-green-dark">{winningTicket.buyer_email}</p>
                  </div>
                  {winningTicket.buyer_phone && (
                    <div>
                      <p className="text-xs text-brand-green uppercase tracking-wider">Phone</p>
                      <p className="text-brand-green-dark">{winningTicket.buyer_phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-brand-green uppercase tracking-wider">Purchased</p>
                    <p className="text-brand-green-dark">
                      {new Date(winningTicket.purchased_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-brand-green">Winner information not available</p>
              )}

              <button
                onClick={() => {
                  setSelectedRaffle(null);
                  setWinningTicket(null);
                }}
                className="w-full mt-4 bg-brand-green text-brand-cream py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
