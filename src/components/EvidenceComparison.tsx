import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
  Sliders,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface CaseStudy {
  id: string;
  refCode: string;
  category: string;
  ward: string;
  location: string;
  gpsCoords: string;
  reportedTime: string;
  resolvedTime: string;
  slaTargetHours: number;
  actualHours: number;
  officerBadge: string;
  before: {
    title: string;
    description: string;
    inspectionMetrics: string[];
    severity: string;
    svgDiagram: 'pothole' | 'streetlight' | 'drain';
  };
  after: {
    title: string;
    description: string;
    completionMetrics: string[];
    contractorUnit: string;
    svgDiagram: 'pothole_repaired' | 'streetlight_repaired' | 'drain_repaired';
  };
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-pothole',
    refCode: 'HYD-2026-0012',
    category: 'Road Crater & Pothole',
    ward: 'Ward 04 (Banjara Hills)',
    location: 'Road No. 12, near Municipal Water Reservoir Junction',
    gpsCoords: '17.4123° N, 78.4482° E',
    reportedTime: 'Oct 14, 2026 · 10:42 AM',
    resolvedTime: 'Oct 15, 2026 · 06:15 AM',
    slaTargetHours: 24,
    actualHours: 19.5,
    officerBadge: 'EE-RD-402 (Assistant Executive Engineer)',
    before: {
      title: 'Active Asphalt Cavity & Sub-base Erosion',
      description: 'Severe 18cm crater obstructing main two-wheeler transit lane. Water infiltration expanding edge fracturing under heavy bus transit.',
      inspectionMetrics: ['Depth: 18.2 cm', 'Surface Area: 1.4 m²', 'Edge Cracking: Severe', 'Traffic Risk: High'],
      severity: 'Critical Priority',
      svgDiagram: 'pothole',
    },
    after: {
      title: 'Hot-Mix Bituminous Leveling & Roller Compaction',
      description: 'Excavated 10cm perimeter, tack coat bitumen applied, dense bituminous macadam layered and vibro-compacted to 98% density test.',
      completionMetrics: ['Hot-mix Bitumen: 40mm VG-30', 'Compaction Test: Passed', 'Curb Alignment: Flush', 'Warranty: 18 Months'],
      contractorUnit: 'GHMC Rapid Road Repair Squad #4',
      svgDiagram: 'pothole_repaired',
    },
  },
  {
    id: 'case-streetlight',
    refCode: 'HYD-2026-0024',
    category: 'Broken Streetlight & Exposed Feeder',
    ward: 'Ward 07 (Secunderabad)',
    location: 'Station Road, Pillar 42 adjacent to Metro Exit B',
    gpsCoords: '17.4399° N, 78.4982° E',
    reportedTime: 'Oct 13, 2026 · 07:18 PM',
    resolvedTime: 'Oct 14, 2026 · 02:40 PM',
    slaTargetHours: 48,
    actualHours: 19.3,
    officerBadge: 'EE-EL-118 (Electrical Maintenance Wing)',
    before: {
      title: 'Luminaire Failure & Weathered Feeder Box',
      description: 'Damaged masthead fixture with exposed neutral wire dangling near pedestrian sidewalk. Total zero illuminance zone at crosswalk.',
      inspectionMetrics: ['Illuminance: 0 Lux (Failed)', 'Cable Condition: Exposed Neutral', 'Pedestrian Risk: Electrocution', 'Fixture Age: 8 Years'],
      severity: 'High Priority',
      svgDiagram: 'streetlight',
    },
    after: {
      title: 'Modular LED Luminaire Installed & Junction Sealed',
      description: 'Replaced ballast and fitting with IP66 rated 90W LED module. Rewired junction box with armored cable and tamper-evident seal.',
      completionMetrics: ['Luminance: 42 Lux (Standard)', 'IP Rating: IP66 Weatherproof', 'Surge Protection: 10kV', 'Power Saving: 64%'],
      contractorUnit: 'Ward Electrical Works Division',
      svgDiagram: 'streetlight_repaired',
    },
  },
  {
    id: 'case-drain',
    refCode: 'HYD-2026-0018',
    category: 'Collapsed Stormwater Grate',
    ward: 'Ward 02 (Khairatabad)',
    location: 'Raj Bhavan Road, near Transit Crosswalk No. 3',
    gpsCoords: '17.4188° N, 78.4612° E',
    reportedTime: 'Oct 15, 2026 · 08:05 AM',
    resolvedTime: 'Oct 15, 2026 · 04:30 PM',
    slaTargetHours: 12,
    actualHours: 8.4,
    officerBadge: 'EE-SWD-091 (Stormwater Drain Inspector)',
    before: {
      title: 'Dislodged Cast-Iron Grate with Open Drop',
      description: 'Cast iron cover shattered by overweight axle load. 2.1-meter deep open drop hazard directly on pedestrian footpath during monsoon.',
      inspectionMetrics: ['Drop Depth: 210 cm', 'Grate Status: Shattered/Missing', 'Pedestrian Hazard: Fatal', 'SLA Category: Emergency (12h)'],
      severity: 'Emergency Critical',
      svgDiagram: 'drain',
    },
    after: {
      title: 'Ductile Iron Grate & Reinforced Concrete Frame',
      description: 'Cast in-situ M30 concrete bedding, bolted heavy-duty ductile iron hinged grating with locking pin to prevent displacement.',
      completionMetrics: ['Load Class: D400 (40 Tonne)', 'Bedding: M30 Reinforced', 'Hinged Lock: Installed', 'Water Flow: 100% Unrestricted'],
      contractorUnit: 'Central Drainage Emergency Unit',
      svgDiagram: 'drain_repaired',
    },
  },
];

