import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import type { Raffle, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { purchaseTickets, getPayPalSettingsDB, getAvailableTicketNumbers, getSkillQuestionById, validateSkillAnswer, verifyPayPalOrder, type PayPalSettings } from '../lib/api';
import { Ticket, CheckCircle, Loader2, CreditCard, AlertCircle, Shield } from 'lucide-react';

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
  const [skillQuestionError, setSkillQuestionError] = useState('');
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
          onApprove: (data: unknown, actions: { order: { capture: () => Promise<{ payer: { email_address: string; }; }>; }; }) => {
            return actions.order.capture().then((orderData: { payer: { email_address: string; }; }) => {
              // Capture order ID for server verification
              const orderId = (data as { orderID: string }).orderID;
              // Payment captured, now verify server-side and purchase tickets
              handlePaymentSuccess(orderData, orderId);
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

  const handlePaymentSuccess = async (orderData: { payer: { email_address: string; } }, orderId: string) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Server-side PayPal verification
      const paypalMode = paypalSettings?.mode || 'sandbox';
      const verification = await verifyPayPalOrder(orderId, totalPrice, paypalMode);
      
      if (!verification.verified) {
        throw new Error(`Payment verification failed: ${verification.error}`);
      }
      
      const email = orderData.payer.email_address || buyerEmail;
      const tickets = await purchaseTickets(
        raffle.id,
        buyerName,
        email,
        buyerPhone || null,
        quantity,
        selectedTicketNumbers,
        orderId
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

    // Clear previous skill question error
    setSkillQuestionError('');

    if (!raffle.skill_question_id || !skillQuestionPrompt) {
      setSkillQuestionError('This raffle is missing a configured skill question. Please contact admin.');
      return;
    }

    if (!skillAnswer.trim()) {
      setSkillQuestionError('Please answer the skill question before buying tickets');
      return;
    }

    setIsCheckingSkillAnswer(true);
    const isCorrect = await validateSkillAnswer(raffle.skill_question_id, skillAnswer);
    setIsCheckingSkillAnswer(false);

    if (!isCorrect) {
      setSkillQuestionError('Incorrect answer. Please try again.');
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
        <div className="bg-brand-cream-light rounded-xl border-2 border-brand-cream-border p-4 mb-6 max-w-sm mx-auto">
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
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1 text-brand-green-dark font-medium">
          <span className="w-6 h-6 bg-brand-green text-brand-cream rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span>Pick Tickets</span>
        </div>
        <span className="text-brand-cream-border">→</span>
        <div className={`flex items-center gap-1 ${quantity > 0 ? 'text-brand-green-dark font-medium' : 'text-brand-green'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${quantity > 0 ? 'bg-brand-green text-brand-cream' : 'bg-brand-cream-dark text-brand-green'}`}>2</span>
          <span>Answer Question</span>
        </div>
        <span className="text-brand-cream-border">→</span>
        <div className={`flex items-center gap-1 ${quantity > 0 ? 'text-brand-green-dark font-medium' : 'text-brand-green'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${quantity > 0 ? 'bg-brand-green text-brand-cream' : 'bg-brand-cream-dark text-brand-green'}`}>3</span>
          <span>Pay & Win</span>
        </div>
      </div>

      {/* Price Box */}
      <div className="bg-brand-green rounded-xl p-4 mb-4 text-brand-cream">
        <div className="flex items-center justify-between mb-1">
          <span className="text-brand-cream-dark text-sm">Each ticket:</span>
          <span className="font-bold text-lg">£{raffle.price_per_ticket}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-cream-dark text-sm">You picked:</span>
          <span className="font-bold">{quantity} ticket{quantity !== 1 ? 's' : ''}</span>
        </div>
        <div className="border-t border-brand-gold/30 pt-2 flex items-center justify-between">
          <span className="font-semibold">Total to pay:</span>
          <span className="font-bold text-2xl text-brand-gold">
            {isPayPalEnabled ? `£${totalPrice.toFixed(2)}` : 'FREE'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <p className="text-brand-green-dark font-semibold mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-green text-brand-cream rounded-full flex items-center justify-center text-xs font-bold">1</span>
          Click to pick your lucky numbers:
        </p>
        {isLoadingTickets ? (
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading ticket grid...
          </div>
        ) : (
          <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2 max-h-52 sm:max-h-64 overflow-y-auto p-2 border border-brand-cream-border rounded-lg bg-brand-cream-light">
            {Array.from({ length: raffle.total_tickets }, (_, idx) => idx + 1).map((ticketNumber) => {
              const isAvailable = availableSet.has(ticketNumber);
              const isSelected = selectedTicketNumbers.includes(ticketNumber);

              return (
                <button
                  key={ticketNumber}
                  type="button"
                  onClick={() => toggleTicketNumber(ticketNumber)}
                  disabled={!isAvailable || isSubmitting}
                  className={`h-7 sm:h-8 rounded text-xs font-semibold border transition-colors ${
                    !isAvailable
                      ? 'bg-brand-cream-dark text-brand-cream-border border-brand-cream-border cursor-not-allowed'
                      : isSelected
                        ? 'bg-brand-green text-brand-gold border-brand-gold'
                        : 'bg-brand-cream-light text-brand-green-dark border-brand-cream-border hover:border-brand-gold'
                  }`}
                  title={!isAvailable ? `Ticket #${ticketNumber} already taken` : `Ticket #${ticketNumber}`}
                >
                  <span className="hidden sm:inline">{ticketNumber}</span>
                  <span className="sm:hidden">{ticketNumber}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 bg-brand-cream rounded-lg p-2">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-4 h-4 rounded bg-brand-cream-light border border-brand-cream-border" /> Free</span>
            <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-4 h-4 rounded bg-brand-green border-2 border-brand-gold" /> Your Pick</span>
            <span className="inline-flex items-center gap-1 text-brand-green"><span className="w-4 h-4 rounded bg-brand-cream-dark border border-brand-cream-border" /> Sold</span>
          </div>
          {selectedTicketNumbers.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTicketNumbers([])}
              className="text-xs bg-brand-cream-dark hover:bg-red-100 text-brand-green hover:text-red-600 px-2 py-1 rounded transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      <div className="bg-brand-cream-light border-2 border-brand-gold rounded-xl p-4">
        <p className="text-brand-green-dark font-semibold mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-green text-brand-cream rounded-full flex items-center justify-center text-xs font-bold">2</span>
          Answer this to enter:
        </p>
        <p className="text-brand-green-dark text-lg mb-3 font-medium">{skillQuestionPrompt || 'Loading question...'}</p>
        <Input
          label="Your Answer *"
          type="text"
          required
          value={skillAnswer}
          onChange={e => {
            setSkillAnswer(e.target.value);
            setSkillQuestionError(''); // Clear error when user types
          }}
          placeholder="Type your answer"
        />
        {/* Skill Question Error - displayed right below input */}
        {skillQuestionError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{skillQuestionError}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 border border-brand-cream-border">
        <p className="text-brand-green-dark font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-green text-brand-cream rounded-full flex items-center justify-center text-xs font-bold">3</span>
          Your Details:
        </p>
        <div className="space-y-3">
          <Input
            label="Your Name *"
            type="text"
            required
            value={buyerName}
            onChange={e => setBuyerName(e.target.value)}
            placeholder="Type your name"
          />

          <Input
            label="Your Email *"
            type="email"
            required
            value={buyerEmail}
            onChange={e => setBuyerEmail(e.target.value)}
            placeholder="Type your email"
          />

          <Input
            label="Phone (optional)"
            type="tel"
            value={buyerPhone}
            onChange={e => setBuyerPhone(e.target.value)}
            placeholder="Type your phone number"
          />
        </div>
      </div>

      {/* Urgency Message */}
      {quantity > 0 && availableTickets <= 10 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center animate-pulse">
          <p className="text-sm text-red-700 font-semibold">
            Only {availableTickets} tickets left! Secure yours now!
          </p>
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-brand-green">
        <Shield className="w-4 h-4 text-brand-gold" />
        <span>Secure SSL Checkout • PayPal Protected</span>
      </div>

      <Button
        type="submit"
        className="w-full mt-2"
        size="lg"
        disabled={isSubmitting || isCheckingSkillAnswer || availableTickets === 0 || isLoadingTickets || quantity === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            Securing Your Tickets...
          </>
        ) : isCheckingSkillAnswer ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            Verifying Answer...
          </>
        ) : isPayPalEnabled ? (
          <>
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Secure My {quantity} Ticket{quantity > 1 ? 's' : ''} Now - £{totalPrice.toFixed(2)}
          </>
        ) : (
          <>
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Get My {quantity} Free Ticket{quantity > 1 ? 's' : ''}
          </>
        )}
      </Button>

      {/* Simple Help */}
      <div className="bg-brand-green/5 rounded-lg p-3 text-xs text-brand-green-dark">
        <p className="font-semibold mb-1">How it works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Pick your lucky numbers above</li>
          <li>Answer the simple question</li>
          <li>Pay securely via PayPal</li>
          <li>Get your tickets by email instantly</li>
        </ol>
      </div>
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
