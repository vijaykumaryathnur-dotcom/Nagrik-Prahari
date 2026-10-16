import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, parseLocationEWKT, getSignedMediaUrl } from '../lib/supabase';
import {
  Report,
  ReportMedia,
  StatusHistory,
  ReportStatus,
} from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { DEMO_PUBLIC_REPORTS } from '../lib/demoData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityGlyph } from '../components/ui/PriorityGlyph';
import { StaticReportMap } from '../components/StaticReportMap';
import { ErrorState, Skeleton } from '../components/ui/Feedback';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [mediaList, setMediaList] = useState<ReportMedia[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFullReport = async () => {
    if (!id) return;
    try {
      // 1. Fetch report details
      const { data: reportData, error: reportErr } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (reportErr || !reportData) {
        throw new Error(reportErr?.message || 'Report not found on ledger.');
      }
      setReport(reportData as Report);

      // 2. Fetch media items & generate signed URLs
      const { data: mediaData } = await supabase
        .from('report-media')
        .select('*')
        .eq('report_id', id);

      if (mediaData && mediaData.length > 0) {
        const withUrls = await Promise.all(
          (mediaData as ReportMedia[]).map(async (m) => {
            const url = await getSignedMediaUrl(m.storage_path);
            return { ...m, signedUrl: url || undefined };
          })
        );
        setMediaList(withUrls);
      }

      // 3. Fetch status history
      const { data: historyData } = await supabase
        .from('status_history')
        .select('*')
        .eq('report_id', id)
        .order('created_at', { ascending: true });

      if (historyData) {
        setHistory(historyData as StatusHistory[]);
      }
    } catch (err: any) {
      console.warn('Error loading report detail from DB, checking demo reports:', err);
      // Fallback to demo report dataset
      const demoMatch = DEMO_PUBLIC_REPORTS.find((d) => d.id === id || d.ref_code === id);
      if (demoMatch) {
        setReport({
          id: demoMatch.id,
          ref_code: demoMatch.ref_code,
          category: demoMatch.category,
          status: demoMatch.status,
          severity: demoMatch.effective_priority,
          effective_priority: demoMatch.effective_priority,
          priority_level: demoMatch.effective_priority,
          priority_score: 80,
          priority_reasons: null,
          priority_override: null,
          override_reason: null,
          status_note: null,
          location: `SRID=4326;POINT(${demoMatch.lng} ${demoMatch.lat})`,
          address: 'Banjara Hills Rd 12, Hyderabad Municipal Jurisdiction',
          title: `${CATEGORY_LABELS[demoMatch.category]?.[language] || demoMatch.category} logged on ledger`,
          description: 'Hazard observed affecting public thoroughfare. Photographic evidence verified on municipal intake radar.',
          created_at: demoMatch.created_at,
          resolved_at: demoMatch.resolved_at,
          sla_due_at: demoMatch.sla_due_at,
          reporter_id: 'sample-user-id',
          suggested_department_id: 'dept-roads',
          department_id: 'dept-roads',
          assigned_to: 'officer-402',
          ward_id: demoMatch.ward_id,
          duplicate_of: null,
          upvote_count: demoMatch.upvote_count,
          escalation_level: 0,
          escalated_at: null,
          verified_at: demoMatch.created_at,
          assigned_at: demoMatch.created_at,
        } as unknown as Report);

        setHistory([
          {
            id: 'h-1',
            report_id: demoMatch.id,
            event: 'submitted',
            from_status: null,
            to_status: 'submitted',
            changed_by: 'citizen',
            note: 'Complaint registered by citizen with geolocation and initial evidence photo.',
            created_at: demoMatch.created_at,
          },
          {
            id: 'h-2',
            report_id: demoMatch.id,
            event: 'verified',
            from_status: 'submitted',
            to_status: 'verified',
            changed_by: 'reviewer-1',
            note: 'Verified by Ward Review Officer. PostGIS spatial duplicate check passed. Assigned priority level.',
            created_at: new Date(new Date(demoMatch.created_at).getTime() + 2 * 3600 * 1000).toISOString(),
          },
          ...(demoMatch.status === 'assigned' || demoMatch.status === 'in_progress' || demoMatch.status === 'resolved' ? [
            {
              id: 'h-3',
              report_id: demoMatch.id,
              event: 'assigned',
              from_status: 'verified' as ReportStatus,
              to_status: 'assigned' as ReportStatus,
              changed_by: 'reviewer-1',
              note: 'Assigned to Ward Rapid Response Squad with statutory SLA timeline.',
              created_at: new Date(new Date(demoMatch.created_at).getTime() + 4 * 3600 * 1000).toISOString(),
            }
          ] : []),
          ...(demoMatch.status === 'in_progress' || demoMatch.status === 'resolved' ? [
            {
              id: 'h-4',
              report_id: demoMatch.id,
              event: 'in_progress',
              from_status: 'assigned' as ReportStatus,
              to_status: 'in_progress' as ReportStatus,
              changed_by: 'officer-402',
              note: 'Field crew arrived on site with required equipment and material.',
              created_at: new Date(new Date(demoMatch.created_at).getTime() + 10 * 3600 * 1000).toISOString(),
            }
          ] : []),
          ...(demoMatch.status === 'resolved' ? [
            {
              id: 'h-5',
              report_id: demoMatch.id,
              event: 'resolved',
              from_status: 'in_progress' as ReportStatus,
              to_status: 'resolved' as ReportStatus,
              changed_by: 'officer-402',
              note: 'Field repair completed. Mandatory on-site resolution photograph uploaded and verified by Assistant Engineer.',
              created_at: demoMatch.resolved_at || new Date().toISOString(),
            }
          ] : []),
        ]);
        setErrorMsg(null);
      } else {
        setErrorMsg(err.message || 'Could not load report details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullReport();

    // Supabase Realtime subscription for live updates on this report
    const channel = supabase
      .channel(`report-live-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.new) {
            setReport(payload.new as Report);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'status_history',
          filter: `report_id=eq.${id}`,
        },
        (payload) => {
          setHistory((prev) => [...prev, payload.new as StatusHistory]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ErrorState
          title="Report inaccessible"
          message={errorMsg || 'The requested report could not be found.'}
        />
        <div className="mt-4">
          <Link to="/my-reports" className="text-xs text-[#102A43] font-semibold hover:underline">
            &larr; Back to my reports
          </Link>
        </div>
      </div>
    );
  }

  // Parse location
  const coords = parseLocationEWKT(report.location);

  // Status Stepper Steps
  const normalSteps: { key: ReportStatus; label: string }[] = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'verified', label: 'Verified' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const currentStatusIndex = normalSteps.findIndex((s) => s.key === report.status);
  const isTerminalSpecial = report.status === 'rejected' || report.status === 'duplicate';

  // Format SLA Target as plain sentence
  const formatSlaSentence = () => {
    if (!report.sla_due_at) return null;
    const due = new Date(report.sla_due_at);
    const now = new Date();
    const diffHours = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60));

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const formattedDate = due.toLocaleDateString(undefined, options);

    if (report.status === 'resolved') {
      return `Target SLA was met and closed on ${report.resolved_at ? new Date(report.resolved_at).toLocaleDateString() : 'schedule'}.`;
    }

    if (diffHours < 0) {
      return `SLA target was ${Math.abs(diffHours)} hours ago (${formattedDate}). This report is overdue and escalated.`;
    }

    return `Target resolution deadline is ${formattedDate} (approx. ${diffHours} hour${diffHours === 1 ? '' : 's'} remaining).`;
  };

  // Group media by evidence vs resolution proof
  const evidenceMedia = mediaList.filter((m) => m.kind === 'evidence');
  const resolutionBeforeMedia = mediaList.filter((m) => m.kind === 'resolution_before');
  const resolutionAfterMedia = mediaList.filter((m) => m.kind === 'resolution_after');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-[#F2F0E8]">
      {/* Back link */}
      <div className="mb-4">
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA69C] hover:text-[#B8F36B] font-semibold transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; BACK TO CITIZEN REGISTER</span>
        </Link>
      </div>

      {/* Header with Title and Ref Code */}
      <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-7 mb-6 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#223128]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#B8F36B] tracking-wider bg-[#19221D] px-2.5 py-0.5 border border-[#223128] rounded-xs">
                {report.ref_code}
              </span>
              <StatusBadge status={report.status} />
              <PriorityGlyph priority={report.effective_priority || report.severity} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
              {report.title}
            </h1>
          </div>

          <div className="text-xs text-[#9AA69C] sm:text-right shrink-0 font-mono">
            <div>Filed on {new Date(report.created_at).toLocaleDateString()}</div>
            <div className="text-[11px] text-[#9AA69C]/80">
              {new Date(report.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* SLA Plain Sentence Notice */}
        {report.sla_due_at && (
          <div className="mt-4 p-3.5 bg-[#241E10] border border-[#423419] rounded-xs flex items-start gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-[#F0B65A] shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[#F0B65A]">
              <span className="font-semibold">{t.slaDue}: </span>
              {formatSlaSentence()}
            </div>
          </div>
        )}

        {/* Special Status banner for Rejected or Duplicate */}
        {isTerminalSpecial && (
          <div
            className={`mt-4 p-4 rounded-xs border text-xs ${
              report.status === 'rejected'
                ? 'bg-[#291414] border-[#521E1E] text-[#FCA5A5]'
                : 'bg-[#19221D] border-[#223128] text-[#F2F0E8]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {report.status === 'rejected' ? (
                <XCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
              ) : (
                <Copy className="w-4 h-4 text-[#9AA69C] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-semibold uppercase tracking-wider font-mono">
                  {report.status === 'rejected' ? 'Report rejected' : 'Marked as duplicate'}
                </span>
                {report.status_note && (
                  <p className="leading-relaxed">{report.status_note}</p>
                )}
                {report.duplicate_of && (
                  <p className="text-[11px] text-[#9AA69C]">
                    Combined into primary report reference: <span className="font-mono font-semibold text-[#B8F36B]">{report.duplicate_of}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Stepper */}
        {!isTerminalSpecial && (
          <div className="mt-6 pt-4 border-t border-[#223128]">
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {normalSteps.map((step, idx) => {
                const isCompleted = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 transition-colors ${
                        isCurrent
                          ? 'bg-[#14271B] text-[#B8F36B] border border-[#234A31] ring-2 ring-[#B8F36B] ring-offset-2 ring-offset-[#121916]'
                          : isCompleted
                          ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                          : 'bg-[#19221D] text-[#9AA69C] border border-[#223128]'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs leading-tight font-mono ${
                        isCurrent
                          ? 'font-bold text-[#B8F36B]'
                          : isCompleted
                          ? 'font-medium text-[#F2F0E8]'
                          : 'text-[#9AA69C]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details & Photos */}
        <div className="md:col-span-2 space-y-6">
          {/* Details & Location */}
          <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9AA69C] border-b border-[#223128] pb-2">
              Hazard specifications
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#9AA69C] block text-[11px] font-mono">Category</span>
                <span className="font-bold text-[#F2F0E8] text-sm">
                  {CATEGORY_LABELS[report.category]?.[language] || report.category}
                </span>
              </div>
              <div>
                <span className="text-[#9AA69C] block text-[11px] font-mono">Observed severity</span>
                <span className="font-bold text-[#F0B65A] capitalize text-sm">
                  {report.severity}
                </span>
              </div>
            </div>

            {report.description && (
              <div className="pt-2 text-xs">
                <span className="text-[#9AA69C] block mb-1 text-[11px] font-mono font-medium">Description</span>
                <p className="text-[#F2F0E8] leading-relaxed whitespace-pre-line bg-[#19221D] p-3 rounded-xs border border-[#223128]">
                  {report.description}
                </p>
              </div>
            )}

            {/* Address & Small Map */}
            <div className="pt-2 text-xs space-y-2">
              <span className="text-[#9AA69C] block text-[11px] font-mono font-medium">Location on City Grid</span>
              {report.address && (
                <div className="flex items-start gap-1.5 font-semibold text-[#F2F0E8]">
                  <MapPin className="w-3.5 h-3.5 text-[#B8F36B] shrink-0 mt-0.5" />
                  <span>{report.address}</span>
                </div>
              )}
              {coords && (
                <StaticReportMap
                  lat={coords[0]}
                  lng={coords[1]}
                  label={`${report.ref_code}: ${report.title}`}
                />
              )}
            </div>
          </div>

          {/* Photographic Evidence & Resolution Proof */}
          <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9AA69C] border-b border-[#223128] pb-2">
              Photographic records
            </h2>

            {/* If resolution photos exist: show before/after side by side */}
            {resolutionAfterMedia.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#9AA69C] block font-mono">
                      Evidence before repair:
                    </span>
                    {(evidenceMedia.length > 0 ? evidenceMedia : resolutionBeforeMedia).map((m) => (
                      <div key={m.id} className="border border-[#223128] rounded-xs overflow-hidden bg-[#19221D]">
                        <img
                          src={m.signedUrl || ''}
                          alt="Before resolution"
                          className="w-full h-48 object-cover"
                        />
                        {m.caption && <div className="p-2 text-[11px] text-[#9AA69C]">{m.caption}</div>}
                      </div>
                    ))}
                  </div>

                  {/* After */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#B8F36B] block font-mono">
                      Resolution proof (after repair):
                    </span>
                    {resolutionAfterMedia.map((m) => (
                      <div key={m.id} className="border border-[#234A31] rounded-xs overflow-hidden bg-[#14271B]">
                        <img
                          src={m.signedUrl || ''}
                          alt="After repair"
                          className="w-full h-48 object-cover"
                        />
                        {m.caption && (
                          <div className="p-2 text-[11px] text-[#B8F36B] bg-[#121916]">{m.caption}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : evidenceMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidenceMedia.map((m) => (
                  <div key={m.id} className="border border-[#223128] rounded-xs overflow-hidden bg-[#19221D]">
                    <img
                      src={m.signedUrl || ''}
                      alt="Citizen evidence photo"
                      className="w-full h-32 object-cover"
                    />
                    {m.caption && <div className="p-1.5 text-[10px] text-[#9AA69C] truncate">{m.caption}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#9AA69C] bg-[#19221D] border border-[#223128] rounded-xs">
                No photographs attached to this entry.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vertical Timeline from status_history */}
        <div className="space-y-6">
          <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9AA69C] border-b border-[#223128] pb-2">
              {t.timeline}
            </h2>

            {history.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#9AA69C]">
                Initial submission pending ledger audit record.
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#223128]">
                {history.map((h) => (
                  <div key={h.id} className="relative text-xs">
                    {/* Bullet marker */}
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#B8F36B] ring-2 ring-[#0B0F0D]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#F2F0E8] capitalize">
                        {h.event.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#9AA69C] font-mono tabular-nums">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#9AA69C] mt-0.5 font-mono">
                      {h.from_status && <span>{h.from_status} &rarr; </span>}
                      <span className="font-semibold text-[#B8F36B]">{h.to_status}</span>
                    </div>

                    {h.note && (
                      <p className="mt-1.5 text-[11px] text-[#9AA69C] bg-[#19221D] p-2.5 rounded-xs border border-[#223128] leading-relaxed">
                        {h.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
