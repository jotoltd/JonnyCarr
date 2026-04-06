import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { createRaffle } from '../lib/api';
import { Plus, X } from 'lucide-react';

interface CreateRaffleFormProps {
  onSuccess: () => void;
}

export function CreateRaffleForm({ onSuccess }: CreateRaffleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [pricePerTicket, setPricePerTicket] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createRaffle({
        title,
        description: description || null,
        total_tickets: parseInt(totalTickets),
        price_per_ticket: parseFloat(pricePerTicket),
        status: 'active',
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setTotalTickets('');
      setPricePerTicket('');
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create raffle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg">
        <Plus className="w-5 h-5 mr-2" />
        Create New Raffle
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Create New Raffle</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Raffle Title *"
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Summer Charity Raffle"
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the prize or purpose of this raffle..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Tickets *"
            type="number"
            required
            min="1"
            value={totalTickets}
            onChange={e => setTotalTickets(e.target.value)}
            placeholder="e.g., 100"
          />

          <Input
            label="Price per Ticket (£) *"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={pricePerTicket}
            onChange={e => setPricePerTicket(e.target.value)}
            placeholder="e.g., 5.00"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600">
            <strong>Summary:</strong>{' '}
            {totalTickets && pricePerTicket
              ? `${totalTickets} tickets at £${pricePerTicket} each = £${(parseInt(totalTickets || '0') * parseFloat(pricePerTicket || '0')).toFixed(2)} total potential revenue`
              : 'Fill in the fields to see revenue estimate'}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title || !totalTickets || !pricePerTicket}
          >
            {isSubmitting ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
