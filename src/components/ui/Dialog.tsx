import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={`w-full ${widthClasses[maxWidth]} bg-[#121916] border border-[#223128] rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-[#F2F0E8]`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#223128] bg-[#0E1512]">
          <div>
            <h3 id="dialog-title" className="font-heading text-lg font-bold text-[#F2F0E8]">
              {title}
            </h3>
            {description && <p className="text-xs text-[#9AA69C] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9AA69C] hover:text-[#B8F36B] hover:bg-[#19221D] rounded-xs transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
