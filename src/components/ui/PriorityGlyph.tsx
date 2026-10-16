import React from 'react';
import { SeverityLevel } from '../../types/database';

interface PriorityGlyphProps {
  priority: SeverityLevel;
  showLabel?: boolean;
  className?: string;
}

export const PriorityGlyph: React.FC<PriorityGlyphProps> = ({
  priority,
  showLabel = true,
  className = '',
}) => {
  const levels: Record<SeverityLevel, { count: number; label: string; activeColor: string }> = {
    low: { count: 1, label: 'Low', activeColor: 'bg-[#9AA69C]' },
    medium: { count: 2, label: 'Medium', activeColor: 'bg-[#70B8F5]' },
    high: { count: 3, label: 'High', activeColor: 'bg-[#F0B65A]' },
    critical: { count: 4, label: 'Critical', activeColor: 'bg-[#B8F36B]' },
  };

  const current = levels[priority] || levels.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium text-xs text-[#F2F0E8] ${className}`}
      title={`Priority: ${current.label}`}
    >
      <span className="inline-flex items-end gap-[2px] h-3.5 w-4" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = step <= current.count;
          const heightClass =
            step === 1 ? 'h-[4px]' : step === 2 ? 'h-[7px]' : step === 3 ? 'h-[10px]' : 'h-[13px]';
          return (
            <span
              key={step}
              className={`w-[2.5px] rounded-[1px] transition-colors ${heightClass} ${
                isFilled ? current.activeColor : 'bg-[#223128]'
              }`}
            />
          );
        })}
      </span>
      {showLabel && <span>{current.label}</span>}
    </span>
  );
};
