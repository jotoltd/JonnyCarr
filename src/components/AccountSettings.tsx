import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import type { User } from '../types';
import { updateUser } from '../lib/api';
import { User as UserIcon, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AccountSettingsProps {
  user: User;
  onUpdate: (updated: User) => void;
  onClose: () => void;
}

export function AccountSettings({ user, onUpdate, onClose }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');

  // Details form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [detailsError, setDetailsError] = useState('');
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError('');
    setDetailsSuccess('');

    if (!name.trim()) {
      setDetailsError('Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setDetailsError('A valid email is required');
      return;
    }

    setDetailsLoading(true);
    try {
      const updated = await updateUser(user.id, { name: name.trim(), email: email.trim() });
      onUpdate(updated);
      setDetailsSuccess('Details updated successfully!');
      setTimeout(() => setDetailsSuccess(''), 3000);
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : 'Failed to update details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUser(user.id, { password: newPassword });
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Account Settings</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage your profile and password</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'password'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              {detailsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}
              {detailsSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{detailsSuccess}</span>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={detailsLoading}>
                  {detailsLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
