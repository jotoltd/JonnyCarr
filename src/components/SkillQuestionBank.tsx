import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, X, RefreshCw, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getAllSkillQuestions, createSkillQuestion, updateSkillQuestion, deactivateSkillQuestion, getActiveRafflesUsingQuestion } from '../lib/api';
import type { SkillQuestion } from '../types';

export function SkillQuestionBank() {
  const [questions, setQuestions] = useState<SkillQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New question form
  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getAllSkillQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleCreate = async () => {
    if (!newPrompt.trim() || !newAnswer.trim()) {
      setError('Both question and answer are required');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      await createSkillQuestion({
        prompt: newPrompt.trim(),
        answer: newAnswer.trim(),
      });
      await loadQuestions();
      setNewPrompt('');
      setNewAnswer('');
      setIsAdding(false);
      setSuccess('Question added to bank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (q: SkillQuestion) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.answer);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPrompt('');
    setEditAnswer('');
  };

  const saveEdit = async (id: string) => {
    if (!editPrompt.trim() || !editAnswer.trim()) {
      setError('Both question and answer are required');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await updateSkillQuestion(id, { prompt: editPrompt, answer: editAnswer });
      await loadQuestions();
      setEditingId(null);
      setSuccess('Question updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
    }
  };

  const handleDeactivate = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      const activeRaffles = await getActiveRafflesUsingQuestion(id);
      if (activeRaffles.length > 0) {
        const titles = activeRaffles.map(r => `"${r.title}"`).join(', ');
        setError(`Cannot deactivate: assigned to ${activeRaffles.length} active raffle(s): ${titles}. Close those raffles first.`);
        return;
      }

      if (!confirm('Deactivate this question? It will no longer be selectable for new raffles.')) {
        return;
      }

      await deactivateSkillQuestion(id);
      await loadQuestions();
      setSuccess('Question deactivated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate question');
    }
  };

  return (
    <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-brand-green-dark">Skill Question Bank</h3>
          <p className="text-sm text-brand-green">Manage questions available for raffles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadQuestions}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setIsAdding(true); setError(''); setSuccess(''); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Question
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-brand-green-muted border border-brand-green rounded-lg p-3 text-brand-green-dark text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {isAdding && (
        <div className="bg-white rounded-lg border border-brand-cream-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-brand-green-dark">Add New Question</h4>
            <button onClick={() => setIsAdding(false)} className="text-brand-green hover:text-brand-green-dark">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Input
            label="Question"
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="e.g. What is 7 + 5?"
          />
          <Input
            label="Answer"
            type="text"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="e.g. 12"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={isCreating} size="sm">
              {isCreating ? 'Adding...' : 'Add to Bank'}
            </Button>
            <Button variant="secondary" onClick={() => setIsAdding(false)} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-brand-green">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-brand-cream-border">
          <p className="text-brand-green">No questions in bank yet.</p>
          <p className="text-sm text-brand-green mt-1">Click "Add Question" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {questions.map((q) => {
            const isEditing = editingId === q.id;
            return (
              <div key={q.id} className="bg-white rounded-lg border border-brand-cream-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      q.is_active
                        ? 'bg-brand-green-muted text-brand-green-dark'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {q.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(q)}>
                        Edit
                      </Button>
                      {q.is_active && (
                        <Button size="sm" variant="outline" onClick={() => handleDeactivate(q.id)}>
                          Deactivate
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      label="Question"
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                    />
                    <Input
                      label="Answer"
                      type="text"
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(q.id)}>Save</Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-brand-green-dark font-medium">{q.prompt}</p>
                    <p className="text-sm text-brand-green">Answer: {q.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
