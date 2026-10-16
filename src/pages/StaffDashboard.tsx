import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getSignedMediaUrl, parseLocationEWKT } from '../lib/supabase';
import {
  StaffReport,
  ReportMedia,
  StatusHistory,
  Department,
  SeverityLevel,
  ReportStatus,
  HazardCategory,
} from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { DEMO_PUBLIC_REPORTS } from '../lib/demoData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityGlyph } from '../components/ui/PriorityGlyph';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, FormField } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { ErrorState, Skeleton, EmptyState } from '../components/ui/Feedback';
import { StaffQueueMap } from '../components/StaffQueueMap';
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Wrench,
  XCircle,
  Copy,
  Radio,
  FileCheck,
  Upload,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user, role, profile, language, t } = useAuth();

  // Reports data
  const [reports, setReports] = useState<StaffReport[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoQueue, setIsDemoQueue] = useState(false);

  // Selected report state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ReportMedia[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<StatusHistory[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Dialogs State
  const [dialogAction, setDialogAction] = useState<
    'verify' | 'reject' | 'duplicate' | 'assign' | 'override' | 'start_work' | 'resolve' | 'reopen' | null
  >(null);
  const [actionNote, setActionNote] = useState('');
  const [actionDeptId, setActionDeptId] = useState('');
  const [actionAssignedTo, setActionAssignedTo] = useState('');
  const [actionDuplicateOf, setActionDuplicateOf] = useState('');
  const [actionOverridePriority, setActionOverridePriority] = useState<SeverityLevel>('high');
  const [actionPhotoFile, setActionPhotoFile] = useState<File | null>(null);
  const [actionPhotoPreview, setActionPhotoPreview] = useState<string | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Realtime notification ping
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<string | null>(null);

  // Fetch reports from view 'staff_reports' (or fallback to 'reports' or demo dataset)
  const fetchStaffReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let res = await supabase
        .from('staff_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (res.error) {
        res = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
      }

      if (res.data && res.data.length > 0) {
        const loaded = (res.data as any[]).map((r) => {
          const coords = parseLocationEWKT(r.location);
          return {
            ...r,
            lat: r.lat ?? coords?.[0] ?? null,
            lng: r.lng ?? coords?.[1] ?? null,
          } as StaffReport;
        });

        setReports(loaded);
        setIsDemoQueue(false);
        if (!selectedReportId && loaded.length > 0) {
          setSelectedReportId(loaded[0].id);
        }
      } else {
        // Fallback demo dataset for staff inspection
        const demoStaffReports: StaffReport[] = DEMO_PUBLIC_REPORTS.map((r, i) => ({
          id: r.id,
          ref_code: r.ref_code,
          reporter_id: 'demo-user',
          category: r.category,
          title: `Civic Hazard: ${r.ref_code}`,
          description: `Reported issue requiring municipal attention in Ward ${r.ward_id || '01'}. High pedestrian traffic area.`,
          location: `SRID=4326;POINT(${r.lng} ${r.lat})`,
          address: `Municipal Sector ${i + 1}, Hyderabad`,
          ward_id: r.ward_id,
          status: r.status,
          status_note: null,
          severity: r.effective_priority,
          priority_score: r.effective_priority === 'critical' ? 95 : r.effective_priority === 'high' ? 75 : 45,
          priority_level: r.effective_priority,
          priority_reasons: [
            { factor: 'Category Base Weight', points: 30, text: 'Base risk classification for hazard' },
            { factor: 'Citizen Severity Level', points: 35, text: 'High severity assessment on submission' },
            { factor: 'Community Confirmations', points: (r.upvote_count || 1) * 2, text: `${r.upvote_count || 1} citizens upvoted` },
          ],
          priority_override: null,
          override_reason: null,
          effective_priority: r.effective_priority,
          suggested_department_id: null,
          department_id: null,
          assigned_to: null,
          duplicate_of: null,
          upvote_count: r.upvote_count || 1,
          sla_due_at: r.sla_due_at,
          escalation_level: r.effective_priority === 'critical' ? 1 : 0,
          escalated_at: null,
          verified_at: null,
          assigned_at: null,
          resolved_at: r.resolved_at,
          created_at: r.created_at,
          lat: r.lat,
          lng: r.lng,
        }));

        setReports(demoStaffReports);
        setIsDemoQueue(true);
        if (!selectedReportId && demoStaffReports.length > 0) {
          setSelectedReportId(demoStaffReports[0].id);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching staff reports:', err);
      setErrorMsg(err.message || 'Could not load staff work queue.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  useEffect(() => {
    async function loadDepts() {
      try {
        const { data } = await supabase.from('departments').select('*');
        if (data && data.length > 0) {
          setDepartments(data as Department[]);
        } else {
          setDepartments([
            { id: 'dept-roads', name: 'Roads & Infrastructure', code: 'ROADS' },
            { id: 'dept-sanitation', name: 'Sanitation & Solid Waste', code: 'SWM' },
            { id: 'dept-electrical', name: 'Electrical & Street Lighting', code: 'ELEC' },
            { id: 'dept-drainage', name: 'Storm Water & Drainage', code: 'DRAIN' },
          ]);
        }
      } catch (err) {
        console.warn('Departments fetch err:', err);
      }
    }
    loadDepts();
    fetchStaffReports();

    // Supabase Realtime subscription
    const channel = supabase
      .channel('staff-reports-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        setLastRealtimeUpdate(new Date().toLocaleTimeString());
        fetchStaffReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch detail for selected report
  useEffect(() => {
    if (!selectedReportId) return;

    let isMounted = true;
    setLoadingDetail(true);

    async function loadDetail() {
      try {
        const [mediaRes, historyRes] = await Promise.all([
          supabase.from('report-media').select('*').eq('report_id', selectedReportId),
          supabase
            .from('status_history')
            .select('*')
            .eq('report_id', selectedReportId)
            .order('created_at', { ascending: true }),
        ]);

        if (!isMounted) return;

        if (mediaRes.data) {
          const withSigned = await Promise.all(
            (mediaRes.data as ReportMedia[]).map(async (m) => {
              const url = await getSignedMediaUrl(m.storage_path);
              return { ...m, signedUrl: url || undefined };
            })
          );
          if (isMounted) setSelectedMedia(withSigned);
        } else {
          if (isMounted) setSelectedMedia([]);
        }

        if (historyRes.data && isMounted) {
          setSelectedHistory(historyRes.data as StatusHistory[]);
        }
      } catch (err) {
        console.warn('Detail fetch error:', err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedReportId]);

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Compute 4 Real Counts
  const counts = useMemo(() => {
    const now = new Date();
    let awaitingVerification = 0;
    let awaitingAssignment = 0;
    let inProgress = 0;
    let overdue = 0;

    reports.forEach((r) => {
      if (r.status === 'submitted') awaitingVerification++;
      if (r.status === 'verified') awaitingAssignment++;
      if (r.status === 'in_progress') inProgress++;
      if (
        r.sla_due_at &&
        new Date(r.sla_due_at) < now &&
        r.status !== 'resolved' &&
        r.status !== 'rejected'
      ) {
        overdue++;
      }
    });

    return { awaitingVerification, awaitingAssignment, inProgress, overdue };
  }, [reports]);

  // Filtered & Sorted reports
  const filteredReports = useMemo(() => {
    const now = new Date();
    return reports
      .filter((r) => {
        if (activeQuickFilter === 'verification' && r.status !== 'submitted') return false;
        if (activeQuickFilter === 'assignment' && r.status !== 'verified') return false;
        if (activeQuickFilter === 'inprogress' && r.status !== 'in_progress') return false;
        if (activeQuickFilter === 'overdue') {
          if (!r.sla_due_at || new Date(r.sla_due_at) >= now || r.status === 'resolved' || r.status === 'rejected')
            return false;
        }

        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && (r.effective_priority || r.severity) !== priorityFilter) return false;
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        if (departmentFilter !== 'all' && r.department_id !== departmentFilter) return false;
        if (escalatedOnly && (r.escalation_level || 0) < 1) return false;
        if (overdueOnly) {
          if (!r.sla_due_at || new Date(r.sla_due_at) >= now || r.status === 'resolved' || r.status === 'rejected')
            return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchRef = r.ref_code.toLowerCase().includes(q);
          const matchTitle = r.title.toLowerCase().includes(q);
          if (!matchRef && !matchTitle) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pMap: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const pA = pMap[a.effective_priority || a.severity] || 1;
        const pB = pMap[b.effective_priority || b.severity] || 1;
        if (pB !== pA) return pB - pA;

        const slaA = a.sla_due_at ? new Date(a.sla_due_at).getTime() : Infinity;
        const slaB = b.sla_due_at ? new Date(b.sla_due_at).getTime() : Infinity;
        return slaA - slaB;
      });
  }, [
    reports,
    activeQuickFilter,
    statusFilter,
    priorityFilter,
    categoryFilter,
    departmentFilter,
    escalatedOnly,
    overdueOnly,
    searchQuery,
  ]);

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, page, pageSize]);

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;

  // Execute Action on Report
  const handleExecuteAction = async () => {
    if (!selectedReport || !dialogAction || !user) return;

    setIsPerformingAction(true);
    setActionError(null);

    try {
      if (dialogAction === 'verify') {
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'verified',
            verified_at: new Date().toISOString(),
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'reject') {
        if (!actionNote.trim()) {
          throw new Error('Rejection reason is mandatory.');
        }
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'rejected',
            status_note: actionNote.trim(),
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'duplicate') {
        if (!actionDuplicateOf.trim()) {
          throw new Error('Original report reference is required to mark duplicate.');
        }
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'duplicate',
            duplicate_of: actionDuplicateOf.trim(),
            status_note: actionNote.trim() || 'Marked duplicate by municipal reviewer',
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'assign') {
        if (!actionDeptId) {
          throw new Error('Department must be selected.');
        }
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'assigned',
            department_id: actionDeptId,
            assigned_to: actionAssignedTo.trim() || null,
            assigned_at: new Date().toISOString(),
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'override') {
        if (!actionNote.trim()) {
          throw new Error('Reason is required when overriding priority score.');
        }
        const { error } = await supabase
          .from('reports')
          .update({
            priority_override: actionOverridePriority,
            override_reason: actionNote.trim(),
            effective_priority: actionOverridePriority,
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'start_work') {
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'in_progress',
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      } else if (dialogAction === 'resolve') {
        if (!actionPhotoFile) {
          throw new Error('Resolution proof photograph (resolution_after) is mandatory to close report.');
        }

        const ext = actionPhotoFile.name.split('.').pop() || 'jpg';
        const filename = `resolution_after_${Date.now()}.${ext}`;
        const storagePath = `${user.id}/${selectedReport.id}/${filename}`;

        const uploadRes = await supabase.storage
          .from('report-media')
          .upload(storagePath, actionPhotoFile, { contentType: actionPhotoFile.type });

        if (uploadRes.error) throw uploadRes.error;

        await supabase.from('report-media').insert({
          report_id: selectedReport.id,
          storage_path: storagePath,
          kind: 'resolution_after',
          caption: actionNote.trim() || 'Work completion photographic proof',
          uploaded_by: user.id,
        });

        const { error } = await supabase
          .from('reports')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            status_note: actionNote.trim() || 'Work completed and resolved.',
          })
          .eq('id', selectedReport.id);

        if (error) throw error;
      } else if (dialogAction === 'reopen') {
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'in_progress',
            status_note: actionNote.trim() || 'Report reopened by reviewer for further inspection.',
          })
          .eq('id', selectedReport.id);
        if (error) throw error;
      }

      setDialogAction(null);
      setActionNote('');
      setActionPhotoFile(null);
      setActionPhotoPreview(null);
      await fetchStaffReports();
    } catch (err: any) {
      console.error('Action failed:', err);
      setActionError(err.message || 'Operation rejected by municipal ledger.');
    } finally {
      setIsPerformingAction(false);
    }
  };

  const isReviewerOrAdmin = role === 'reviewer' || role === 'admin';
  const isOfficer = role === 'officer';

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 text-[#F2F0E8]">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#223128] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#9AA69C] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
            <span>Authorized Municipal Command Workspace</span>
            <span>·</span>
            <span className="font-bold text-[#B8F36B] capitalize">{role} Access Level</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
            Municipal Resolution & Dispatch Console
          </h1>
        </div>

        {isDemoQueue && (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-3 py-1 bg-[#241E10] border border-[#423419] text-[#F0B65A] rounded-xs self-start sm:self-auto">
            Demonstration Queue Active
          </span>
        )}
      </div>

      {/* 4. Compact Header Strip Above Queue with 4 Real Counts Acting as Quick Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() =>
            setActiveQuickFilter(activeQuickFilter === 'verification' ? null : 'verification')
          }
          className={`p-3.5 border rounded-xs text-left transition-all cursor-pointer ${
            activeQuickFilter === 'verification'
              ? 'bg-[#14271B] border-[#234A31] ring-1 ring-[#B8F36B] shadow-lg'
              : 'bg-[#121916] border-[#223128] hover:bg-[#19221D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9AA69C]">
              Awaiting verification
            </span>
            <AlertCircle className="w-4 h-4 text-[#9AA69C]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F2F0E8] mt-1 tabular-nums">
            {counts.awaitingVerification}
          </div>
        </button>

        <button
          onClick={() =>
            setActiveQuickFilter(activeQuickFilter === 'assignment' ? null : 'assignment')
          }
          className={`p-3.5 border rounded-xs text-left transition-all cursor-pointer ${
            activeQuickFilter === 'assignment'
              ? 'bg-[#14271B] border-[#234A31] ring-1 ring-[#B8F36B] shadow-lg'
              : 'bg-[#121916] border-[#223128] hover:bg-[#19221D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9AA69C]">
              Awaiting assignment
            </span>
            <UserCheck className="w-4 h-4 text-[#70B8F5]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#70B8F5] mt-1 tabular-nums">
            {counts.awaitingAssignment}
          </div>
        </button>

        <button
          onClick={() =>
            setActiveQuickFilter(activeQuickFilter === 'inprogress' ? null : 'inprogress')
          }
          className={`p-3.5 border rounded-xs text-left transition-all cursor-pointer ${
            activeQuickFilter === 'inprogress'
              ? 'bg-[#14271B] border-[#234A31] ring-1 ring-[#B8F36B] shadow-lg'
              : 'bg-[#121916] border-[#223128] hover:bg-[#19221D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9AA69C]">
              In progress
            </span>
            <Wrench className="w-4 h-4 text-[#F0B65A]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F0B65A] mt-1 tabular-nums">
            {counts.inProgress}
          </div>
        </button>

        <button
          onClick={() =>
            setActiveQuickFilter(activeQuickFilter === 'overdue' ? null : 'overdue')
          }
          className={`p-3.5 border rounded-xs text-left transition-all cursor-pointer ${
            activeQuickFilter === 'overdue'
              ? 'bg-[#291414] border-[#521E1E] ring-1 ring-[#F87171] shadow-lg'
              : 'bg-[#121916] border-[#223128] hover:bg-[#19221D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#FCA5A5]">
              Overdue SLA
            </span>
            <Clock className="w-4 h-4 text-[#F87171]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F87171] mt-1 tabular-nums">
            {counts.overdue}
          </div>
        </button>
      </div>

      {/* Filter Toolbar & Realtime Indicator */}
      <div className="bg-[#121916] border border-[#223128] rounded-xs p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#9AA69C] absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="Search ref code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] placeholder:text-[#9AA69C]/50 focus:outline-none focus:border-[#B8F36B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer text-[#9AA69C] px-2 py-1 border border-[#223128] rounded-xs hover:bg-[#19221D]">
            <input
              type="checkbox"
              checked={escalatedOnly}
              onChange={(e) => setEscalatedOnly(e.target.checked)}
              className="accent-[#B8F36B]"
            />
            <span>Escalated only</span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#9AA69C] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
          <span>{t.liveUpdates}</span>
          {lastRealtimeUpdate && (
            <span className="text-[#9AA69C]/70">({lastRealtimeUpdate})</span>
          )}
        </div>
      </div>

      {errorMsg && <ErrorState message={errorMsg} onRetry={fetchStaffReports} />}

      {/* Main Split Layout: Table (Left) + Map (Centre) + Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: WORK QUEUE AS A DENSE TABLE (5 Cols on LG) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-6 bg-[#121916] border border-[#223128] rounded-xs space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : paginatedReports.length === 0 ? (
            <EmptyState
              title="No reports match criteria"
              description="Adjust the filters or search terms to inspect other ledger entries."
            />
          ) : (
            <div className="overflow-x-auto border border-[#223128] rounded-xs bg-[#121916] shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0E1512] border-b border-[#223128] font-mono font-semibold text-[#9AA69C] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Ref Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">SLA / Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#19251E]">
                  {paginatedReports.map((report) => {
                    const isSelected = report.id === selectedReportId;
                    const isOverdue =
                      report.sla_due_at &&
                      new Date(report.sla_due_at) < new Date() &&
                      report.status !== 'resolved' &&
                      report.status !== 'rejected';

                    return (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1C2B23] font-semibold text-[#F2F0E8]'
                            : 'hover:bg-[#18231D] text-[#F2F0E8]'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <PriorityGlyph
                            priority={report.effective_priority || report.severity}
                            showLabel={false}
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold tracking-wider text-[#B8F36B]">
                          {report.ref_code}
                        </td>
                        <td className="py-2.5 px-3 max-w-[110px] truncate text-[#9AA69C]" title={report.title}>
                          {CATEGORY_LABELS[report.category]?.[language] || report.category}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={report.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="text-[#F87171] font-bold flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Overdue</span>
                            </span>
                          ) : (
                            <span className="text-[#9AA69C] font-mono tabular-nums text-[11px]">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#9AA69C] px-1 font-mono">
              <span>
                Page {page} of {totalPages} ({filteredReports.length} total)
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CENTRE: MAP OF FILTERED REPORTS (3 Cols on LG) */}
        <div className="lg:col-span-3 h-[420px] lg:h-[650px]">
          <StaffQueueMap
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => setSelectedReportId(id)}
          />
        </div>

        {/* RIGHT: DETAIL PANEL FOR SELECTED REPORT (4 Cols on LG) */}
        <div className="lg:col-span-4">
          {selectedReport ? (
            <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 space-y-5 text-xs shadow-lg">
              {/* Header */}
              <div className="border-b border-[#223128] pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#B8F36B] tracking-wider">
                    {selectedReport.ref_code}
                  </span>
                  <StatusBadge status={selectedReport.status} size="sm" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#F2F0E8] pt-1 leading-snug">
                  {selectedReport.title}
                </h3>
                {selectedReport.address && (
                  <p className="text-[11px] text-[#9AA69C]">{selectedReport.address}</p>
                )}
              </div>

              {/* "Why this priority" - horizontal stacked bar built from priority_reasons points */}
              <div className="space-y-2 border-b border-[#223128] pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold uppercase tracking-wider text-[#9AA69C] text-[10px]">
                    Why this priority
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityGlyph
                      priority={selectedReport.effective_priority || selectedReport.severity}
                    />
                    <span className="text-[11px] font-bold text-[#B8F36B] font-mono tabular-nums">
                      (Score: {selectedReport.priority_score || 0})
                    </span>
                  </div>
                </div>

                {selectedReport.priority_reasons && selectedReport.priority_reasons.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-[#19221D] rounded-full flex overflow-hidden">
                      {selectedReport.priority_reasons.map((r, idx) => {
                        const total = selectedReport.priority_score || 100;
                        const pct = Math.min(100, Math.max(5, (r.points / total) * 100));
                        const colors = ['bg-[#B8F36B]', 'bg-[#70B8F5]', 'bg-[#F0B65A]', 'bg-[#9AA69C]'];
                        return (
                          <div
                            key={idx}
                            style={{ width: `${pct}%` }}
                            className={`${colors[idx % colors.length]}`}
                            title={`${r.factor}: +${r.points}`}
                          />
                        );
                      })}
                    </div>
                    <div className="space-y-1 pt-1 text-[11px]">
                      {selectedReport.priority_reasons.map((r, idx) => (
                        <div key={idx} className="flex justify-between text-[#9AA69C]">
                          <span>{r.text || r.factor}</span>
                          <span className="font-mono font-semibold text-[#F2F0E8]">+{r.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#9AA69C]">
                    Calculated from category base weight and initial citizen severity.
                  </div>
                )}

                {selectedReport.priority_override && (
                  <div className="p-2 bg-[#241E10] text-[#F0B65A] border border-[#423419] rounded-xs text-[11px] mt-2">
                    <span className="font-semibold font-mono">PRIORITY OVERRIDDEN: </span>
                    {selectedReport.override_reason || 'Manual override applied'}
                  </div>
                )}
              </div>

              {/* Photos Preview */}
              <div className="space-y-2 border-b border-[#223128] pb-4">
                <span className="font-mono font-semibold uppercase tracking-wider text-[#9AA69C] text-[10px] block">
                  Media Evidence ({selectedMedia.length})
                </span>
                {loadingDetail ? (
                  <Skeleton className="h-24 w-full" />
                ) : selectedMedia.length === 0 ? (
                  <div className="p-3 bg-[#19221D] border border-[#223128] text-center text-[#9AA69C] rounded-xs">
                    No media attached to this record.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMedia.map((m) => (
                      <div key={m.id} className="border border-[#223128] rounded-xs overflow-hidden bg-[#19221D]">
                        <img
                          src={m.signedUrl || ''}
                          alt={m.caption || 'Evidence'}
                          className="h-24 w-full object-cover"
                        />
                        <div className="p-1 text-[10px] text-[#9AA69C] capitalize truncate font-mono">
                          {m.kind.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Shown ONLY for What Role May Do with Confirmation Dialogs */}
              <div className="space-y-2 pt-1">
                <span className="font-mono font-semibold uppercase tracking-wider text-[#9AA69C] text-[10px] block">
                  Available Actions
                </span>

                {isReviewerOrAdmin && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.status === 'submitted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setDialogAction('verify');
                          setActionError(null);
                        }}
                      >
                        Verify
                      </Button>
                    )}

                    {(selectedReport.status === 'submitted' || selectedReport.status === 'verified') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setDialogAction('reject');
                          setActionNote('');
                          setActionError(null);
                        }}
                      >
                        Reject...
                      </Button>
                    )}

                    {(selectedReport.status === 'submitted' || selectedReport.status === 'verified') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setDialogAction('duplicate');
                          setActionDuplicateOf('');
                          setActionError(null);
                        }}
                      >
                        Mark duplicate...
                      </Button>
                    )}

                    {selectedReport.status === 'verified' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setDialogAction('assign');
                          setActionDeptId(
                            selectedReport.suggested_department_id || departments[0]?.id || ''
                          );
                          setActionError(null);
                        }}
                      >
                        Assign...
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDialogAction('override');
                        setActionOverridePriority(selectedReport.effective_priority || 'high');
                        setActionNote('');
                        setActionError(null);
                      }}
                    >
                      Override priority
                    </Button>

                    {selectedReport.status === 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDialogAction('reopen');
                          setActionNote('');
                          setActionError(null);
                        }}
                      >
                        Reopen report
                      </Button>
                    )}
                  </div>
                )}

                {isOfficer && (
                  <div className="space-y-2">
                    {selectedReport.status === 'assigned' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDialogAction('start_work');
                          setActionError(null);
                        }}
                      >
                        Start work (In progress)
                      </Button>
                    )}

                    {selectedReport.status === 'in_progress' && (
                      <Button
                        variant="forest"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDialogAction('resolve');
                          setActionPhotoFile(null);
                          setActionPhotoPreview(null);
                          setActionNote('');
                          setActionError(null);
                        }}
                      >
                        Resolve with evidence photo...
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline Snapshot from status_history */}
              <div className="pt-2 border-t border-[#223128] space-y-2">
                <span className="font-mono font-semibold uppercase tracking-wider text-[#9AA69C] text-[10px] block">
                  Audit History
                </span>
                <div className="max-h-36 overflow-y-auto space-y-2 text-[11px] pr-1">
                  {selectedHistory.map((h) => (
                    <div key={h.id} className="pb-1 border-b border-[#223128]/50">
                      <div className="flex justify-between font-semibold text-[#F2F0E8]">
                        <span>{h.event}</span>
                        <span className="text-[10px] text-[#9AA69C] font-mono">
                          {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.note && <div className="text-[#9AA69C] mt-0.5">{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#121916] border border-[#223128] rounded-xs text-center text-xs text-[#9AA69C]">
              Select a report from the table or map to inspect details and take action.
            </div>
          )}
        </div>
      </div>

      {/* ACTION CONFIRMATION DIALOGS */}
      <Dialog
        isOpen={dialogAction !== null}
        onClose={() => setDialogAction(null)}
        title={
          dialogAction === 'verify'
            ? 'Verify Report'
            : dialogAction === 'reject'
            ? 'Reject Report'
            : dialogAction === 'duplicate'
            ? 'Mark as Duplicate'
            : dialogAction === 'assign'
            ? 'Assign to Department'
            : dialogAction === 'override'
            ? 'Override Priority Level'
            : dialogAction === 'start_work'
            ? 'Commence Field Work'
            : dialogAction === 'resolve'
            ? 'Record Resolution Proof'
            : dialogAction === 'reopen'
            ? 'Reopen Report'
            : ''
        }
      >
        <div className="space-y-4 text-xs text-[#F2F0E8]">
          {actionError && <ErrorState message={actionError} />}

          {dialogAction === 'verify' && (
            <p className="text-[#F2F0E8] leading-relaxed">
              Confirm that this report is genuine, location is valid, and should move to verified status
              for department assignment.
            </p>
          )}

          {dialogAction === 'reject' && (
            <div className="space-y-2">
              <p className="text-[#9AA69C]">
                Provide an audit note explaining why this report is rejected. Citizens can view this explanation.
              </p>
              <FormField label="Rejection Reason" required>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Private property not under municipal jurisdiction, or duplicate..."
                  rows={3}
                  required
                />
              </FormField>
            </div>
          )}

          {dialogAction === 'duplicate' && (
            <div className="space-y-2">
              <p className="text-[#9AA69C]">
                Link this submission to an existing report reference code.
              </p>
              <FormField label="Original Report Reference Code" required>
                <Input
                  value={actionDuplicateOf}
                  onChange={(e) => setActionDuplicateOf(e.target.value)}
                  placeholder="e.g. HYD-2026-0042"
                  required
                />
              </FormField>
              <FormField label="Audit Note">
                <Input
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Matches identical pothole filed 2 hours earlier"
                />
              </FormField>
            </div>
          )}

          {dialogAction === 'assign' && (
            <div className="space-y-3">
              <FormField label="Department" required>
                <Select
                  value={actionDeptId}
                  onChange={(e) => setActionDeptId(e.target.value)}
                  required
                >
                  <option value="">Select municipal department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Assign To Officer ID (Optional)">
                <Input
                  value={actionAssignedTo}
                  onChange={(e) => setActionAssignedTo(e.target.value)}
                  placeholder="UUID of officer (optional)"
                />
              </FormField>
            </div>
          )}

          {dialogAction === 'override' && (
            <div className="space-y-3">
              <FormField label="New Priority Level" required>
                <Select
                  value={actionOverridePriority}
                  onChange={(e) => setActionOverridePriority(e.target.value as SeverityLevel)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical (Highest priority)</option>
                </Select>
              </FormField>
              <FormField label="Justification for Override" required>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Near school entrance during peak morning rush..."
                  rows={2}
                  required
                />
              </FormField>
            </div>
          )}

          {dialogAction === 'start_work' && (
            <p className="text-[#F2F0E8]">
              Transition this report status from Assigned to In Progress to indicate active field repairs.
            </p>
          )}

          {dialogAction === 'resolve' && (
            <div className="space-y-3">
              <p className="text-[#F2F0E8]">
                Resolving an incident requires mandatory photographic proof taken on-site after repairs.
              </p>

              <FormField label="Resolution After Photo" required>
                <div className="border border-dashed border-[#223128] p-4 text-center rounded-xs bg-[#19221D]/50">
                  {actionPhotoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={actionPhotoPreview}
                        alt="Resolution preview"
                        className="h-32 object-cover rounded-xs border border-[#223128]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActionPhotoFile(null);
                          setActionPhotoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-[#9AA69C] mb-1 hover:text-[#B8F36B]" />
                      <span className="text-xs text-[#F2F0E8] font-semibold">Upload completion photo</span>
                      <span className="text-[10px] text-[#9AA69C] mt-0.5">JPEG, PNG, WebP up to 5 MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setActionPhotoFile(f);
                            setActionPhotoPreview(URL.createObjectURL(f));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </FormField>

              <FormField label="Resolution Notes / Completion Details">
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Pothole filled with cold mix asphalt and compacted..."
                  rows={2}
                />
              </FormField>
            </div>
          )}

          {dialogAction === 'reopen' && (
            <div className="space-y-2">
              <p className="text-[#F2F0E8]">
                Reopening a resolved report will transition it back to in_progress status for remedial action.
              </p>
              <FormField label="Reason for Reopening">
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Citizen reported secondary settlement..."
                  rows={2}
                />
              </FormField>
            </div>
          )}

          <div className="pt-3 border-t border-[#223128] flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDialogAction(null)}
              disabled={isPerformingAction}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteAction}
              isLoading={isPerformingAction}
            >
              Confirm action
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
