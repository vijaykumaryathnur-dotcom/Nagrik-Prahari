import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, Activity, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface CityPulseStripProps {
  total: number;
  awaitingReview: number;
  addressing: number;
  resolved: number;
  resolutionRate: number;
  isDemoData: boolean;
}

export const CityPulseStrip: React.FC<CityPulseStripProps> = ({
  total,
  awaitingReview,
  addressing,
  resolved,
  resolutionRate,
  isDemoData,
}) => {
  return (
    <div className="bg-[#121916] border border-[#223128] rounded-xs shadow-xl overflow-hidden">
      {/* Top Section Kicker */}
      <div className="px-6 py-4 bg-[#0E1512] border-b border-[#223128] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#F2F0E8] uppercase">
            CITY PULSE // MUNICIPAL RESOLUTION TELEMETRY
          </span>
          <span className="text-[#223128] hidden sm:inline">|</span>
          <span className="text-[#9AA69C] hidden sm:inline text-[11px] font-mono">
            GREATER HYDERABAD MUNICIPAL JURISDICTION
          </span>
        </div>

        {isDemoData && (
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#261E10] border border-[#4A3B18] text-[#F0B65A] rounded-xs">
            DEMONSTRATION DATASET
          </span>
        )}
      </div>

      {/* Asymmetric 4-Part Horizontal Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#223128]">
        {/* Metric 1: Total Reports (3 cols) */}
        <div className="lg:col-span-3 p-6 sm:p-7 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#9AA69C] block">
              01 // TOTAL INTAKE
            </span>
            <span className="font-heading text-4xl sm:text-5xl font-bold text-[#F2F0E8] tabular-nums tracking-tight">
              {total.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-[#9AA69C] leading-relaxed pt-2">
            Total complaints logged into PostGIS spatial database.
          </p>
        </div>

        {/* Metric 2: Awaiting Review (2.5 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 space-y-2 flex flex-col justify-between bg-[#101714]">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#70B8F5] block">
              02 // QUEUE AUDIT
            </span>
            <span className="font-heading text-3xl sm:text-4xl font-bold text-[#70B8F5] tabular-nums tracking-tight">
              {awaitingReview}
            </span>
          </div>
          <p className="text-xs text-[#9AA69C] leading-relaxed pt-2">
            Pending initial review & spatial duplicate filtering.
          </p>
        </div>

        {/* Metric 3: Active Repairs (2.5 cols) */}
        <div className="lg:col-span-3 p-6 sm:p-7 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#F0B65A] block">
              03 // ACTIVE WORK ORDERS
            </span>
            <span className="font-heading text-3xl sm:text-4xl font-bold text-[#F0B65A] tabular-nums tracking-tight">
              {addressing}
            </span>
          </div>
          <p className="text-xs text-[#9AA69C] leading-relaxed pt-2">
            Dispatched to field squads with statutory SLA countdowns.
          </p>
        </div>

        {/* Metric 4: Verified Resolutions (4 cols - Dominant Anchor) */}
        <div className="lg:col-span-4 p-6 sm:p-7 space-y-3 flex flex-col justify-between bg-[#14271B]/50 border-t lg:border-t-0 border-[#234A31]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#B8F36B] font-bold block">
                04 // VERIFIED RESOLUTIONS
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl sm:text-5xl font-bold text-[#B8F36B] tabular-nums tracking-tight">
                  {resolved}
                </span>
                <span className="font-mono text-sm font-bold text-[#B8F36B] bg-[#1A3825] px-2 py-0.5 rounded-xs border border-[#235836]">
                  {resolutionRate}% RATE
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-[#1A3825] border border-[#235836] rounded-xs text-[#B8F36B]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#9AA69C] leading-relaxed">
            100% verified with mandatory before & after photographic evidence signed off by ward engineers.
          </p>
        </div>
      </div>
    </div>
  );
};
