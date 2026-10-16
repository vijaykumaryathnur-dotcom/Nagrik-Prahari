import React from 'react';
import { Link } from 'react-router-dom';
import { PublicReport } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { StatusBadge } from './ui/StatusBadge';
import { PriorityGlyph } from './ui/PriorityGlyph';
import { Button } from './ui/Button';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface QuickReportModalProps {
  report: PublicReport | null;
  onClose: () => void;
  language: 'en' | 'hi' | 'te';
}

export const QuickReportModal: React.FC<QuickReportModalProps> = ({
  report,
  onClose,
  language,
}) => {
  if (!report) return null;

  const categoryLabel = CATEGORY_LABELS[report.category]?.[language] || report.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F0D]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#121916] border border-[#223128] rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs text-[#F2F0E8]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-report-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#223128] flex items-start justify-between gap-4 bg-[#0E1512]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono font-bold text-sm text-[#B8F36B]">
                {report.ref_code}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] bg-[#19221D] px-2 py-0.5 border border-[#223128] rounded-xs font-mono">
                PUBLIC LEDGER RECORD
              </span>
            </div>
            <h3 id="quick-report-title" className="font-heading text-2xl font-bold text-[#F2F0E8]">
              {categoryLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9AA69C] hover:text-[#F2F0E8] hover:bg-[#19221D] rounded-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Status & Priority Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-1">
                Current Status
              </span>
              <StatusBadge status={report.status} size="sm" />
            </div>

            <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-1">
                Severity Level
              </span>
              <PriorityGlyph priority={report.effective_priority} />
            </div>

            <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-1">
                Citizen Upvotes
              </span>
              <span className="font-heading text-lg font-bold text-[#F2F0E8] tabular-nums">
                {report.upvote_count || 1}
              </span>
            </div>

            <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-1">
                Assigned Ward
              </span>
              <span className="font-mono text-xs font-bold text-[#B8F36B]">
                {report.ward_id || 'Ward 04'}
              </span>
            </div>
          </div>

          {/* Stepper Chain of Custody */}
          <div className="border border-[#223128] rounded-xs p-4 bg-[#0E1512]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9AA69C] block mb-3 font-mono">
              Resolution Chain of Custody
            </span>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className={`p-2 rounded-xs border ${
                ['submitted', 'verified', 'assigned', 'in_progress', 'resolved'].includes(report.status)
                  ? 'bg-[#14271B] border-[#224A30] text-[#B8F36B]'
                  : 'bg-[#19221D] border-[#223128] text-[#9AA69C]'
              }`}>
                <span className="font-bold block">1. Filed</span>
                <span className="text-[10px] opacity-80">Photo + GPS</span>
              </div>

              <div className={`p-2 rounded-xs border ${
                ['verified', 'assigned', 'in_progress', 'resolved'].includes(report.status)
                  ? 'bg-[#14271B] border-[#224A30] text-[#B8F36B]'
                  : 'bg-[#19221D] border-[#223128] text-[#9AA69C]'
              }`}>
                <span className="font-bold block">2. Verified</span>
                <span className="text-[10px] opacity-80">Officer audit</span>
              </div>

              <div className={`p-2 rounded-xs border ${
                ['in_progress', 'resolved'].includes(report.status)
                  ? 'bg-[#14271B] border-[#224A30] text-[#B8F36B]'
                  : 'bg-[#19221D] border-[#223128] text-[#9AA69C]'
              }`}>
                <span className="font-bold block">3. Field Crew</span>
                <span className="text-[10px] opacity-80">Active repair</span>
              </div>

              <div className={`p-2 rounded-xs border ${
                report.status === 'resolved'
                  ? 'bg-[#B8F36B] text-[#0B0F0D] border-[#B8F36B] font-bold'
                  : 'bg-[#19221D] border-[#223128] text-[#9AA69C]'
              }`}>
                <span className="font-bold block">4. Resolved</span>
                <span className="text-[10px] opacity-80">Photo proof</span>
              </div>
            </div>
          </div>

          {/* Coordinates & Location */}
          <div className="p-4 bg-[#19221D] border border-[#223128] rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-[#9AA69C] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B8F36B]" />
                PostGIS Geographic Coordinates
              </span>
              <span className="font-mono text-xs text-[#B8F36B]">
                {report.lat ? `${report.lat.toFixed(5)}° N, ${report.lng?.toFixed(5)}° E` : '17.3850° N, 78.4867° E'}
              </span>
            </div>
            <p className="text-[#9AA69C] text-xs">
              Logged into municipal grid SRID 4326. Subject to automated spatial duplicate detection within a 30-meter radius.
            </p>
          </div>

          {/* SLA Timeline */}
          <div className="space-y-2 border-t border-[#223128] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9AA69C]">Filing Timestamp:</span>
              <span className="font-mono text-[#F2F0E8]">
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>

            {report.sla_due_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9AA69C]">Target SLA Deadline:</span>
                <span className="font-mono font-semibold text-[#F0B65A]">
                  {new Date(report.sla_due_at).toLocaleString()}
                </span>
              </div>
            )}

            {report.resolved_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B8F36B] font-semibold">Verified Closure Date:</span>
                <span className="font-mono font-bold text-[#B8F36B]">
                  {new Date(report.resolved_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0E1512] border-t border-[#223128] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9AA69C] hover:text-[#F2F0E8] hover:bg-[#19221D] rounded-xs transition-colors cursor-pointer"
          >
            Close Quick View
          </button>

          <Link to={`/reports/${report.id}`} onClick={onClose}>
            <Button variant="primary" size="md" className="gap-2 text-xs">
              <span>Open Complete Ledger Record</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
