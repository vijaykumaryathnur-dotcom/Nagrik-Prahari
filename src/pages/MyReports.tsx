import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Report, ReportStatus } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityGlyph } from '../components/ui/PriorityGlyph';
import { Select } from '../components/ui/Input';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { getOfflineDrafts, syncSingleDraft, OfflineDraft } from '../lib/offlineSync';
import { PlusCircle, Clock, RefreshCw, ChevronRight } from 'lucide-react';

export const MyReports: React.FC = () => {
  const { user, language, t } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setReports((data as Report[]) || []);
    } catch (err: any) {
      console.warn('Error fetching citizen reports:', err);
      setErrorMsg(err.message || 'Could not load your reports.');
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineDrafts = () => {
    const drafts = getOfflineDrafts();
    setOfflineDrafts(drafts);
  };

  useEffect(() => {
    fetchReports();
    loadOfflineDrafts();
  }, [user]);

  const handleManualSyncDraft = async (draft: OfflineDraft) => {
    if (!user) return;
    setSyncingId(draft.localId);
    await syncSingleDraft(draft, user.id);
    setSyncingId(null);
    loadOfflineDrafts();
    fetchReports();
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-[#F2F0E8]">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#223128]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#B8F36B] block mb-1">
            CITIZEN REGISTER // ACTIVITY LOG
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
            {t.myReports}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA69C] mt-1">
            Track status, municipal assignments, and photographic resolution proofs for your submitted issues.
          </p>
        </div>

        <Link to="/report">
          <Button variant="primary" size="md" className="gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span>{t.reportHazard}</span>
          </Button>
        </Link>
      </div>

      {/* Offline Drafts Section */}
      {offlineDrafts.length > 0 && (
        <div className="mb-6 p-4 bg-[#261E10] border border-[#4A3B18] rounded-xs shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F0B65A]">
              {t.waitingToSend} ({offlineDrafts.length})
            </span>
          </div>
          <div className="divide-y divide-[#4A3B18]/60">
            {offlineDrafts.map((draft) => (
              <div key={draft.localId} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-semibold text-[#F2F0E8]">{draft.title}</div>
                  <div className="text-[11px] text-[#9AA69C] flex items-center gap-2 mt-0.5">
                    <span>{CATEGORY_LABELS[draft.category][language]}</span>
                    <span>·</span>
                    <span>Saved locally: {new Date(draft.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualSyncDraft(draft)}
                  isLoading={syncingId === draft.localId}
                  className="!border-[#F0B65A] !text-[#F0B65A] text-xs hover:!bg-[#382B14]"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Sync now
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#9AA69C]">
          <span>Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[36px] px-2.5 py-1 text-xs bg-[#121916] border border-[#223128] rounded-xs text-[#F2F0E8] focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="duplicate">Duplicate</option>
          </select>
        </div>

        <span className="text-xs text-[#9AA69C] font-mono tabular-nums">
          Showing {filteredReports.length} report{filteredReports.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="mb-6">
          <ErrorState message={errorMsg} onRetry={fetchReports} />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-[#121916] border border-[#223128] rounded-xs space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? t.noReportsFound : 'No reports in this status'}
          description={
            statusFilter === 'all'
              ? 'You have not submitted any hazard reports yet. Any reports filed will appear here with live tracking.'
              : 'Try changing the status filter to see your other reports.'
          }
          actionText={statusFilter === 'all' ? t.fileFirstReport : 'Clear filter'}
          onAction={() => (statusFilter === 'all' ? null : setStatusFilter('all'))}
        />
      ) : (
        /* Ruled list of citizen's reports */
        <div className="divide-y divide-[#19251E] border border-[#223128] bg-[#121916] rounded-xs overflow-hidden shadow-lg">
          {filteredReports.map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#19221D] transition-colors block group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#B8F36B] tracking-wider">
                    {report.ref_code}
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                  <PriorityGlyph priority={report.effective_priority || report.severity} />
                </div>

                <h3 className="text-sm font-bold text-[#F2F0E8] group-hover:text-[#B8F36B] transition-colors truncate">
                  {report.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA69C]">
                  <span>{CATEGORY_LABELS[report.category]?.[language] || report.category}</span>
                  {report.address && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-xs">{report.address}</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="tabular-nums font-mono text-[11px]">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right sm:self-center flex items-center gap-1 text-xs font-semibold text-[#B8F36B] group-hover:text-[#C9F788]">
                <span>{t.trackReport}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
