import { useState } from 'react';
import type { Raffle } from '../types';
import { Button } from './Button';
import { TicketPurchase } from './TicketPurchase';
import { Ticket, Users, PoundSterling, Clock, XCircle, Trophy } from 'lucide-react';

interface RaffleCardProps {
  raffle: Raffle;
  isAdmin?: boolean;
  onRefresh: () => void;
  onClose?: (id: string) => void;
  onDraw?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function RaffleCard({ raffle, isAdmin, onRefresh, onClose, onDraw, onDelete }: RaffleCardProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const availableTickets = raffle.total_tickets - raffle.tickets_sold;
  const progress = (raffle.tickets_sold / raffle.total_tickets) * 100;

  const getStatusIcon = () => {
    switch (raffle.status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      case 'drawn':
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (raffle.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'drawn':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <div className="p-4 sm:p-6 flex-1">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{raffle.title}</h3>
            {raffle.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{raffle.description}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="hidden sm:inline">{raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}</span>
            <span className="sm:hidden">{raffle.status.charAt(0).toUpperCase()}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{raffle.tickets_sold} / {raffle.total_tickets} sold</span>
              <span className="sm:hidden">{raffle.tickets_sold}/{raffle.total_tickets}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xl sm:text-2xl font-bold">£{raffle.price_per_ticket}</span>
            <span className="text-gray-500 text-sm">per ticket</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs sm:text-sm text-gray-500">Available:</span>
            <span className={`ml-1 sm:ml-2 font-semibold ${availableTickets > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableTickets} tickets
            </span>
          </div>
        </div>

        {raffle.status === 'drawn' && raffle.winning_ticket_number && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-center gap-2 text-purple-800 font-semibold mb-1 text-sm">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Winning Ticket
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900">
              #{raffle.winning_ticket_number}
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-gray-100">
            {raffle.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClose?.(raffle.id)}
                  className="flex-1 sm:flex-none"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onDraw?.(raffle.id)}
                  className="flex-1 sm:flex-none"
                >
                  Draw
                </Button>
              </>
            )}
            <Button
              variant="danger"
              size="sm"
              className="ml-auto"
              onClick={() => onDelete?.(raffle.id)}
            >
              Delete
            </Button>
          </div>
        )}

        {/* Purchase Section */}
        {raffle.status === 'active' && !isAdmin && (
          <div className="pt-4 border-t border-gray-100">
            {showPurchase ? (
              <div className="animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Purchase Tickets</h4>
                  <button
                    onClick={() => setShowPurchase(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <TicketPurchase raffle={raffle} onSuccess={() => {
                  setShowPurchase(false);
                  onRefresh();
                }} />
              </div>
            ) : (
              <Button
                onClick={() => setShowPurchase(true)}
                disabled={availableTickets === 0}
                className="w-full"
                size="lg"
              >
                {availableTickets > 0 ? (
                  <>
                    <Ticket className="w-5 h-5 mr-2" />
                    Buy Tickets
                  </>
                ) : (
                  'Sold Out'
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
