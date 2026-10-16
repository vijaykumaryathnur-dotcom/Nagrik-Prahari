import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }> = ({
  children,
  className = '',
  required,
  ...props
}) => (
  <label
    className={`block text-xs font-semibold tracking-wider text-[#9AA69C] mb-1.5 ${className}`}
    {...props}
  >
    {children}
    {required && <span className="text-[#F87171] ml-1" aria-hidden="true">*</span>}
  </label>
);

export const FormField: React.FC<{
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}> = ({ label, error, hint, required, children, id }) => (
  <div className="space-y-1">
    {label && (
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-[#9AA69C] leading-relaxed">{hint}</p>}
    {error && (
      <p className="text-xs text-[#F87171] font-medium" role="alert">
        {error}
      </p>
    )}
  </div>
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ className = '', hasError, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full min-h-[44px] px-3.5 py-2.5 bg-[#121916] text-[#F2F0E8] text-sm border ${
      hasError ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#223128] focus:ring-[#B8F36B]'
    } rounded-xs focus:outline-none focus:ring-1 focus:border-[#B8F36B] placeholder:text-[#9AA69C]/50 transition-colors disabled:bg-[#0B0F0D] disabled:cursor-not-allowed ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(({ className = '', hasError, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full min-h-[100px] p-3 bg-[#121916] text-[#F2F0E8] text-sm border ${
      hasError ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#223128] focus:ring-[#B8F36B]'
    } rounded-xs focus:outline-none focus:ring-1 focus:border-[#B8F36B] placeholder:text-[#9AA69C]/50 transition-colors disabled:bg-[#0B0F0D] disabled:cursor-not-allowed ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(({ className = '', hasError, children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full min-h-[44px] px-3.5 py-2.5 bg-[#121916] text-[#F2F0E8] text-sm border ${
      hasError ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#223128] focus:ring-[#B8F36B]'
    } rounded-xs focus:outline-none focus:ring-1 focus:border-[#B8F36B] transition-colors disabled:bg-[#0B0F0D] disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
