import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  FileCheck,
} from 'lucide-react';

interface Stage {
  num: string;
  key: string;
  title: string;
  subtitle: string;
  actor: string;
  slaRule: string;
  telemetry: string;
  icon: React.ReactNode;
}

const STAGES: Stage[] = [
  {
    num: '01',
    key: 'report',
    title: 'Report',
    subtitle: 'Citizen geo-locates the defect on-site with mandatory photographic evidence and GPS coordinate lock.',
    actor: 'Citizen / Community Resident',
    slaRule: 'Logged in < 2 mins',
    telemetry: 'POSTGIS SRID 4326 · TAMPER PROOF',
    icon: <Camera className="w-5 h-5 text-[#B8F36B]" />,
  },
  {
    num: '02',
    key: 'verify',
    title: 'Verify',
    subtitle: 'Automated 30-meter radius audit flags potential duplicates; municipal reviewer validates authenticity.',
    actor: 'Municipal Verification Officer',
    slaRule: 'Audited in < 2 hours',
    telemetry: 'find_similar_reports() · HUMAN AUDIT',
    icon: <Search className="w-5 h-5 text-[#70B8F5]" />,
  },
  {
    num: '03',
    key: 'assign',
    title: 'Assign',
    subtitle: 'Dispatched to competent engineering wing (Roads, Drainage, Electrical) with statutory SLA clock running.',
    actor: 'Departmental Dispatch Desk',
    slaRule: 'Statutory SLA countdown live',
    telemetry: 'AUTO ESCALATION AT 75% TIME',
    icon: <UserCheck className="w-5 h-5 text-[#F0B65A]" />,
  },
  {
    num: '04',
    key: 'resolve',
    title: 'Resolve',
    subtitle: 'Ward field maintenance squad deploys material, asphalt, and equipment to execute the physical repairs.',
    actor: 'Ward Engineering Field Squad',
    slaRule: 'Physical field execution',
    telemetry: 'CREW TRACKING · FIELD DISPATCH',
    icon: <Wrench className="w-5 h-5 text-[#F0B65A]" />,
  },
  {
    num: '05',
    key: 'confirm',
    title: 'Confirm',
    subtitle: 'Field officer must photograph completed work. System denies closure without matching after-photo evidence.',
    actor: 'Assistant Executive Engineer',
    slaRule: 'Mandatory completion photo proof',
    telemetry: 'CRYPTOGRAPHIC AUDIT SEAL',
    icon: <ShieldCheck className="w-5 h-5 text-[#B8F36B]" />,
  },
];

interface ResolutionJourneyTimelineProps {
  total?: number;
  addressing?: number;
  resolved?: number;
  resolutionRate?: number;
}