export const EvidenceComparison: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'after'>('split');

  const currentCase = CASE_STUDIES[activeCaseIndex];

  return (
    <div className="bg-[#121916] border border-[#223128] rounded-xs shadow-xl overflow-hidden">
      {/* 1. Curatorial Section Header */}
      <div className="p-6 sm:p-8 border-b border-[#223128] bg-[#0E1512]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B8F36B]">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifiable Resolution Standard</span>
              <span>·</span>
              <span className="font-mono text-[11px]">Audit Protocol #7</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
              Photographic Proof Before Ticket Closure
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA69C] leading-relaxed">
              In traditional municipal systems, complaints are often stamped &ldquo;resolved&rdquo; on paper without physical work.
              NagrikPrahari enforces an immutable photographic chain of custody: field teams must upload verifiable on-site evidence before any ticket is legally closed.
            </p>
          </div>

          {/* View Mode Segmented Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#19221D] border border-[#223128] rounded-xs self-start lg:self-auto text-xs font-semibold">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                viewMode === 'split' ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold shadow-xs' : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('before')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                viewMode === 'before' ? 'bg-[#F0B65A] text-[#0B0F0D] font-bold shadow-xs' : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              Citizen Filing
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                viewMode === 'after' ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold shadow-xs' : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              Resolution Proof
            </button>
          </div>
        </div>

        {/* Case Study Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#223128]">
          {CASE_STUDIES.map((cs, idx) => (
            <button
              key={cs.id}
              onClick={() => setActiveCaseIndex(idx)}
              className={`p-3.5 text-left border rounded-xs transition-all flex flex-col justify-between cursor-pointer ${
                activeCaseIndex === idx
                  ? 'bg-[#19221D] border-[#B8F36B] shadow-[0_0_15px_rgba(184,243,107,0.1)]'
                  : 'bg-[#121916] border-[#223128] hover:bg-[#19221D] text-[#9AA69C]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[11px] font-bold text-[#B8F36B]">
                  {cs.refCode}
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#B8F36B] bg-[#14271B] border border-[#234A31] px-1.5 py-0.5 rounded-xs">
                  Resolved
                </span>
              </div>
              <span className="font-heading text-xs font-bold text-[#F2F0E8] line-clamp-1">
                {cs.category}
              </span>
              <span className="text-[11px] text-[#9AA69C] mt-1 line-clamp-1">
                {cs.ward}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Before/After Evidence Canvas */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Incident Summary Metadata Strip */}
        <div className="p-4 bg-[#19221D] border border-[#223128] rounded-xs flex flex-wrap items-center justify-between gap-4 text-xs text-[#9AA69C]">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block">
              Incident Location & Coordinates
            </span>
            <div className="flex items-center gap-2 font-medium text-[#F2F0E8]">
              <MapPin className="w-3.5 h-3.5 text-[#B8F36B]" />
              <span>{currentCase.location}</span>
              <span className="font-mono text-[11px] text-[#9AA69C]">({currentCase.gpsCoords})</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block">
                SLA Compliance
              </span>
              <span className="font-bold text-[#B8F36B]">
                {currentCase.actualHours} hrs{' '}
                <span className="text-[#9AA69C] font-normal">
                  ({currentCase.slaTargetHours}h SLA target)
                </span>
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block">
                Verification Officer
              </span>
              <span className="font-mono font-medium text-[#F2F0E8]">
                {currentCase.officerBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Comparison Columns */}
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Column A: Citizen Before Evidence */}
          {(viewMode === 'split' || viewMode === 'before') && (
            <div className="border border-[#223128] rounded-xs overflow-hidden flex flex-col justify-between bg-[#0E1411] shadow-md">
              {/* Header */}
              <div className="p-4 bg-[#121916] border-b border-[#223128] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#F0B65A] block">
                    Phase 1 · Citizen Initial Evidence
                  </span>
                  <span className="font-heading text-sm font-bold text-[#F2F0E8]">
                    {currentCase.before.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#19221D] border border-[#223128] text-[#9AA69C] rounded-xs">
                  {currentCase.reportedTime}
                </span>
              </div>

              {/* Technical Drawing Canvas (Vector Inspection Diagram) */}
              <div className="p-6 bg-[#0B0F0D] border-b border-[#223128] flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                <div className="w-full max-w-sm h-36 flex items-center justify-center">
                  {currentCase.before.svgDiagram === 'pothole' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <rect x="10" y="80" width="300" height="30" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      {/* Pothole crater */}
                      <path d="M 60 80 Q 90 85 120 105 Q 160 115 200 95 Q 230 82 260 80 Z" fill="#241B12" stroke="#F0B65A" strokeWidth="2" strokeDasharray="3,3" />
                      {/* Depth measurement gauge */}
                      <line x1="160" y1="80" x2="160" y2="114" stroke="#EF4444" strokeWidth="1.5" />
                      <text x="170" y="100" fill="#F87171" fontSize="10" fontFamily="monospace" fontWeight="bold">Δ -18.2 cm</text>
                      <text x="20" y="40" fill="#9AA69C" fontSize="10" fontFamily="monospace">CITIZEN PHOTO LOGGED: #01-A</text>
                      <circle cx="160" cy="98" r="4" fill="#F0B65A" />
                    </svg>
                  )}

                  {currentCase.before.svgDiagram === 'streetlight' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <line x1="60" y1="110" x2="60" y2="20" stroke="#223128" strokeWidth="3" />
                      <line x1="60" y1="20" x2="140" y2="20" stroke="#223128" strokeWidth="2.5" />
                      <polygon points="135,20 155,20 160,35 130,35" fill="#19221D" stroke="#F0B65A" strokeWidth="1.5" />
                      <path d="M 145 35 L 142 55 L 148 65 L 140 75" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="2,2" />
                      <text x="170" y="35" fill="#F87171" fontSize="10" fontFamily="monospace" fontWeight="bold">EXPOSED FEEDER</text>
                      <text x="170" y="55" fill="#9AA69C" fontSize="9" fontFamily="monospace">0 LUX ILLUMINANCE</text>
                      <text x="170" y="75" fill="#F0B65A" fontSize="9" fontFamily="monospace">HAZARD: ELECTROCUTION</text>
                    </svg>
                  )}

                  {currentCase.before.svgDiagram === 'drain' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <rect x="20" y="30" width="80" height="80" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      <rect x="220" y="30" width="80" height="80" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      <rect x="100" y="30" width="120" height="80" fill="#0A0706" stroke="#EF4444" strokeWidth="2" />
                      <line x1="100" y1="30" x2="220" y2="110" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="100" y1="110" x2="220" y2="30" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,4" />
                      <text x="125" y="75" fill="#F2F0E8" fontSize="10" fontFamily="monospace" fontWeight="bold">OPEN VOID</text>
                      <text x="125" y="90" fill="#F0B65A" fontSize="9" fontFamily="monospace">DEPTH: 2.1m</text>
                    </svg>
                  )}
                </div>

                <div className="absolute top-3 right-3 text-[10px] font-mono text-[#9AA69C] bg-[#121916]/90 border border-[#223128] px-2 py-0.5 rounded-xs">
                  GPS Proximity: Verified (0m)
                </div>
              </div>

              {/* Description & Inspection Metrics */}
              <div className="p-4 space-y-3 text-xs">
                <p className="text-[#9AA69C] leading-relaxed">
                  {currentCase.before.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#223128]">
                  {currentCase.before.inspectionMetrics.map((metric, i) => (
                    <div key={i} className="text-[11px] text-[#9AA69C] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0B65A]" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#121916] border-t border-[#223128] flex items-center justify-between text-[11px] text-[#9AA69C]">
                <span>Status at intake:</span>
                <span className="font-semibold text-[#F0B65A]">{currentCase.before.severity}</span>
              </div>
            </div>
          )}

          {/* Column B: Department After Resolution Proof */}
          {(viewMode === 'split' || viewMode === 'after') && (
            <div className="border border-[#224A30] rounded-xs overflow-hidden flex flex-col justify-between bg-[#0E1411] shadow-md">
              {/* Header */}
              <div className="p-4 bg-[#14271B] border-b border-[#224A30] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B8F36B] block">
                    Phase 2 · Municipal Resolution Proof
                  </span>
                  <span className="font-heading text-sm font-bold text-[#F2F0E8]">
                    {currentCase.after.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#121916] border border-[#224A30] text-[#B8F36B] rounded-xs font-semibold">
                  {currentCase.resolvedTime}
                </span>
              </div>

              {/* Technical Drawing Canvas (Vector Completion Diagram) */}
              <div className="p-6 bg-[#0B0F0D] border-b border-[#224A30] flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                <div className="w-full max-w-sm h-36 flex items-center justify-center">
                  {currentCase.after.svgDiagram === 'pothole_repaired' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <rect x="10" y="80" width="300" height="30" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      <rect x="60" y="78" width="200" height="32" fill="#131B16" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="50" y1="78" x2="270" y2="78" stroke="#B8F36B" strokeWidth="2" />
                      <text x="90" y="100" fill="#B8F36B" fontSize="10" fontFamily="monospace" fontWeight="bold">DENSE BITUMEN COMPACTED</text>
                      <text x="20" y="40" fill="#B8F36B" fontSize="10" fontFamily="monospace">PHOTO EVIDENCE #RES-402</text>
                      <circle cx="270" cy="78" r="8" fill="#B8F36B" />
                      <polyline points="266,78 269,81 275,75" fill="none" stroke="#0B0F0D" strokeWidth="2" />
                    </svg>
                  )}

                  {currentCase.after.svgDiagram === 'streetlight_repaired' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <line x1="60" y1="110" x2="60" y2="20" stroke="#223128" strokeWidth="3" />
                      <line x1="60" y1="20" x2="140" y2="20" stroke="#223128" strokeWidth="2.5" />
                      <polygon points="130,20 160,20 165,30 125,30" fill="#19221D" stroke="#B8F36B" strokeWidth="1.5" />
                      <polygon points="125,30 165,30 220,110 70,110" fill="#B8F36B" fillOpacity="0.15" stroke="#B8F36B" strokeWidth="0.8" strokeDasharray="3,3" />
                      <text x="180" y="45" fill="#B8F36B" fontSize="10" fontFamily="monospace" fontWeight="bold">90W LED OPERATIONAL</text>
                      <text x="180" y="65" fill="#9AA69C" fontSize="9" fontFamily="monospace">42 LUX CERTIFIED</text>
                      <text x="180" y="85" fill="#F2F0E8" fontSize="9" fontFamily="monospace">IP66 JUNCTION SEALED</text>
                    </svg>
                  )}

                  {currentCase.after.svgDiagram === 'drain_repaired' && (
                    <svg viewBox="0 0 320 120" className="w-full h-full text-[#F2F0E8]">
                      <rect x="20" y="30" width="80" height="80" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      <rect x="220" y="30" width="80" height="80" fill="#19221D" stroke="#223128" strokeWidth="1.5" />
                      <rect x="100" y="30" width="120" height="15" fill="#19221D" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="120" y1="30" x2="120" y2="45" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="140" y1="30" x2="140" y2="45" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="160" y1="30" x2="160" y2="45" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="180" y1="30" x2="180" y2="45" stroke="#B8F36B" strokeWidth="2" />
                      <line x1="200" y1="30" x2="200" y2="45" stroke="#B8F36B" strokeWidth="2" />
                      <text x="110" y="75" fill="#B8F36B" fontSize="10" fontFamily="monospace" fontWeight="bold">D400 DUCTILE GRATE</text>
                      <text x="110" y="90" fill="#9AA69C" fontSize="9" fontFamily="monospace">M30 CONCRETE BEDDING</text>
                    </svg>
                  )}
                </div>

                <div className="absolute top-3 right-3 text-[10px] font-mono text-[#B8F36B] bg-[#121916]/95 border border-[#224A30] px-2 py-0.5 rounded-xs font-semibold">
                  Field Signed: EE-402
                </div>
              </div>

              {/* Description & Completion Metrics */}
              <div className="p-4 space-y-3 text-xs">
                <p className="text-[#9AA69C] leading-relaxed">
                  {currentCase.after.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#224A30]">
                  {currentCase.after.completionMetrics.map((metric, i) => (
                    <div key={i} className="text-[11px] text-[#B8F36B] flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B8F36B] shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#14271B] border-t border-[#224A30] flex items-center justify-between text-[11px] text-[#B8F36B]">
                <span className="font-semibold">{currentCase.after.contractorUnit}</span>
                <span className="font-mono">Tamper Seal: Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Audit Certification Stamp */}
        <div className="p-4 bg-[#121916] border border-[#223128] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#B8F36B] shrink-0" />
            <div>
              <span className="font-semibold text-[#F2F0E8] block">
                Cryptographic Audit Log Certified
              </span>
              <p className="text-[11px] text-[#9AA69C]">
                Record permanently archived into PostGIS municipal ledger. Tamper-proof status history stored with actor user IDs.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-[#B8F36B] whitespace-nowrap bg-[#19221D] px-3 py-1.5 border border-[#223128] rounded-xs">
            SRID 4326 · SHA-256 Validated
          </div>
        </div>
      </div>
    </div>
  );
};
