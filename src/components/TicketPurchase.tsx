import { useState, useEffect } from 'react';
import type { Raffle } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { purchaseTickets, getPayPalSettingsDB, type PayPalSettings } from '../lib/api';
import { Ticket, CheckCircle, Loader2, CreditCard, AlertCircle } from 'lucide-react';

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
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings | null>(null);

  const availableTickets = raffle.total_tickets - raffle.tickets_sold;
  const totalPrice = quantity * raffle.price_per_ticket;
  
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
                description: `${raffle.title} - ${quantity} ticket${quantity > 1 ? 's' : ''}`,
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
      const tickets = await purchaseTickets(
        raffle.id,
        buyerName,
        orderData.payer.email_address || buyerEmail,
        buyerPhone || null,
        quantity
      );
      setPurchasedTickets(tickets.map(t => t.ticket_number));
      setPaymentStep('success');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate tickets after payment');
      setPaymentStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
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
        quantity
      );
      setPurchasedTickets(tickets.map(t => t.ticket_number));
      setPaymentStep('success');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPurchasedTickets(null);
    setPaymentStep('form');
    setQuantity(1);
    setBuyerName('');
    setBuyerEmail('');
    setBuyerPhone('');
    setError('');
  };

  // Success screen
  if (paymentStep === 'success' && purchasedTickets) {
    return (
      <div className="text-center py-6 sm:py-8">
        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Purchase Successful!
        </h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Thank you {buyerName}! Your ticket numbers are:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6 px-2">
          {purchasedTickets.map(num => (
            <span
              key={num}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold text-base sm:text-lg"
            >
              #{num}
            </span>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          A confirmation has been sent to {buyerEmail}
        </p>
        <Button onClick={resetForm} size="sm" className="sm:size-default">
          Buy More Tickets
        </Button>
      </div>
    );
  }

  // Payment step with PayPal
  if (paymentStep === 'payment' && isPayPalEnabled) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Complete Payment</h3>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Raffle:</strong> {raffle.title}</p>
            <p><strong>Tickets:</strong> {quantity}</p>
            <p><strong>Total:</strong> £{totalPrice.toFixed(2)}</p>
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading PayPal...</span>
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
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="font-semibold">£{raffle.price_per_ticket}</span>
        </div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Available tickets:</span>
          <span className="font-semibold">{availableTickets}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-gray-900 font-medium">Total:</span>
          <span className="text-lg sm:text-xl font-bold text-indigo-600">
            {isPayPalEnabled ? `£${totalPrice.toFixed(2)}` : 'FREE'}
          </span>
        </div>
        {isPayPalEnabled && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Payment required via PayPal
          </p>
        )}
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
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-semibold"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="text-lg sm:text-xl font-semibold w-10 sm:w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-semibold"
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
        className="w-full mt-4 sm:mt-6"
        disabled={isSubmitting || availableTickets === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : isPayPalEnabled ? (
          <>
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Continue to Payment - £{totalPrice}
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
