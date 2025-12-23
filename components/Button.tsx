import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 border border-red-500/20',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700',
    outline: 'border-2 border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white',
    danger: 'bg-red-950/50 text-red-500 border border-red-900/50 hover:bg-red-900 hover:text-white',
    ghost: 'text-gray-400 hover:bg-gray-900 hover:text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-2',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-3'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

export default Button;
