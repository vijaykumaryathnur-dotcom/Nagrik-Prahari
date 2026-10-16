import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  PublicReport,
  PublicCategoryStat,
  PublicWardStat,
  ReportStatus,
} from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { DEMO_PUBLIC_REPORTS, DEMO_CATEGORY_STATS, DEMO_WARD_STATS } from '../lib/demoData';
import { PublicTransparencyMap } from '../components/PublicTransparencyMap';
import { EmptyState, Skeleton, ErrorState } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Info, Map, Layers, RefreshCw, BarChart2, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const PublicTransparency: React.FC = () => {
  const { language, t } = useAuth();

  const [reports, setReports] = useState<PublicReport[]>([]);
  const [categoryStats, setCategoryStats] = useState<PublicCategoryStat[]>([]);
  const [wardStats, setWardStats] = useState<PublicWardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pins' | 'hotspots'>('pins');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [reportsRes, catRes, wardRes] = await Promise.all([
        supabase.from('public_reports').select('*').limit(300),
        supabase.from('public_category_stats').select('*'),
        supabase.from('public_ward_stats').select('*'),
      ]);

      if (reportsRes.data && reportsRes.data.length > 0) {
        setReports(reportsRes.data as PublicReport[]);
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

      setLastRefreshed(new Date());
    } catch (err: any) {
      console.warn('Fallback to demo data:', err);
      setReports(DEMO_PUBLIC_REPORTS);
      setCategoryStats(DEMO_CATEGORY_STATS);
      setWardStats(DEMO_WARD_STATS);
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // Calculate totals
  const totalIncidents = reports.length;
  const resolvedIncidents = reports.filter((r) => r.status === 'resolved').length;
  const inProgressIncidents = reports.filter((r) => r.status === 'in_progress').length;
  const verifiedIncidents = reports.filter((r) => r.status === 'verified' || r.status === 'assigned').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 text-[#F2F0E8]">
      {/* Editorial Header */}
      <div className="border-b border-[#223128] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#B8F36B] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8F36B] animate-pulse" />
            <span>OPEN CIVIC LEDGER // PUBLIC JURISDICTION</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F2F0E8]">
            Municipal Transparency Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA69C] mt-1.5 max-w-2xl leading-relaxed">
            Real-time public record of civic infrastructure complaints, resolution rates, and ward
            performance. Completely anonymised: no citizen identities are published.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDemoData && (
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 bg-[#261E10] border border-[#4A3B18] text-[#F0B65A] rounded-xs whitespace-nowrap">
              DEMONSTRATION RECORDS
            </span>
          )}
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9AA69C] border border-[#223128] bg-[#121916] rounded-xs hover:text-[#F2F0E8] hover:bg-[#19221D] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadData} />}

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121916] border border-[#223128] p-4 sm:p-5 rounded-xs">
          <span className="text-[11px] uppercase font-mono font-semibold text-[#9AA69C] block">
            Plotted Incidents
          </span>
          <span className="font-heading text-3xl sm:text-4xl font-bold text-[#F2F0E8] tabular-nums mt-1 block">
            {totalIncidents}
          </span>
          <span className="text-[11px] text-[#9AA69C] mt-0.5 block">Across city jurisdiction</span>
        </div>

        <div className="bg-[#121916] border border-[#223128] p-4 sm:p-5 rounded-xs">
          <span className="text-[11px] uppercase font-mono font-semibold text-[#F0B65A] block">
            Active Repairs
          </span>
          <span className="font-heading text-3xl sm:text-4xl font-bold text-[#F0B65A] tabular-nums mt-1 block">
            {inProgressIncidents}
          </span>
          <span className="text-[11px] text-[#9AA69C] mt-0.5 block">Field teams deployed</span>
        </div>

        <div className="bg-[#121916] border border-[#223128] p-4 sm:p-5 rounded-xs">
          <span className="text-[11px] uppercase font-mono font-semibold text-[#70B8F5] block">
            Verified Queue
          </span>
          <span className="font-heading text-3xl sm:text-4xl font-bold text-[#70B8F5] tabular-nums mt-1 block">
            {verifiedIncidents}
          </span>
          <span className="text-[11px] text-[#9AA69C] mt-0.5 block">SLA countdown active</span>
        </div>

        <div className="bg-[#14271B] border border-[#224A30] p-4 sm:p-5 rounded-xs">
          <span className="text-[11px] uppercase font-mono font-semibold text-[#B8F36B] block">
            Closed with Proof
          </span>
          <span className="font-heading text-3xl sm:text-4xl font-bold text-[#B8F36B] tabular-nums mt-1 block">
            {resolvedIncidents}
          </span>
          <span className="text-[11px] text-[#9AA69C] mt-0.5 block">Photographic verification</span>
        </div>
      </div>

      {/* 1. Map Section with Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B8F36B]">
              Geographic Incident Map
            </span>
            <span className="text-xs text-[#9AA69C] font-mono tabular-nums">
              ({filteredReports.length} incidents shown)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-[#223128] rounded-xs bg-[#121916] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Pins vs Hotspots View Toggle */}
            <div className="flex border border-[#223128] rounded-xs overflow-hidden bg-[#121916] text-xs font-medium">
              <button
                onClick={() => setViewMode('pins')}
                className={`px-3 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'pins'
                    ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                    : 'text-[#9AA69C] hover:bg-[#19221D]'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Markers</span>
              </button>
              <button
                onClick={() => setViewMode('hotspots')}
                className={`px-3 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'hotspots'
                    ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                    : 'text-[#9AA69C] hover:bg-[#19221D]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Hotspots</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[460px] w-full border border-[#223128] rounded-xs overflow-hidden">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <PublicTransparencyMap
              reports={filteredReports}
              viewMode={viewMode}
              language={language}
            />
          )}
        </div>
      </div>

      {/* 2. Resolution Performance by Category */}
      <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F2F0E8]">
            Resolution Performance by Hazard Category
          </h2>
          <p className="text-xs text-[#9AA69C] mt-0.5">
            Comparison of resolved incidents versus active open workload and average resolution turnaround.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : categoryStats.length === 0 ? (
          <EmptyState
            title="No category metrics available"
            description="Category statistics will populate once hazard reports are filed and processed on the ledger."
          />
        ) : (
          <div className="divide-y divide-[#19251E]">
            {categoryStats.map((stat) => {
              const total = (Number(stat.resolved_reports) || 0) + (Number(stat.open_reports) || 0);
              const resolvedPct = total > 0 ? ((Number(stat.resolved_reports) || 0) / total) * 100 : 0;
              const catLabel =
                CATEGORY_LABELS[stat.category]?.[language] || stat.label || stat.category;

              return (
                <div key={stat.category} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-[#F2F0E8] text-sm">{catLabel}</span>
                    <div className="flex items-center gap-3 text-[11px] text-[#9AA69C]">
                      <span>
                        <strong className="text-[#B8F36B] font-bold">
                          {stat.resolved_reports || 0}
                        </strong>{' '}
                        resolved
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-[#F0B65A] font-bold">
                          {stat.open_reports || 0}
                        </strong>{' '}
                        open
                      </span>
                      {stat.avg_resolution_hours && (
                        <>
                          <span>·</span>
                          <span className="text-[#F2F0E8] font-mono">
                            Avg {Math.round(stat.avg_resolution_hours)}h turnaround
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2 w-full bg-[#19221D] rounded-full overflow-hidden flex border border-[#223128]">
                    <div
                      style={{ width: `${resolvedPct}%` }}
                      className="bg-[#B8F36B] transition-all"
                      title={`${resolvedPct.toFixed(1)}% resolved`}
                    />
                    <div
                      style={{ width: `${100 - resolvedPct}%` }}
                      className="bg-[#F0B65A] transition-all"
                      title={`${(100 - resolvedPct).toFixed(1)}% pending`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Ward Resolution Table */}
      <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F2F0E8]">
            Ward Administration Performance
          </h2>
          <p className="text-xs text-[#9AA69C] mt-0.5">
            Municipal ward breakdown tracking total reports, resolved count, and overdue escalations.
          </p>
        </div>

        {wardStats.length === 0 ? (
          <EmptyState
            title="No municipal ward records found"
            description="Ward boundaries or assignments have not yet been linked to active reports in the municipal database."
          />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Ward Name</Th>
                <Th>Code</Th>
                <Th>Total</Th>
                <Th>Resolved</Th>
                <Th>Overdue SLA</Th>
                <Th>Avg Resolution Time</Th>
              </tr>
            </Thead>
            <Tbody>
              {wardStats.map((w) => (
                <Tr key={w.ward_id}>
                  <Td className="font-semibold">{w.ward_name}</Td>
                  <Td className="font-mono text-[#9AA69C]">{w.ward_code}</Td>
                  <Td className="tabular-nums font-medium">{w.total_reports}</Td>
                  <Td className="tabular-nums text-[#B8F36B] font-bold">{w.resolved_reports}</Td>
                  <Td className="tabular-nums text-[#F0B65A] font-semibold">{w.overdue_reports}</Td>
                  <Td className="tabular-nums text-[#9AA69C] font-mono">
                    {w.avg_resolution_hours ? `${Math.round(w.avg_resolution_hours)} hrs` : '—'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      {/* 4. Short, Honest Data Note */}
      <div className="p-4 bg-[#0E1512] border border-[#223128] rounded-xs flex items-start gap-3 text-xs text-[#9AA69C]">
        <Info className="w-4 h-4 text-[#B8F36B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#F2F0E8]">Ledger Disclosure Note</p>
          <p className="leading-relaxed">
            Data reflects reports submitted by citizens and verified by municipal review officers.
            Duplicate filings are merged into single reference threads to avoid skewing ward indicators.
            Last refreshed:{' '}
            <span className="font-mono text-[#B8F36B]">
              {lastRefreshed.toLocaleDateString()} {lastRefreshed.toLocaleTimeString()}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
