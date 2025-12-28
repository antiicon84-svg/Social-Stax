import React, { useState, useEffect } from 'react';
import { getUserQuotaDisplay } from '~/services/aiUsageSafeWrapper';

interface UsageDisplayProps {
  uid: string;
  email: string;
  plan: string;
}

const UsageDisplay: React.FC<UsageDisplayProps> = ({ uid, email, plan }) => {
  const [quota, setQuota] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const data = await getUserQuotaDisplay(uid, email, plan);
        setQuota(data);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load usage data';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuota();
  }, [uid, email, plan]);

  const renderProgressBar = (
    label: string,
    used: number,
    limit: number,
    icon: string
  ) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const isWarning = percentage >= 80;
    const isLimited = percentage >= 100;

    return (
      <div key={label} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-gray-300 font-medium">{label}</span>
          </div>
          <span className="text-sm text-gray-400">
            {used} / {limit === -1 ? '∞' : limit}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isLimited ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Status Text */}
        {isLimited && (
          <p className="text-xs text-red-400 mt-2">🚫 Limit reached</p>
        )}
        {isWarning && !isLimited && (
          <p className="text-xs text-yellow-400 mt-2">⚠️ {Math.round(100 - percentage)}% remaining</p>
        )}
        {!isWarning && !isLimited && limit > 0 && (
          <p className="text-xs text-green-400 mt-2">✓ {Math.round(100 - percentage)}% remaining</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400">Loading usage data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-red-700/50">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400">No usage data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">📊 Your Usage This Month</h3>
        <p className="text-sm text-gray-400">Usage resets on the 1st of each month</p>
      </div>

      {/* Content Generation */}
      {quota.contentGenerations && renderProgressBar(
        'Content Generation',
        quota.contentGenerations.used,
        quota.contentGenerations.limit,
        '✍️'
      )}

      {/* Image Generation */}
      {quota.imageGenerations && renderProgressBar(
        'Image Generation',
        quota.imageGenerations.used,
        quota.imageGenerations.limit,
        '🖼️'
      )}

      {/* Voice Assistant */}
      {quota.voiceAssistant && renderProgressBar(
        'Voice Assistant (minutes)',
        quota.voiceAssistant.used,
        quota.voiceAssistant.limit,
        '🎙️'
      )}

      {/* API Calls */}
      {quota.apiCalls && renderProgressBar(
        'API Calls',
        quota.apiCalls.used,
        quota.apiCalls.limit,
        '⚙️'
      )}

      {/* Plan Info */}
      <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700/50 rounded">
        <p className="text-blue-300 text-sm">
          <span className="font-semibold">Current Plan:</span> {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </p>
        <p className="text-blue-300 text-sm mt-1">
          Need more? Upgrade your plan to get higher limits.
        </p>
      </div>
    </div>
  );
};

export default UsageDisplay;