export const ResolutionJourneyTimeline: React.FC<ResolutionJourneyTimelineProps> = ({
  total = 428,
  addressing = 34,
  resolved = 376,
  resolutionRate = 88,
}) => {
  const [activeStage, setActiveStage] = useState(0);

  // Auto-advance stages gently every 5 seconds if idle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const current = STAGES[activeStage];

  return (
    <div className="relative rounded-xs border border-[#223128] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
      {/* 1. Atmospheric Indian Urban Background (Hyderabad Illuminated Flyover & Skyline) */}
      <img
        src="/images/hyderabad_urban_night.jpg"
        alt="Indian Urban Infrastructure at Night"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-105 pointer-events-none"
      />

      {/* Cinematic dark gradients over background for contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080D0B] via-[#0E1512]/92 to-[#080D0B] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080D0B] via-transparent to-[#080D0B] pointer-events-none" />

      {/* Subtle Indian Tricolor Hairline Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F0A443] via-[#FFFFFF] to-[#138808] opacity-75" />

      <div className="relative z-10 p-6 sm:p-10 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#223128]/80 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#14271B] border border-[#234A31] rounded-xs text-[#B8F36B] text-[11px] font-mono tracking-wider font-semibold">
              <span>BHARAT IN MOTION // RESOLUTION JOURNEY</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3F0E7]">
              From Incident Report to Verified Resolution
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA69C] max-w-2xl">
              A transparent, 5-stage chain of custody ensuring public infrastructure complaints are verified, assigned to competent departments, and physically validated with photographic evidence.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs text-[#9AA69C]">
            <span className="text-[11px] uppercase tracking-wider">PROTOCOL STAGE:</span>
            <span className="text-[#B8F36B] font-bold text-sm bg-[#121916] px-2.5 py-1 border border-[#223128] rounded-xs">
              {current.num} / 05
            </span>
          </div>
        </div>

        {/* 5-Stage Horizontal Process Stepper Ribbon */}
        <div className="relative">
          {/* Background Connecting Hairline on desktop */}
          <div className="hidden lg:block absolute top-[28px] left-8 right-8 h-[2px] bg-[#223128] z-0" />

          {/* Animated Glowing Progress Beam */}
          <motion.div
            className="hidden lg:block absolute top-[28px] left-8 h-[2px] bg-[#B8F36B] z-0"
            animate={{
              width: `${(activeStage / (STAGES.length - 1)) * 88}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 12px rgba(184,243,107,0.6)' }}
          />

          {/* Horizontal 5 Stage Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
            {STAGES.map((stg, idx) => {
              const isActive = idx === activeStage;
              const isCompleted = idx < activeStage;

              return (
                <button
                  key={stg.key}
                  onClick={() => setActiveStage(idx)}
                  className={`p-4 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#19221D]/95 border-[#B8F36B] shadow-[0_0_24px_rgba(184,243,107,0.2)] ring-1 ring-[#B8F36B]'
                      : isCompleted
                      ? 'bg-[#121916]/90 border-[#224A30] text-[#9AA69C] hover:bg-[#16221B]'
                      : 'bg-[#0E1411]/85 border-[#223128] text-[#9AA69C] hover:bg-[#151D18]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isActive ? 'text-[#B8F36B]' : isCompleted ? 'text-[#B8F36B]/80' : 'text-[#9AA69C]'
                      }`}
                    >
                      {stg.num}
                    </span>
                    <div
                      className={`p-2 rounded-xs border transition-colors ${
                        isActive
                          ? 'bg-[#14271B] border-[#224A30]'
                          : 'bg-[#121916] border-[#223128]'
                      }`}
                    >
                      {stg.icon}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`font-heading text-sm font-bold block ${
                        isActive ? 'text-[#F3F0E7]' : isCompleted ? 'text-[#F2F0E8]' : 'text-[#9AA69C]'
                      }`}
                    >
                      {stg.title}
                    </span>
                    <span className="text-[11px] text-[#9AA69C]/80 block font-mono mt-0.5">
                      {stg.actor}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Telemetry Spotlight Card for Active Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 bg-[#0E1411]/90 backdrop-blur-md border border-[#223128] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#B8F36B]">
                  STAGE {current.num} PROTOCOL:
                </span>
                <span className="font-heading text-base font-bold text-[#F3F0E7]">
                  {current.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D0D9D1] leading-relaxed">
                {current.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t md:border-t-0 md:border-l border-[#223128] pt-4 md:pt-0 md:pl-6 text-xs shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#9AA69C] block">
                  Statutory Rule
                </span>
                <span className="font-semibold text-[#B8F36B] block">
                  {current.slaRule}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#9AA69C] block">
                  Audit Registry Flag
                </span>
                <span className="font-mono text-[11px] text-[#F0B65A] bg-[#261E10] px-2.5 py-1 rounded-xs border border-[#4A3B18] block">
                  {current.telemetry}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Civic Statistics Aligned Along the Lower Portion (Horizontal on Desktop) */}
        <div className="pt-4 border-t border-[#223128]/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#121916]/80 backdrop-blur-sm border border-[#223128] rounded-xs flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase font-semibold text-[#9AA69C]">
                Total Civic Intake
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#F3F0E7]">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-[#B8F36B]">
                  verified entries
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#121916]/80 backdrop-blur-sm border border-[#223128] rounded-xs flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase font-semibold text-[#9AA69C]">
                Active In Field
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#F0B65A]">
                  {addressing}
                </span>
                <span className="text-[10px] font-mono text-[#F0B65A]/80">
                  squads dispatched
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#121916]/80 backdrop-blur-sm border border-[#223128] rounded-xs flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase font-semibold text-[#9AA69C]">
                Proof Resolved
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#B8F36B]">
                  {resolved}
                </span>
                <span className="text-[10px] font-mono text-[#B8F36B]">
                  100% photo sealed
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#121916]/80 backdrop-blur-sm border border-[#223128] rounded-xs flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase font-semibold text-[#9AA69C]">
                SLA Compliance
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#F3F0E7]">
                  {resolutionRate}%
                </span>
                <span className="text-[10px] font-mono text-[#B8F36B]">
                  avg 28.4h closure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
