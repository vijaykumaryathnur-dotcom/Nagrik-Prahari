import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'forest';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F0D] disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer select-none';

  const sizes = {
    sm: 'min-h-[36px] px-3.5 py-1.5 text-xs rounded-sm',
    md: 'min-h-[44px] px-5 py-2.5 rounded-sm', // 44px min touch target
    lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base rounded-sm',
  };

  const variants = {
    primary:
      'bg-[#B8F36B] text-[#0B0F0D] hover:bg-[#C9F788] active:bg-[#A5E355] font-bold shadow-[0_0_20px_rgba(184,243,107,0.2)] hover:shadow-[0_0_25px_rgba(184,243,107,0.35)]',
    secondary:
      'bg-[#19221D] text-[#F2F0E8] border border-[#223128] hover:bg-[#202D26] hover:border-[#2C4135] active:bg-[#131B17]',
    outline:
      'bg-transparent text-[#F2F0E8] border border-[#223128] hover:border-[#B8F36B] hover:text-[#B8F36B]',
    forest:
      'bg-[#1A3326] text-[#B8F36B] border border-[#234F3A] hover:bg-[#204030]',
    destructive:
      'bg-[#3F1414] text-[#FCA5A5] border border-[#7F1D1D] hover:bg-[#521A1A]',
    ghost:
      'bg-transparent text-[#9AA69C] hover:text-[#F2F0E8] hover:bg-[#19221D]',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
