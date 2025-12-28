import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label }) => {
  const sizes = {
    sm: 16,
    md: 32,
    lg: 48
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse" />
        <Loader2 
          className="animate-spin text-red-600 relative z-10" 
          size={sizes[size]} 
        />
      </div>
      {label && <p className="text-sm text-gray-500 font-medium animate-pulse">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
