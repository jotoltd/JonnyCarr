import { useState, useEffect } from 'react';
import { getTicketsByBuyerEmail } from '../lib/api';
import type { Ticket } from '../types';
import { Ticket as TicketIcon, Trophy, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import type { User } from '../types';

interface MyTicketsProps {
  user: User;
}

type TicketWithRaffle = Ticket & { raffle_title: string; raffle_status: string };

export function MyTickets({ user }: MyTicketsProps) {
  const [tickets, setTickets] = useState<TicketWithRaffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTicketsByBuyerEmail(user.email)
      .then(data => setTickets(data as TicketWithRaffle[]))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load tickets'))
      .finally(() => setIsLoading(false));
  }, [user.email]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-3.5 h-3.5" />;
      case 'closed': return <XCircle className="w-3.5 h-3.5" />;
      case 'drawn': return <Trophy className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-green-muted text-brand-green-dark';
      case 'closed': return 'bg-brand-cream-dark text-brand-green-dark';
      case 'drawn': return 'bg-brand-gold text-brand-green-dark';
      default: return 'bg-brand-cream-dark text-brand-green-dark';
    }
  };

  const grouped = tickets.reduce<Record<string, { raffle_status: string; tickets: TicketWithRaffle[] }>>((acc, t) => {
    if (!acc[t.raffle_id]) {
      acc[t.raffle_id] = { raffle_status: t.raffle_status, tickets: [] };
    }
    acc[t.raffle_id].tickets.push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">My Tickets</h2>
        <p className="text-brand-green text-sm sm:text-base mt-1">All your raffle entries in one place</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-green" />
          <p className="text-brand-green mt-3">Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 bg-brand-cream-light rounded-xl border-2 border-brand-cream-border">
          <div className="w-16 h-16 bg-brand-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <TicketIcon className="w-8 h-8 text-brand-cream-border" />
          </div>
          <h3 className="text-lg font-semibold text-brand-green-dark mb-1">No Tickets Yet</h3>
          <p className="text-brand-green text-sm mb-4">Enter a raffle to see your tickets here.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'raffles' }))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-brand-cream rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
          >
            <TicketIcon className="w-4 h-4" />
            Browse Raffles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([raffleId, { raffle_status, tickets: raffleTickets }]) => (
            <div key={raffleId} className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border overflow-hidden shadow-sm hover:border-brand-gold transition-colors">
              <div className="h-1 bg-brand-gold" />
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-bold text-brand-green-dark text-base sm:text-lg leading-tight">
                    {raffleTickets[0].raffle_title}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusStyle(raffle_status)}`}>
                    {getStatusIcon(raffle_status)}
                    {raffle_status.charAt(0).toUpperCase() + raffle_status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {raffleTickets
                    .sort((a, b) => a.ticket_number - b.ticket_number)
                    .map(ticket => (
                      <span
                        key={ticket.id}
                        className="inline-flex items-center px-3 py-1.5 bg-brand-green text-brand-gold border border-brand-gold rounded-full font-bold text-sm"
                      >
                        #{ticket.ticket_number}
                      </span>
                    ))}
                </div>

                <p className="text-xs text-brand-green mt-3">
                  {raffleTickets.length} ticket{raffleTickets.length > 1 ? 's' : ''} entered
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
