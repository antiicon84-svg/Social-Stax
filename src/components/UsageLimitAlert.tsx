import React from 'react';

interface UsageLimitAlertProps {
  error: string | null;
  onDismiss?: () => void;
  type?: 'error' | 'warning';
}

const UsageLimitAlert: React.FC<UsageLimitAlertProps> = ({
  error,
  onDismiss,
  type = 'error',
}) => {
  if (!error) return null;

  const isError = type === 'error';
  const bgClass = isError ? 'bg-red-900/20' : 'bg-yellow-900/20';
  const borderClass = isError ? 'border-red-700' : 'border-yellow-700';
  const textClass = isError ? 'text-red-300' : 'text-yellow-300';
  const iconColor = isError ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-4 mb-4 flex items-start justify-between`}>
      <div className="flex items-start space-x-3">
        <span className={`text-xl ${iconColor} mt-0.5`}>
          {isError ? '🚫' : '⚠️'}
        </span>
        <div>
          <h3 className={`font-semibold ${textClass} mb-1`}>
            {isError ? 'Usage Limit Reached' : 'Usage Warning'}
          </h3>
          <p className={`text-sm ${textClass}`}>{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`ml-4 text-lg ${textClass} hover:opacity-75 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default UsageLimitAlert;
