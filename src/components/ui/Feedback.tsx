import React from 'react';
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#121916] border border-[#223128] rounded-xs shadow-xs">
    <div className="p-3.5 bg-[#19221D] border border-[#223128] rounded-full text-[#9AA69C] mb-3.5">
      {icon || <Inbox className="w-6 h-6 stroke-[1.8]" />}
    </div>
    <h4 className="font-heading text-base sm:text-lg font-bold text-[#F2F0E8]">{title}</h4>
    <p className="text-xs sm:text-sm text-[#9AA69C] max-w-sm mt-1.5 mb-5 leading-relaxed">
      {description}
    </p>
    {actionText && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Action could not be completed', message, onRetry }) => (
  <div className="p-4 sm:p-5 bg-[#251313] border border-[#4D1B1B] rounded-xs text-left">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#F87171]">{title}</h4>
        <p className="text-xs text-[#FCA5A5] leading-relaxed">{message}</p>
        {onRetry && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="!border-[#7F1D1D] !text-[#FCA5A5] hover:!bg-[#3F1414]"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-[#19221D] border border-[#223128]/50 rounded-xs ${className}`} />
);

export const Toast: React.FC<{
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}> = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-[#12261A] border-[#224A32] text-[#B8F36B]',
    error: 'bg-[#291414] border-[#521E1E] text-[#FCA5A5]',
    info: 'bg-[#11212B] border-[#1D3E52] text-[#70B8F5]',
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-50 flex items-center justify-between gap-3 px-4 py-3 border rounded-xs shadow-xl text-xs font-medium ${styles[type]} max-w-md`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 font-bold ml-2 text-sm"
          aria-label="Dismiss message"
        >
          &times;
        </button>
      )}
    </div>
  );
};
