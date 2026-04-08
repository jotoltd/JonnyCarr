import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { createRaffle, getSkillQuestions, uploadRaffleImage } from '../lib/api';
import { Plus, X } from 'lucide-react';
import type { SkillQuestion } from '../types';

interface CreateRaffleFormProps {
  onSuccess: () => void;
}

export function CreateRaffleForm({ onSuccess }: CreateRaffleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [pricePerTicket, setPricePerTicket] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [skillQuestions, setSkillQuestions] = useState<SkillQuestion[]>([]);
  const [selectedSkillQuestionId, setSelectedSkillQuestionId] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadQuestions = async () => {
      try {
        const questions = await getSkillQuestions();
        setSkillQuestions(questions);
        if (questions.length > 0 && !selectedSkillQuestionId) {
          setSelectedSkillQuestionId(questions[0].id);
        }
      } catch {
        setError('Failed to load skill questions');
      }
    };

    loadQuestions();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createRaffle({
        title,
        description: description || null,
        image_url: imageUrl || null,
        skill_question_id: selectedSkillQuestionId,
        total_tickets: parseInt(totalTickets),
        price_per_ticket: parseFloat(pricePerTicket),
        status: 'active',
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setTotalTickets('');
      setPricePerTicket('');
      setEndsAt('');
      setSelectedSkillQuestionId('');
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create raffle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadRaffleImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
        <Plus className="w-5 h-5 mr-1.5" />
        Create New Raffle
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Raffle</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Raffle Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
          />
          {isUploadingImage && (
            <p className="text-sm text-brand-green">Uploading image...</p>
          )}
          {imageUrl && (
            <div className="space-y-2">
              <img
                src={imageUrl}
                alt="Raffle preview"
                className="h-32 w-full object-cover rounded-lg border border-brand-cream-border"
              />
              <p className="text-xs text-brand-green break-all">{imageUrl}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-brand-green-dark mb-1">
            Raffle End Date (optional)
          </label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
          />
          <p className="text-xs text-brand-green mt-1">When the raffle will automatically close</p>
        </div>

        <div className="bg-brand-cream-light border border-brand-cream-border rounded-lg p-3 sm:p-4 space-y-3">
          <h3 className="font-semibold text-brand-green-dark text-sm">Skill Question (Required)</h3>

          {skillQuestions.length === 0 ? (
            <div className="text-sm text-brand-green">
              <p>No active questions available.</p>
              <p className="mt-1">Please add questions in the Skill Question Bank section first.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-brand-green-dark mb-1">
                Select question for this raffle *
              </label>
              <select
                value={selectedSkillQuestionId}
                onChange={(e) => setSelectedSkillQuestionId(e.target.value)}
                className="block w-full rounded-lg border-brand-cream-border shadow-sm focus:border-brand-green focus:ring-brand-green px-3 py-2 border text-sm bg-white"
                required
              >
                <option value="" disabled>Choose a question...</option>
                {skillQuestions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.prompt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4">
          <p className="text-sm text-gray-600">
            <strong>Summary:</strong>{' '}
            {totalTickets && pricePerTicket
              ? `${totalTickets} tickets at £${pricePerTicket} each = £${(parseInt(totalTickets || '0') * parseFloat(pricePerTicket || '0')).toFixed(2)} total potential revenue`
              : 'Fill in the fields to see revenue estimate'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImage || !title || !totalTickets || !pricePerTicket || !selectedSkillQuestionId}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
