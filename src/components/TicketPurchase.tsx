import { useState } from 'react';
import type { Raffle } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { purchaseTickets } from '../lib/api';
import { Ticket, CheckCircle, Loader2 } from 'lucide-react';

interface TicketPurchaseProps {
  raffle: Raffle;
  onSuccess: () => void;
}

export function TicketPurchase({ raffle, onSuccess }: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTickets, setPurchasedTickets] = useState<number[] | null>(null);

  const availableTickets = raffle.total_tickets - raffle.tickets_sold;
  const totalPrice = quantity * raffle.price_per_ticket;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const tickets = await purchaseTickets(
        raffle.id,
        buyerName,
        buyerEmail,
        buyerPhone || null,
        quantity
      );
      setPurchasedTickets(tickets.map(t => t.ticket_number));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (purchasedTickets) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Purchase Successful!
        </h3>
        <p className="text-gray-600 mb-4">
          Thank you {buyerName}! Your ticket numbers are:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {purchasedTickets.map(num => (
            <span
              key={num}
              className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold text-lg"
            >
              #{num}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          A confirmation has been sent to {buyerEmail}
        </p>
        <Button onClick={() => setPurchasedTickets(null)}>
          Buy More Tickets
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="font-semibold">£{raffle.price_per_ticket}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Available tickets:</span>
          <span className="font-semibold">{availableTickets}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-gray-900 font-medium">Total:</span>
          <span className="text-xl font-bold text-indigo-600">£{totalPrice}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Tickets
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-semibold"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-semibold"
            disabled={quantity >= availableTickets}
          >
            +
          </button>
        </div>
      </div>

      <Input
        label="Full Name *"
        type="text"
        required
        value={buyerName}
        onChange={e => setBuyerName(e.target.value)}
        placeholder="Enter your full name"
      />

      <Input
        label="Email Address *"
        type="email"
        required
        value={buyerEmail}
        onChange={e => setBuyerEmail(e.target.value)}
        placeholder="Enter your email"
      />

      <Input
        label="Phone Number (optional)"
        type="tel"
        value={buyerPhone}
        onChange={e => setBuyerPhone(e.target.value)}
        placeholder="Enter your phone number"
      />

      <Button
        type="submit"
        size="lg"
        className="w-full mt-6"
        disabled={isSubmitting || availableTickets === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Ticket className="w-5 h-5 mr-2" />
            Buy {quantity} Ticket{quantity > 1 ? 's' : ''} - £{totalPrice}
          </>
        )}
      </Button>
    </form>
  );
}
