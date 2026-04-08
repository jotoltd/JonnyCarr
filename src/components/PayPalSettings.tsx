import { useState, useEffect } from 'react';
import { Button } from './Button';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import { getPayPalSettingsDB, savePayPalSettingsDB, type PayPalSettings as PayPalSettingsDB } from '../lib/api';

interface PayPalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayPalSettingsModal({ isOpen, onClose }: PayPalSettingsModalProps) {
  const DEFAULT_SANDBOX_SETTINGS: PayPalSettingsDB = {
    client_id: 'AcalknmOIPLrNFZ4tdptZtW83FqksWxh4zMBmyY9X8WtXu49h5LJEB2tujhlVJxiJhpM4rB_Z_K0pH9E',
    business_email: 'sb-qza3m50402059@business.example.com',
    mode: 'sandbox',
    enabled: true,
  };

  const LIVE_SETTINGS: PayPalSettingsDB = {
    client_id: 'AZOE6Bb490b4XNhEfiOPN0JNOZPxFkgA4FPmOEFC85V2QFFOEDCNox8ab0wHHsIvDNPGKuRl3tsWumN4',
    business_email: 'jonny89carr@googlemail.com',
    mode: 'live',
    enabled: true,
  };

  const [settings, setSettings] = useState<PayPalSettingsDB>(DEFAULT_SANDBOX_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const dbSettings = await getPayPalSettingsDB();
      if (dbSettings) {
        setSettings(dbSettings);
      } else {
        // Pre-fill with sandbox defaults if no settings exist
        setSettings(DEFAULT_SANDBOX_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to load PayPal settings:', err);
      // Fallback to sandbox defaults on error
      setSettings(DEFAULT_SANDBOX_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const applySandboxDefaults = () => {
    setSettings(DEFAULT_SANDBOX_SETTINGS);
  };

  const applyLiveDefaults = () => {
    setSettings(LIVE_SETTINGS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (settings.enabled) {
      if (!settings.client_id.trim()) {
        setError('Client ID is required when PayPal is enabled');
        setIsSaving(false);
        return;
      }
      if (!settings.business_email.trim()) {
        setError('Business email is required when PayPal is enabled');
        setIsSaving(false);
        return;
      }
      if (!settings.business_email.includes('@')) {
        setError('Please enter a valid business email');
        setIsSaving(false);
        return;
      }
    }

    try {
      await savePayPalSettingsDB(settings);
      setSuccess('PayPal settings saved successfully!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">PayPal Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Enter your PayPal Business account details to enable ticket payments. 
                Get your Client ID from the{' '}
                <a 
                  href="https://developer.paypal.com/dashboard/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900 inline-flex items-center gap-0.5"
                >
                  PayPal Developer Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applySandboxDefaults}
              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Use Sandbox Preset
            </button>
            <button
              type="button"
              onClick={applyLiveDefaults}
              className="flex-1 px-3 py-2 bg-brand-green hover:bg-brand-green-dark rounded-lg text-sm font-medium text-brand-cream transition-colors"
            >
              Use Live Preset
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="paypalEnabled"
              checked={settings.enabled}
              onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <label htmlFor="paypalEnabled" className="text-sm font-medium text-gray-700">
              Enable PayPal Payments
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Client ID {settings.enabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={settings.client_id}
              onChange={e => setSettings({ ...settings, client_id: e.target.value })}
              placeholder="Enter your PayPal Client ID"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
              required={settings.enabled}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your PayPal Developer Dashboard under Apps & Credentials
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email {settings.enabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={settings.business_email}
              onChange={e => setSettings({ ...settings, business_email: e.target.value })}
              placeholder="your-business@example.com"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
              required={settings.enabled}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your PayPal business account email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paypalMode"
                  value="sandbox"
                  checked={settings.mode === 'sandbox'}
                  onChange={e => setSettings({ ...settings, mode: e.target.value as 'sandbox' | 'live' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Sandbox (Test)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paypalMode"
                  value="live"
                  checked={settings.mode === 'live'}
                  onChange={e => setSettings({ ...settings, mode: e.target.value as 'sandbox' | 'live' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Live (Production)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
