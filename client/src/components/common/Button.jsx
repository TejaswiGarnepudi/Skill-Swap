import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-violet-500 text-white hover:bg-violet-600 focus:ring-violet-300',
  secondary: 'border-2 border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white',
  coral: 'bg-coral-500 text-white hover:bg-coral-600 focus:ring-coral-300',
  ghost: 'bg-transparent text-plum-700 hover:bg-lavender-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
