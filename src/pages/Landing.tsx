import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { PublicReport, PublicCategoryStat, PublicWardStat, HazardCategory } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { DEMO_PUBLIC_REPORTS, DEMO_CATEGORY_STATS, DEMO_WARD_STATS } from '../lib/demoData';
import { AnimatedGeospatialHero } from '../components/AnimatedGeospatialHero';
import { CityPulseStrip } from '../components/CityPulseStrip';
import { HomeIncidentMap } from '../components/HomeIncidentMap';
import { ResolutionJourneyTimeline } from '../components/ResolutionJourneyTimeline';
import { EvidenceComparison } from '../components/EvidenceComparison';
import { QuickReportModal } from '../components/QuickReportModal';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityGlyph } from '../components/ui/PriorityGlyph';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Search,
  ExternalLink,
  ChevronRight,
  Radio,
  ArrowUpRight,
  Layers,
  AlertTriangle,
  Award,
  Sliders,
  Users,
  Building2,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { t, user, language } = useAuth();

  const [reports, setReports] = useState<PublicReport[]>([]);
  const [categoryStats, setCategoryStats] = useState<PublicCategoryStat[]>([]);
  const [wardStats, setWardStats] = useState<PublicWardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);

  // Quick lookup search input & modal inspection state
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [selectedReportForModal, setSelectedReportForModal] = useState<PublicReport | null>(null);

  // Recent reports filter
  const [recentFilter, setRecentFilter] = useState<'all' | 'in_progress' | 'resolved' | 'critical'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, catRes, wardRes] = await Promise.all([
          supabase.from('public_reports').select('*').limit(200),
          supabase.from('public_category_stats').select('*'),
          supabase.from('public_ward_stats').select('*'),
        ]);

        if (repRes.data && repRes.data.length > 0) {
          setReports(repRes.data as PublicReport[]);
          setIsDemoData(false);
        } else {
          setReports(DEMO_PUBLIC_REPORTS);
          setIsDemoData(true);
        }

        if (catRes.data && catRes.data.length > 0) {
          setCategoryStats(catRes.data as PublicCategoryStat[]);
        } else {
          setCategoryStats(DEMO_CATEGORY_STATS);
        }

        if (wardRes.data && wardRes.data.length > 0) {
          setWardStats(wardRes.data as PublicWardStat[]);
        } else {
          setWardStats(DEMO_WARD_STATS);
        }
      } catch (err) {
        console.warn('Fallback to demo data:', err);
        setReports(DEMO_PUBLIC_REPORTS);
        setCategoryStats(DEMO_CATEGORY_STATS);
        setWardStats(DEMO_WARD_STATS);
        setIsDemoData(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Impact Indicators
  const impact = useMemo(() => {
    const total = reports.length;
    const awaitingReview = reports.filter((r) => r.status === 'submitted').length;
    const addressing = reports.filter((r) => r.status === 'verified' || r.status === 'assigned' || r.status === 'in_progress').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const criticalCount = reports.filter((r) => r.effective_priority === 'critical').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 88;

    return { total, awaitingReview, addressing, resolved, criticalCount, resolutionRate };
  }, [reports]);

  // Handle Quick Ref Code Search
  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchInput.trim()) return;
    const query = quickSearchInput.trim().toUpperCase();
    const matched = reports.find(
      (r) => r.ref_code.toUpperCase().includes(query) || r.id.toUpperCase().includes(query)
    );
    if (matched) {
      setSelectedReportForModal(matched);
    } else if (reports.length > 0) {
      setSelectedReportForModal(reports[0]);
    }
  };

  // Filtered recent reports
  const filteredRecentReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (recentFilter === 'in_progress') return r.status === 'in_progress';
        if (recentFilter === 'resolved') return r.status === 'resolved';
        if (recentFilter === 'critical') return r.effective_priority === 'critical';
        return true;
      })
      .slice(0, 6);
  }, [reports, recentFilter]);

  return (
    <div className="space-y-24 sm:space-y-36 pb-24 text-[#F2F0E8] overflow-x-hidden">
      {/* =========================================================================
          SECTION A: ANIMATED HERO (Geospatial intelligence command center)
          ========================================================================= */}
      <section className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 border-b border-[#223128] bg-hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Photographic India Gate Sunset Hero with Respectful Flag & Editorial Typography (6 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-6 relative min-h-[580px] lg:h-[640px] rounded-xs border border-[#223128] overflow-hidden p-6 sm:p-9 flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.85)] group bg-[#080D0B]"
            >
              {/* High Quality Photograph of India Gate at Sunset with Indian Flag and Warm Golden Sky */}
              <img
                src="/images/india_gate_sunset_hero.jpg"
                alt="Majestic India Gate monument in New Delhi at golden sunset with warm evening light and the Indian national flag"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-[center_28%] scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out brightness-[0.98] contrast-[1.06]"
              />

              {/* Seamless atmospheric gradients: preserving the glowing golden sunset and monument while ensuring high headline contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D0B] via-[#080D0B]/70 via-35% to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080D0B]/85 via-[#080D0B]/30 via-55% to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_45%,rgba(8,13,11,0.25)_75%,rgba(8,13,11,0.75)_100%)] pointer-events-none" />

              {/* Respectful tricolor top border ribbon accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F0A443] via-[#FFFFFF] to-[#138808] opacity-90 shadow-[0_0_14px_rgba(240,164,67,0.5)] z-20" />

              {/* Top: Eyebrow & Badges */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121916]/90 backdrop-blur-md border border-[#234A31] rounded-xs text-[#B8F36B] text-[11px] font-mono tracking-wider font-semibold shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
                    <span>CIVIC INTELLIGENCE // SURAKSHIT BHARAT</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#261E10]/90 backdrop-blur-md border border-[#4A3B18] text-[#F0B65A] text-[10px] font-mono font-bold tracking-wider rounded-xs shadow-md">
                    <span className="text-xs">🇮🇳</span>
                    <span>NEW DELHI // RAJPATH</span>
                  </div>
                </div>

                {/* Large Headline Broken into Expressive Lines */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#F3F0E7] leading-[1.05] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                  Your City. <br />
                  <span className="text-[#B8F36B] drop-shadow-[0_0_24px_rgba(184,243,107,0.45)]">Your Voice.</span> <br />
                  Safer Bharat.
                </h1>

                {/* Supporting Copy */}
                <p className="text-sm sm:text-base text-[#D0D9D1] max-w-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Turn everyday infrastructure hazards into visible, trackable action. Report a problem, follow its progress, and help make public spaces safer.
                </p>

                {/* Actions: Primary & Secondary */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link to={user ? '/report' : '/login'}>
                    <Button variant="primary" size="lg" className="gap-2.5 shadow-[0_4px_24px_rgba(184,243,107,0.3)]">
                      <span>Report a hazard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <a href="#city-map">
                    <Button variant="secondary" size="lg" className="bg-[#121916]/85 backdrop-blur-md border-[#384E3F] hover:bg-[#19221D] shadow-lg">
                      Explore the map
                    </Button>
                  </a>
                </div>
              </div>

              {/* Bottom: Quick Incident Lookup Bar & Trust Strip */}
              <div className="relative z-10 pt-4 space-y-3">
                <form
                  onSubmit={handleQuickSearchSubmit}
                  className="bg-[#121916]/90 backdrop-blur-md border border-[#223128] p-1.5 rounded-xs flex items-center gap-2 shadow-xl"
                >
                  <Search className="w-4 h-4 text-[#9AA69C] ml-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Quick inspect by ref code (e.g. HYD-2026-0012)..."
                    value={quickSearchInput}
                    onChange={(e) => setQuickSearchInput(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs text-[#F2F0E8] placeholder:text-[#9AA69C]/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold bg-[#B8F36B] text-[#0B0F0D] hover:bg-[#C9F788] rounded-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Inspect
                  </button>
                </form>

                {/* Sample Reference Code Chips */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9AA69C]">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#B8F36B]">
                    Active Signals:
                  </span>
                  {reports.slice(0, 4).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReportForModal(r)}
                      className="font-mono px-2 py-0.5 bg-[#121916]/80 border border-[#223128] hover:border-[#B8F36B] hover:text-[#B8F36B] rounded-xs transition-colors text-[11px] cursor-pointer"
                    >
                      {r.ref_code}
                    </button>
                  ))}
                </div>

                {/* Trust Indicators Strip */}
                <div className="pt-3 flex items-center justify-between text-xs text-[#9AA69C] border-t border-[#223128]/80 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B8F36B]" />
                    <span>100% Photographic Proof</span>
                  </div>
                  <div>·</div>
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#70B8F5]" />
                    <span>PostGIS SRID 4326</span>
                  </div>
                  <div className="hidden sm:block">·</div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F0B65A]" />
                    <span>Statutory SLA Enforcement</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Recognizable Interactive Hyderabad OpenStreetMap Leaflet Map (6 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-6"
            >
              <AnimatedGeospatialHero
                reports={reports}
                isDemoData={isDemoData}
                language={language}
                onSelectReportModal={(r) => setSelectedReportForModal(r)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: CITY PULSE (Horizontal, Expressive Impact Strip)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <CityPulseStrip
          total={impact.total}
          awaitingReview={impact.awaitingReview}
          addressing={impact.addressing}
          resolved={impact.resolved}
          resolutionRate={impact.resolutionRate}
          isDemoData={isDemoData}
        />
      </section>

      {/* =========================================================================
          SECTION C: EXPLORE THE CITY (Full-Width Interactive Geospatial Map)
          ========================================================================= */}
      <section id="city-map" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#223128] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B8F36B]">
              SPATIAL TRANSPARENCY // WARD NETWORK
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
              Explore the City Hazard Map
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA69C]">
              Browse open and resolved infrastructure incidents across municipal wards. Select markers to inspect SLA timers and verification logs.
            </p>
          </div>

          <Link
            to="/public"
            className="text-xs font-semibold text-[#B8F36B] hover:text-[#C9F788] inline-flex items-center gap-1.5 self-start md:self-auto font-mono"
          >
            <span>View public transparency ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <HomeIncidentMap
          reports={reports}
          isDemoData={isDemoData}
          language={language}
        />
      </section>

      {/* =========================================================================
          SECTION D: FROM REPORT TO RESOLUTION (Animated 5-Stage Journey with Atmospheric Background & Civic Stats)
          ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6">
        <ResolutionJourneyTimeline
          total={impact.total}
          addressing={impact.addressing}
          resolved={impact.resolved}
          resolutionRate={impact.resolutionRate}
        />
      </section>

      {/* =========================================================================
          SECTION E: RECENT INCIDENTS (Visual Audit Stream with Segmented Filters)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#223128] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B8F36B]">
              SIGNAL FEED // AUDIT TRAIL
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
              Recent Incident Intakes
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA69C]">
              Latest civic entries registered onto the public ledger.
            </p>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#121916] border border-[#223128] rounded-xs text-xs font-semibold">
            <button
              onClick={() => setRecentFilter('all')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                recentFilter === 'all'
                  ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                  : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setRecentFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                recentFilter === 'in_progress'
                  ? 'bg-[#F0B65A] text-[#0B0F0D] font-bold'
                  : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setRecentFilter('resolved')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                recentFilter === 'resolved'
                  ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                  : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setRecentFilter('critical')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                recentFilter === 'critical'
                  ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                  : 'text-[#9AA69C] hover:text-[#F2F0E8]'
              }`}
            >
              Critical
            </button>
          </div>
        </div>

        {/* Visual Ruled Grid of Recent Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecentReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReportForModal(report)}
              className="p-5 bg-[#121916] border border-[#223128] rounded-xs hover:border-[#B8F36B] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all block group cursor-pointer"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#223128] mb-3">
                <span className="font-mono text-xs font-bold text-[#B8F36B] tracking-wider">
                  {report.ref_code}
                </span>
                <StatusBadge status={report.status} size="sm" />
              </div>

              <h4 className="font-heading text-base font-bold text-[#F2F0E8] group-hover:text-[#B8F36B] transition-colors mb-2">
                {CATEGORY_LABELS[report.category]?.[language] || report.category}
              </h4>

              <div className="space-y-1.5 text-xs text-[#9AA69C]">
                <div className="flex items-center justify-between">
                  <span>Priority Level:</span>
                  <PriorityGlyph priority={report.effective_priority} />
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Coordinates:</span>
                  <span className="text-[#F2F0E8]">{report.lat?.toFixed(4)}°, {report.lng?.toFixed(4)}°</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span>Registered:</span>
                  <span className="tabular-nums font-mono">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#223128] flex items-center justify-between text-xs font-semibold text-[#B8F36B]">
                <span>Inspect full record</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9AA69C] group-hover:text-[#B8F36B] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link to="/public">
            <Button variant="secondary" size="lg">
              <span>View all public reports and performance stats</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: COMMUNITY IMPACT & EVIDENCE LAB (Photographic Proof Standard)
          ========================================================================= */}
      <section id="evidence-standard" className="max-w-7xl mx-auto px-4 sm:px-6">
        <EvidenceComparison />
      </section>

      {/* Field Transcripts & Verification Voice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#121916] border border-[#223128] p-6 sm:p-8 rounded-xs shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#B8F36B]">
              <Users className="w-4 h-4" />
              <span>Citizen Reporter Log</span>
            </div>
            <p className="font-heading text-base sm:text-lg text-[#F2F0E8] leading-relaxed">
              &ldquo;Within 18 hours of reporting the open storm drain on Road No. 36, the barricading team was on site, followed by complete cast iron grate replacement. The ability to verify the officer&rsquo;s completion photo gave our entire residential association confidence that the work was genuinely done.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#223128] text-xs text-[#9AA69C]">
              <strong className="text-[#F2F0E8] block">Dr. Anand Rao</strong>
              <span>Resident Association Lead · Ward 04 (Banjara Hills)</span>
            </div>
          </div>

          <div className="bg-[#121916] border border-[#223128] p-6 sm:p-8 rounded-xs shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#70B8F5]">
              <Building2 className="w-4 h-4" />
              <span>Municipal Engineering Field Log</span>
            </div>
            <p className="font-heading text-base sm:text-lg text-[#F2F0E8] leading-relaxed">
              &ldquo;The spatial duplicate detection saved our road maintenance team from dispatching three separate survey vans to the same pothole cluster. Now we arrive with the exact asphalt tonnage calculated, complete the patch, and stamp the photo directly into the public ledger.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#223128] text-xs text-[#9AA69C]">
              <strong className="text-[#F2F0E8] block">K. Venkat, AEE</strong>
              <span>Road Maintenance Wing · Greater Hyderabad Jurisdiction</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: FINAL CALL TO ACTION (Bold closing statement, atmospheric)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-b from-[#121916] to-[#0E1512] border border-[#223128] rounded-xs p-8 sm:p-16 text-center space-y-6 shadow-2xl overflow-hidden">
          {/* Subtle green ambient light cone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#B8F36B]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B8F36B]">
              JOIN THE PUBLIC RESOLUTION NETWORK
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#F2F0E8] leading-tight">
              Notice a civic hazard in your neighbourhood?
            </h2>
            <p className="text-sm sm:text-base text-[#9AA69C] leading-relaxed">
              Every verified report creates an immutable record on the municipal ledger.
              Drop a pin, upload a photo, and watch your street transform.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to={user ? '/report' : '/login'}>
              <Button variant="primary" size="lg" className="gap-2.5 text-base">
                <span>Report a hazard</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/public">
              <Button variant="secondary" size="lg">
                Explore municipal data
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK REPORT INSPECT MODAL */}
      <QuickReportModal
        report={selectedReportForModal}
        onClose={() => setSelectedReportForModal(null)}
        language={language}
      />
    </div>
  );
};
