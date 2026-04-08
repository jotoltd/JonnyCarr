import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import type { Raffle, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { purchaseTickets, getPayPalSettingsDB, getAvailableTicketNumbers, getSkillQuestionById, validateSkillAnswer, type PayPalSettings } from '../lib/api';
import { Ticket, CheckCircle, Loader2, CreditCard, AlertCircle } from 'lucide-react';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

async function sendConfirmationEmail(params: {
  buyer_name: string;
  buyer_email: string;
  raffle_title: string;
  ticket_numbers: string;
  quantity: number;
  total_price: string;
}) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return;
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY);
  } catch {
    // Silent fail — don't block the purchase
  }
}

interface TicketPurchaseProps {
  raffle: Raffle;
  user: User;
  onSuccess: () => void;
}

export function TicketPurchase({ raffle, user, onSuccess }: TicketPurchaseProps) {
  const [selectedTicketNumbers, setSelectedTicketNumbers] = useState<number[]>([]);
  const [availableTicketNumbers, setAvailableTicketNumbers] = useState<number[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [skillQuestionPrompt, setSkillQuestionPrompt] = useState('');
  const [skillAnswer, setSkillAnswer] = useState('');
  const [isCheckingSkillAnswer, setIsCheckingSkillAnswer] = useState(false);
  const [buyerName, setBuyerName] = useState(user.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user.email || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTickets, setPurchasedTickets] = useState<number[] | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings | null>(null);

  const quantity = selectedTicketNumbers.length;
  const availableTickets = availableTicketNumbers.length;
  const totalPrice = quantity * raffle.price_per_ticket;
  const availableSet = new Set(availableTicketNumbers);

  useEffect(() => {
    setBuyerName(user.name || '');
    setBuyerEmail(user.email || '');
  }, [user.name, user.email]);

  useEffect(() => {
    const loadAvailableTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const numbers = await getAvailableTicketNumbers(raffle.id, raffle.total_tickets);
        setAvailableTicketNumbers(numbers);
      } catch {
        setError('Failed to load ticket availability');
      } finally {
        setIsLoadingTickets(false);
      }
    };

    loadAvailableTickets();
  }, [raffle.id, raffle.total_tickets]);

  useEffect(() => {
    const loadSkillQuestion = async () => {
      if (!raffle.skill_question_id) {
        setSkillQuestionPrompt('');
        return;
      }

      const question = await getSkillQuestionById(raffle.skill_question_id);
      setSkillQuestionPrompt(question?.prompt || '');
    };

    loadSkillQuestion();
  }, [raffle.skill_question_id]);
  
  // Load PayPal settings from database
  useEffect(() => {
    getPayPalSettingsDB().then(settings => {
      setPaypalSettings(settings);
    });
  }, []);
  
  const isPayPalEnabled = paypalSettings?.enabled && paypalSettings?.client_id;

  // Load PayPal SDK when needed
  useEffect(() => {
    if (isPayPalEnabled && paymentStep === 'payment' && !window.paypal) {
      const script = document.createElement('script');
      const clientId = paypalSettings?.client_id;
      const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=GBP&intent=capture`;
      
      script.src = sdkUrl;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => {
        setError('Failed to load PayPal. Please try again or contact support.');
        setPaymentStep('form');
      };
      
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (isPayPalEnabled && window.paypal) {
      setPaypalLoaded(true);
    }
  }, [isPayPalEnabled, paymentStep, paypalSettings?.client_id]);

  // Render PayPal buttons when SDK is loaded
  useEffect(() => {
    if (paypalLoaded && paymentStep === 'payment' && window.paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
          },
          createOrder: (_data: unknown, actions: { order: { create: (arg0: { purchase_units: { amount: { currency_code: string; value: string; }; description: string; }[]; }) => Promise<string>; }; }) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: 'GBP',
                  value: totalPrice.toFixed(2),
                },
                description: `${raffle.title} - ${quantity} selected ticket${quantity > 1 ? 's' : ''}`,
              }],
            });
          },
          onApprove: (_data: unknown, actions: { order: { capture: () => Promise<{ payer: { email_address: string; }; }>; }; }) => {
            return actions.order.capture().then((orderData: { payer: { email_address: string; }; }) => {
              // Payment successful, now purchase tickets
              handlePaymentSuccess(orderData);
            });
          },
          onError: (err: unknown) => {
            console.error('PayPal error:', err);
            setError('Payment failed. Please try again.');
            setPaymentStep('form');
          },
          onCancel: () => {
            setPaymentStep('form');
          },
        }).render('#paypal-button-container');
      }
    }
  }, [paypalLoaded, paymentStep, totalPrice, raffle.title, quantity]);

  const handlePaymentSuccess = async (orderData: { payer: { email_address: string; } }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const email = orderData.payer.email_address || buyerEmail;
      const tickets = await purchaseTickets(
        raffle.id,
        buyerName,
        email,
        buyerPhone || null,
        quantity,
        selectedTicketNumbers
      );
      const nums = tickets.map(t => t.ticket_number);
      setPurchasedTickets(nums);
      setPaymentStep('success');
      onSuccess();
      await sendConfirmationEmail({
        buyer_name: buyerName,
        buyer_email: email,
        raffle_title: raffle.title,
        ticket_numbers: nums.map(n => `#${n}`).join(', '),
        quantity,
        total_price: `£${totalPrice.toFixed(2)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate tickets after payment');
      setPaymentStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!buyerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!buyerEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (quantity < 1) {
      setError('Please select at least 1 ticket number');
      return;
    }

    if (!raffle.skill_question_id || !skillQuestionPrompt) {
      setError('This game is missing a configured skill question. Please contact admin.');
      return;
    }

    if (!skillAnswer.trim()) {
      setError('Please answer the skill question before buying tickets');
      return;
    }

    setIsCheckingSkillAnswer(true);
    const isCorrect = await validateSkillAnswer(raffle.skill_question_id, skillAnswer);
    setIsCheckingSkillAnswer(false);

    if (!isCorrect) {
      setError('Incorrect answer. Please try again.');
      return;
    }

    if (isPayPalEnabled) {
      setPaymentStep('payment');
    } else {
      // No PayPal, go straight to ticket allocation
      handleFreePurchase();
    }
  };

  const handleFreePurchase = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const tickets = await purchaseTickets(
        raffle.id,
        buyerName,
        buyerEmail,
        buyerPhone || null,
        quantity,
        selectedTicketNumbers
      );
      const nums = tickets.map(t => t.ticket_number);
      setPurchasedTickets(nums);
      setPaymentStep('success');
      onSuccess();
      await sendConfirmationEmail({
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        raffle_title: raffle.title,
        ticket_numbers: nums.map(n => `#${n}`).join(', '),
        quantity,
        total_price: `£${totalPrice.toFixed(2)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPurchasedTickets(null);
    setPaymentStep('form');
    setSelectedTicketNumbers([]);
    setSkillAnswer('');
    setBuyerName(user.name || '');
    setBuyerEmail(user.email || '');
    setBuyerPhone('');
    setError('');
  };

  const toggleTicketNumber = (ticketNumber: number) => {
    if (!availableSet.has(ticketNumber) || isSubmitting) return;

    setSelectedTicketNumbers((prev) =>
      prev.includes(ticketNumber)
        ? prev.filter((num) => num !== ticketNumber)
        : [...prev, ticketNumber]
    );
  };

  // Success screen
  if (paymentStep === 'success' && purchasedTickets) {
    return (
      <div className="text-center py-6 sm:py-8 bg-brand-cream-light rounded-xl border-2 border-brand-gold p-4 sm:p-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand-gold shadow-lg">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-brand-gold" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-brand-green-dark mb-2">
          Tickets Secured!
        </h3>
        <p className="text-brand-green mb-4 text-sm sm:text-base">
          Good luck, {buyerName}! You're in the draw for:
        </p>
        <div className="bg-white rounded-xl border-2 border-brand-cream-border p-4 mb-6 max-w-sm mx-auto">
          <p className="font-bold text-brand-green-dark text-lg">{raffle.title}</p>
          <p className="text-sm text-brand-green mt-1">{raffle.tickets_sold} / {raffle.total_tickets} tickets sold</p>
        </div>
        <p className="text-sm text-brand-green-dark font-semibold mb-3">Your lucky numbers:</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6 px-2">
          {purchasedTickets.map(num => (
            <span
              key={num}
              className="inline-flex items-center px-4 py-2 bg-brand-green text-brand-gold border-2 border-brand-gold rounded-full font-bold text-lg shadow-md"
            >
              #{num}
            </span>
          ))}
        </div>
        <div className="bg-brand-green/10 rounded-lg p-3 mb-4 max-w-sm mx-auto">
          <p className="text-xs sm:text-sm text-brand-green-dark">
            <strong>Confirmation sent to:</strong><br />
            {buyerEmail}
          </p>
        </div>
        <Button onClick={resetForm} className="w-full sm:w-auto">
          <Ticket className="w-4 h-4 mr-2" />
          Buy More Tickets
        </Button>
      </div>
    );
  }

  // Payment step with PayPal
  if (paymentStep === 'payment' && isPayPalEnabled) {
    return (
      <div className="space-y-4">
        <div className="bg-brand-green rounded-lg p-4 border border-brand-gold">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-brand-gold" />
            <h3 className="font-semibold text-brand-cream">Complete Payment</h3>
          </div>
          <div className="text-sm text-brand-cream-dark space-y-1">
            <p><strong className="text-brand-gold">Raffle:</strong> {raffle.title}</p>
            <p><strong className="text-brand-gold">Tickets:</strong> {quantity} ({[...selectedTicketNumbers].sort((a, b) => a - b).map(n => `#${n}`).join(', ')})</p>
            <p><strong className="text-brand-gold">Total:</strong> £{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div id="paypal-button-container" className="min-h-[150px]">
          {!paypalLoaded && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
              <span className="ml-2 text-brand-green">Loading PayPal...</span>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setPaymentStep('form')}
          className="w-full"
        >
          Back to Details
        </Button>
      </div>
    );
  }

  // Form step (default)
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="bg-brand-cream rounded-lg p-3 sm:p-4 mb-4 border border-brand-cream-border">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-brand-green">Price per ticket:</span>
          <span className="font-semibold text-brand-green-dark">£{raffle.price_per_ticket}</span>
        </div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-brand-green">Available tickets:</span>
          <span className="font-semibold text-brand-green-dark">{availableTickets}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-brand-cream-border">
          <span className="text-brand-green-dark font-medium">Total:</span>
          <span className="text-lg sm:text-xl font-bold text-brand-gold">
            {isPayPalEnabled ? `£${totalPrice.toFixed(2)}` : 'FREE'}
          </span>
        </div>
        {isPayPalEnabled && (
          <p className="text-xs text-brand-green mt-2 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Payment required via PayPal
          </p>
        )}
        <p className="text-xs text-brand-green mt-1">
          Selected: {quantity} ticket{quantity !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-green-dark mb-2">
          Choose Ticket Numbers
        </label>
        {isLoadingTickets ? (
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading ticket grid...
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2 max-h-52 overflow-y-auto p-2 border border-brand-cream-border rounded-lg bg-brand-cream-light">
            {Array.from({ length: raffle.total_tickets }, (_, idx) => idx + 1).map((ticketNumber) => {
              const isAvailable = availableSet.has(ticketNumber);
              const isSelected = selectedTicketNumbers.includes(ticketNumber);

              return (
                <button
                  key={ticketNumber}
                  type="button"
                  onClick={() => toggleTicketNumber(ticketNumber)}
                  disabled={!isAvailable || isSubmitting}
                  className={`h-8 rounded text-xs font-semibold border transition-colors ${
                    !isAvailable
                      ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                      : isSelected
                        ? 'bg-brand-green text-brand-gold border-brand-gold'
                        : 'bg-white text-brand-green-dark border-brand-cream-border hover:border-brand-gold'
                  }`}
                  title={!isAvailable ? `Ticket #${ticketNumber} already taken` : `Ticket #${ticketNumber}`}
                >
                  {ticketNumber}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-3 text-xs mt-2">
          <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-3 h-3 rounded bg-white border border-brand-cream-border" /> Available</span>
          <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-3 h-3 rounded bg-brand-green border border-brand-gold" /> Selected</span>
          <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /> Taken</span>
        </div>
      </div>

      <div className="bg-brand-cream-light border border-brand-cream-border rounded-lg p-3 sm:p-4">
        <p className="text-sm font-semibold text-brand-green-dark mb-2">Skill Question (Required)</p>
        <p className="text-sm text-brand-green mb-3">{skillQuestionPrompt || 'Loading question...'}</p>
        <Input
          label="Your Answer *"
          type="text"
          required
          value={skillAnswer}
          onChange={e => setSkillAnswer(e.target.value)}
          placeholder="Type your answer"
        />
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
        className="w-full mt-4 sm:mt-6"
        disabled={isSubmitting || isCheckingSkillAnswer || availableTickets === 0 || isLoadingTickets || quantity === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : isCheckingSkillAnswer ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            Checking Answer...
          </>
        ) : isPayPalEnabled ? (
          <>
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Continue to Payment - £{totalPrice.toFixed(2)}
          </>
        ) : (
          <>
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Buy {quantity} Ticket{quantity > 1 ? 's' : ''}
          </>
        )}
      </Button>
    </form>
  );
}

// Add PayPal type declaration
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
        };
        createOrder: (data: unknown, actions: { order: { create: (arg0: { purchase_units: { amount: { currency_code: string; value: string; }; description: string; }[]; }) => Promise<string>; }; }) => Promise<string>;
        onApprove: (data: unknown, actions: { order: { capture: () => Promise<{ payer: { email_address: string; }; }>; }; }) => Promise<void>;
        onError?: (err: unknown) => void;
        onCancel?: () => void;
      }) => {
        render: (containerId: string) => void;
      };
    };
  }
}
