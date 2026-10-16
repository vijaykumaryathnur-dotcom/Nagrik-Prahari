import React from 'react';
import { ReportStatus } from '../../types/database';
import { Clock, CheckCircle2, UserCheck, Wrench, XCircle, Copy, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<
    ReportStatus,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    submitted: {
      label: 'Submitted',
      icon: <Clock className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#151D18]',
      text: 'text-[#9AA69C]',
      border: 'border-[#223128]',
    },
    verified: {
      label: 'Verified',
      icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#10222D]',
      text: 'text-[#70B8F5]',
      border: 'border-[#1B384A]',
    },
    assigned: {
      label: 'Assigned',
      icon: <UserCheck className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#171D2E]',
      text: 'text-[#90A7EC]',
      border: 'border-[#232F4C]',
    },
    in_progress: {
      label: 'In progress',
      icon: <Wrench className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#241E10]',
      text: 'text-[#F0B65A]',
      border: 'border-[#423419]',
    },
    resolved: {
      label: 'Resolved',
      icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#122419]',
      text: 'text-[#B8F36B]',
      border: 'border-[#224A30]',
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#291717]',
      text: 'text-[#F87171]',
      border: 'border-[#4C2020]',
    },
    duplicate: {
      label: 'Duplicate',
      icon: <Copy className="w-3.5 h-3.5 stroke-[2]" />,
      bg: 'bg-[#151D18]',
      text: 'text-[#9AA69C]',
      border: 'border-[#223128]',
    },
  };

  const item = config[status] || {
    label: status,
    icon: <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />,
    bg: 'bg-[#151D18]',
    text: 'text-[#9AA69C]',
    border: 'border-[#223128]',
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-xs ${item.bg} ${item.text} ${item.border} ${pad}`}
      role="status"
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
