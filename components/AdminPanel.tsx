import React, { useState } from 'react';
import { createFreeAccessGrant, revokeFreeAccessGrant, getFreeAccessGrants } from '../services/freeAccessService';
import Button from './Button';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grant' | 'manage'>('grant');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantPlan, setGrantPlan] = useState('starter');
  const [grantReason, setGrantReason] = useState('');
  const [grantExpiration, setGrantExpiration] = useState('');
  const [showCustomLimits, setShowCustomLimits] = useState(false);
  const [customLimits, setCustomLimits] = useState({
    contentGenerations: 0,
    imageGenerations: 0,
    voiceMinutes: 0,
    apiCalls: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [isLoadingGrants, setIsLoadingGrants] = useState(false);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail) {
      setMessage({ type: 'error', text: 'Please enter email address' });
      return;
    }

    setIsLoading(true);
    try {
      const expirationDate = grantExpiration ? new Date(grantExpiration) : null;
      
      await createFreeAccessGrant(grantEmail, grantPlan, {
        reason: grantReason,
        expiresAt: expirationDate,
        ...(showCustomLimits && { customLimits }),
      });

      setMessage({
        type: 'success',
        text: `Free access granted to ${grantEmail}`,
      });
      // Reset form
      setGrantEmail('');
      setGrantPlan('starter');
      setGrantReason('');
      setGrantExpiration('');
      setShowCustomLimits(false);
      setCustomLimits({ contentGenerations: 0, imageGenerations: 0, voiceMinutes: 0, apiCalls: 0 });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to grant access';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGrants = async () => {
    setIsLoadingGrants(true);
    try {
      const data = await getFreeAccessGrants();
      setGrants(data);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to load grants';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsLoadingGrants(false);
    }
  };

  const handleRevokeAccess = async (grantId: string, email: string) => {
    if (!window.confirm(`Revoke access for ${email}?`)) return;

    try {
      await revokeFreeAccessGrant(grantId);
      setMessage({ type: 'success', text: `Access revoked for ${email}` });
      setGrants(grants.filter((g) => g.id !== grantId));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to revoke access';
      setMessage({ type: 'error', text: errMsg });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🛡️ Admin Panel</h2>
        <p className="text-gray-400">Manage free access grants and user quotas</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded border ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}
        >
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('grant')}
          className={`pb-4 font-medium transition-colors ${
            activeTab === 'grant'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Grant Access
        </button>
        <button
          onClick={() => {
            setActiveTab('manage');
            handleLoadGrants();
          }}
          className={`pb-4 font-medium transition-colors ${
            activeTab === 'manage'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Manage Grants
        </button>
      </div>

      {/* Grant Access Tab */}
      {activeTab === 'grant' && (
        <form onSubmit={handleGrantAccess} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              placeholder="user@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plan Level</label>
              <select
                value={grantPlan}
                onChange={(e) => setGrantPlan(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expiration Date</label>
              <input
                type="date"
                value={grantExpiration}
                onChange={(e) => setGrantExpiration(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Grant</label>
            <textarea
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              placeholder="Beta testing, partnership, promotion, etc."
              rows={3}
            />
          </div>

          {/* Custom Limits Toggle */}
          <div className="border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setShowCustomLimits(!showCustomLimits)}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              {showCustomLimits ? '✓ Hide' : '+ Show'} Custom Usage Limits
            </button>

            {showCustomLimits && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Content Generations</label>
                  <input
                    type="number"
                    value={customLimits.contentGenerations}
                    onChange={(e) =>
                      setCustomLimits({
                        ...customLimits,
                        contentGenerations: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Image Generations</label>
                  <input
                    type="number"
                    value={customLimits.imageGenerations}
                    onChange={(e) =>
                      setCustomLimits({
                        ...customLimits,
                        imageGenerations: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Voice Minutes</label>
                  <input
                    type="number"
                    value={customLimits.voiceMinutes}
                    onChange={(e) =>
                      setCustomLimits({
                        ...customLimits,
                        voiceMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">API Calls</label>
                  <input
                    type="number"
                    value={customLimits.apiCalls}
                    onChange={(e) =>
                      setCustomLimits({
                        ...customLimits,
                        apiCalls: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>
            )}
          </div>

          <Button variant="primary" type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Granting Access...' : 'Grant Free Access'}
          </Button>
        </form>
      )}

      {/* Manage Grants Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {isLoadingGrants ? (
            <p className="text-gray-400">Loading grants...</p>
          ) : grants.length === 0 ? (
            <p className="text-gray-400">No active grants</p>
          ) : (
            <div className="space-y-3">
              {grants.map((grant) => (
                <div key={grant.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-medium">{grant.email}</p>
                    <p className="text-gray-400 text-sm">Plan: {grant.plan} • Reason: {grant.reason}</p>
                    {grant.expiresAt && (
                      <p className="text-yellow-400 text-sm">
                        Expires: {new Date(grant.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRevokeAccess(grant.id, grant.email)}
                    className="ml-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded text-sm"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
