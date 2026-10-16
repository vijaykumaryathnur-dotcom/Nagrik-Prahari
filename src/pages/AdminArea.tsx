import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Profile,
  Department,
  CategoryConfig,
  StatusHistory,
  Report,
  UserRole,
  HazardCategory,
} from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input, Select, FormField } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { ErrorState, Skeleton, EmptyState } from '../components/ui/Feedback';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityGlyph } from '../components/ui/PriorityGlyph';
import {
  Users,
  Building,
  Settings,
  BarChart3,
  ScrollText,
  Download,
  AlertTriangle,
  Plus,
  Edit2,
  Check,
} from 'lucide-react';

export const AdminArea: React.FC = () => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'users' | 'departments' | 'categories' | 'analytics' | 'audit'
  >('users');

  // Data states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<StatusHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // Edit User Dialog
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Category Edit Modal
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [catLabel, setCatLabel] = useState('');
  const [catDeptId, setCatDeptId] = useState('');
  const [catSlaHours, setCatSlaHours] = useState(48);
  const [catBaseWeight, setCatBaseWeight] = useState(10);

  const loadAll = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [pRes, dRes, cRes, rRes, aRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('departments').select('*').order('name'),
        supabase.from('category_config').select('*'),
        supabase.from('reports').select('*').limit(200),
        supabase.from('status_history').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (pRes.data) setProfiles(pRes.data as Profile[]);
      if (dRes.data) setDepartments(dRes.data as Department[]);
      if (cRes.data) setCategories(cRes.data as CategoryConfig[]);
      if (rRes.data) setReports(rRes.data as Report[]);
      if (aRes.data) setAuditLogs(aRes.data as StatusHistory[]);
    } catch (err: any) {
      console.warn('Admin load err:', err);
      setActionError(err.message || 'Could not load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Save User Role / Dept
  const handleSaveUser = async () => {
    if (!editingProfile) return;
    setActionError(null);

    // Rule: Department required for officers
    if (selectedRole === 'officer' && !selectedDeptId) {
      setActionError('Officers must be assigned to a specific department.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          department_id: selectedRole === 'officer' ? selectedDeptId : selectedDeptId || null,
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      setEditingProfile(null);
      setSuccessNote('User profile updated successfully.');
      setTimeout(() => setSuccessNote(null), 3000);
      loadAll();
    } catch (err: any) {
      setActionError(err.message || 'Database rejected user update.');
    }
  };

  // Add / Edit Department
  const handleSaveDepartment = async () => {
    setActionError(null);
    if (!deptName.trim() || !deptCode.trim()) {
      setActionError('Department name and code are required.');
      return;
    }

    try {
      if (editingDept) {
        const { error } = await supabase
          .from('departments')
          .update({ name: deptName.trim(), code: deptCode.trim().toUpperCase() })
          .eq('id', editingDept.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('departments')
          .insert({ name: deptName.trim(), code: deptCode.trim().toUpperCase() });
        if (error) throw error;
      }
      setDeptModalOpen(false);
      setEditingDept(null);
      setDeptName('');
      setDeptCode('');
      loadAll();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save department.');
    }
  };

  // Save Category Config
  const handleSaveCategoryConfig = async () => {
    if (!editingCategory) return;
    setActionError(null);
    try {
      const { error } = await supabase
        .from('category_config')
        .update({
          label: catLabel.trim(),
          department_id: catDeptId || null,
          sla_hours: Number(catSlaHours) || 48,
          base_weight: Number(catBaseWeight) || 10,
        })
        .eq('category', editingCategory.category);

      if (error) throw error;

      setEditingCategory(null);
      setSuccessNote('Category configuration updated.');
      setTimeout(() => setSuccessNote(null), 3000);
      loadAll();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update category.');
    }
  };

  // Export CSV for Filtered Reports (Rule: ref code, category, status, priority, dates, department; NO reporter identity)
  const exportReportsCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Ref Code',
      'Category',
      'Status',
      'Effective Priority',
      'Created At',
      'SLA Due At',
      'Resolved At',
      'Department ID',
    ];

    const rows = reports.map((r) => [
      `"${r.ref_code}"`,
      `"${r.category}"`,
      `"${r.status}"`,
      `"${r.effective_priority || r.severity}"`,
      `"${r.created_at || ''}"`,
      `"${r.sla_due_at || ''}"`,
      `"${r.resolved_at || ''}"`,
      `"${r.department_id || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nagrik_prahari_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ageing Histogram Calculations for Open Reports
  const openReports = reports.filter((r) => r.status !== 'resolved' && r.status !== 'rejected');
  const nowTime = Date.now();
  const ageing = {
    less24h: 0,
    day1to3: 0,
    day3to7: 0,
    more7d: 0,
  };

  openReports.forEach((r) => {
    const ageHrs = (nowTime - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHrs < 24) ageing.less24h++;
    else if (ageHrs < 72) ageing.day1to3++;
    else if (ageHrs < 168) ageing.day3to7++;
    else ageing.more7d++;
  });

  const escalatedReports = reports.filter((r) => (r.escalation_level || 0) > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 text-[#F2F0E8]">
      {/* Page Title & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#223128]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#19221D] border border-[#223128] rounded-xs text-[11px] font-mono text-[#B8F36B] uppercase tracking-wider mb-2">
            <Settings className="w-3 h-3" />
            ADMINISTRATIVE COMMAND CONSOLE
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
            Municipal Administration
          </h1>
          <p className="text-xs text-[#9AA69C] mt-1 leading-relaxed">
            Configure system parameters, manage staff access roles, inspect audit trail, and export
            performance reports.
          </p>
        </div>

        {activeTab === 'analytics' && (
          <Button variant="secondary" size="sm" onClick={exportReportsCSV} className="gap-1.5 self-start sm:self-auto font-mono text-xs">
            <Download className="w-4 h-4 text-[#B8F36B]" />
            <span>EXPORT CSV</span>
          </Button>
        )}
      </div>

      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}
      {successNote && (
        <div className="p-3 bg-[#14271B] border border-[#234A31] rounded-xs text-xs text-[#B8F36B] font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-[#223128] gap-2 overflow-x-auto text-xs font-semibold uppercase tracking-wider font-mono">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#B8F36B] text-[#B8F36B]'
              : 'border-transparent text-[#9AA69C] hover:text-[#F2F0E8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'departments'
              ? 'border-[#B8F36B] text-[#B8F36B]'
              : 'border-transparent text-[#9AA69C] hover:text-[#F2F0E8]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departments</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'categories'
              ? 'border-[#B8F36B] text-[#B8F36B]'
              : 'border-transparent text-[#9AA69C] hover:text-[#F2F0E8]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Category Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#B8F36B] text-[#B8F36B]'
              : 'border-transparent text-[#9AA69C] hover:text-[#F2F0E8]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Export</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#B8F36B] text-[#B8F36B]'
              : 'border-transparent text-[#9AA69C] hover:text-[#F2F0E8]'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Audit Log</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-[#9AA69C] font-mono">
                <span>REGISTERED SYSTEM PROFILES ({profiles.length})</span>
              </div>

              <Table>
                <Thead>
                  <tr>
                    <Th>Full Name</Th>
                    <Th>User Role</Th>
                    <Th>Department</Th>
                    <Th>Language</Th>
                    <Th>Action</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {profiles.map((p) => {
                    const dept = departments.find((d) => d.id === p.department_id);
                    return (
                      <Tr key={p.id}>
                        <Td className="font-semibold text-[#F2F0E8]">{p.full_name || 'Anonymous User'}</Td>
                        <Td>
                          <span className="capitalize px-2 py-0.5 bg-[#19221D] border border-[#223128] rounded-xs text-xs font-mono text-[#B8F36B]">
                            {p.role}
                          </span>
                        </Td>
                        <Td className="text-xs text-[#9AA69C]">
                          {dept ? `${dept.name} (${dept.code})` : '—'}
                        </Td>
                        <Td className="uppercase text-xs font-mono text-[#9AA69C]">{p.language || 'en'}</Td>
                        <Td>
                          <button
                            onClick={() => {
                              setEditingProfile(p);
                              setSelectedRole(p.role);
                              setSelectedDeptId(p.department_id || '');
                              setActionError(null);
                            }}
                            className="text-xs text-[#B8F36B] hover:text-[#C9F788] hover:underline font-mono font-medium cursor-pointer"
                          >
                            Edit role
                          </button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#9AA69C] font-mono">
                  MUNICIPAL OPERATING DEPARTMENTS ({departments.length})
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingDept(null);
                    setDeptName('');
                    setDeptCode('');
                    setDeptModalOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </Button>
              </div>

              <Table>
                <Thead>
                  <tr>
                    <Th>Department Name</Th>
                    <Th>Code</Th>
                    <Th>Action</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {departments.map((d) => (
                    <Tr key={d.id}>
                      <Td className="font-semibold text-[#F2F0E8]">{d.name}</Td>
                      <Td className="font-mono font-bold text-[#B8F36B]">{d.code}</Td>
                      <Td>
                        <button
                          onClick={() => {
                            setEditingDept(d);
                            setDeptName(d.name);
                            setDeptCode(d.code);
                            setDeptModalOpen(true);
                          }}
                          className="text-xs text-[#B8F36B] hover:text-[#C9F788] hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          )}

          {/* TAB 3: CATEGORY SETTINGS */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#121916] border border-[#223128] rounded-xs text-xs text-[#9AA69C] leading-relaxed shadow-lg">
                <strong className="text-[#B8F36B] block mb-0.5 font-mono uppercase tracking-wider">
                  Priority Calculation Formula
                </strong>
                The system priority score is automatically computed when a report is filed. The formula
                combines the category&apos;s base weight, initial citizen severity points, presence of sensitive
                landmarks nearby, and upvote confirmations. Increasing base weight gives higher emergency
                ranking to that category across all wards.
              </div>

              <Table>
                <Thead>
                  <tr>
                    <Th>Category Key</Th>
                    <Th>Display Label</Th>
                    <Th>Default Department</Th>
                    <Th>SLA (Hours)</Th>
                    <Th>Base Weight</Th>
                    <Th>Action</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {categories.map((c) => {
                    const dept = departments.find((d) => d.id === c.department_id);
                    return (
                      <Tr key={c.category}>
                        <Td className="font-mono text-xs text-[#F2F0E8]">{c.category}</Td>
                        <Td className="font-semibold text-xs text-[#F2F0E8]">{c.label}</Td>
                        <Td className="text-xs text-[#9AA69C]">{dept ? dept.name : 'Unassigned'}</Td>
                        <Td className="tabular-nums font-mono text-xs text-[#F0B65A]">{c.sla_hours}h</Td>
                        <Td className="tabular-nums font-mono text-xs font-bold text-[#B8F36B]">
                          {c.base_weight}
                        </Td>
                        <Td>
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCatLabel(c.label);
                              setCatDeptId(c.department_id || '');
                              setCatSlaHours(c.sla_hours);
                              setCatBaseWeight(c.base_weight);
                            }}
                            className="text-xs text-[#B8F36B] hover:text-[#C9F788] hover:underline font-mono font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Ageing Histogram of Open Reports */}
              <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 space-y-3 shadow-lg">
                <h3 className="font-heading text-base font-bold text-[#F2F0E8]">
                  Ageing Histogram of Open Reports
                </h3>
                <p className="text-xs text-[#9AA69C]">
                  Distribution of {openReports.length} unresolved reports by age since submission.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
                  <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
                    <span className="text-[#9AA69C] block text-[11px] font-mono">&lt; 24 Hours</span>
                    <span className="font-mono text-2xl font-bold text-[#B8F36B] tabular-nums">
                      {ageing.less24h}
                    </span>
                  </div>
                  <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
                    <span className="text-[#9AA69C] block text-[11px] font-mono">24 – 72 Hours</span>
                    <span className="font-mono text-2xl font-bold text-[#70B8F5] tabular-nums">
                      {ageing.day1to3}
                    </span>
                  </div>
                  <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
                    <span className="text-[#9AA69C] block text-[11px] font-mono">3 – 7 Days</span>
                    <span className="font-mono text-2xl font-bold text-[#F0B65A] tabular-nums">
                      {ageing.day3to7}
                    </span>
                  </div>
                  <div className="p-3 bg-[#19221D] border border-[#223128] rounded-xs">
                    <span className="text-[#9AA69C] block text-[11px] font-mono">&gt; 7 Days (Critical)</span>
                    <span className="font-mono text-2xl font-bold text-[#F87171] tabular-nums">
                      {ageing.more7d}
                    </span>
                  </div>
                </div>
              </div>

              {/* Escalated Reports List */}
              <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#F2F0E8]">
                      Escalated Reports
                    </h3>
                    <p className="text-xs text-[#9AA69C]">
                      Reports breached beyond SLA threshold requiring direct senior oversight.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F0B65A] px-2.5 py-0.5 bg-[#241E10] border border-[#423419] rounded-xs">
                    {escalatedReports.length} ESCALATED
                  </span>
                </div>

                {escalatedReports.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#9AA69C] bg-[#19221D] rounded-xs border border-[#223128]">
                    No escalated reports at this time. All SLA targets are on track.
                  </div>
                ) : (
                  <Table>
                    <Thead>
                      <tr>
                        <Th>Ref Code</Th>
                        <Th>Title</Th>
                        <Th>Category</Th>
                        <Th>Level</Th>
                        <Th>Escalated At</Th>
                      </tr>
                    </Thead>
                    <Tbody>
                      {escalatedReports.map((r) => (
                        <Tr key={r.id}>
                          <Td className="font-mono font-semibold text-[#B8F36B]">{r.ref_code}</Td>
                          <Td className="font-medium text-[#F2F0E8]">{r.title}</Td>
                          <Td className="text-xs text-[#9AA69C]">{r.category}</Td>
                          <Td className="text-[#F0B65A] font-bold font-mono">L{r.escalation_level}</Td>
                          <Td className="text-xs text-[#9AA69C] font-mono">
                            {r.escalated_at ? new Date(r.escalated_at).toLocaleDateString() : '—'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <span className="text-xs text-[#9AA69C] font-mono">
                SYSTEM STATE TRANSITIONS & AUDIT TRAIL ACROSS ALL MUNICIPAL RECORDS ({auditLogs.length})
              </span>

              {auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit log entries"
                  description="All status modifications and reviewer actions will be recorded here permanently."
                />
              ) : (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Timestamp</Th>
                      <Th>Event</Th>
                      <Th>Transition</Th>
                      <Th>Audit Note</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {auditLogs.map((log) => (
                      <Tr key={log.id}>
                        <Td className="font-mono text-xs whitespace-nowrap text-[#9AA69C]">
                          {new Date(log.created_at).toLocaleString()}
                        </Td>
                        <Td className="font-semibold text-xs capitalize text-[#F2F0E8]">{log.event}</Td>
                        <Td className="text-xs text-[#9AA69C]">
                          {log.from_status ? `${log.from_status} → ` : ''}
                          <strong className="text-[#B8F36B]">{log.to_status}</strong>
                        </Td>
                        <Td className="text-xs text-[#9AA69C] max-w-sm truncate">{log.note || '—'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </div>
          )}
        </>
      )}

      {/* DIALOG: EDIT USER ROLE */}
      <Dialog
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        title="Edit User Role & Department"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#9AA69C]">
            Modifying credentials for{' '}
            <strong className="text-[#F2F0E8]">{editingProfile?.full_name || 'User'}</strong>
          </p>

          <FormField label="Assigned System Role" required>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <option value="citizen">Citizen (File reports & track)</option>
              <option value="reviewer">Reviewer (Verify, prioritize, assign)</option>
              <option value="officer">Officer (Field resolve & upload photo proof)</option>
              <option value="admin">Administrator (Full ledger governance)</option>
            </Select>
          </FormField>

          {/* Department required for officers */}
          <FormField
            label="Department"
            required={selectedRole === 'officer'}
            hint={
              selectedRole === 'officer'
                ? 'Officers can strictly only inspect and resolve reports assigned to their department.'
                : 'Optional for reviewers and administrators.'
            }
          >
            <Select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <option value="">None / Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="pt-3 border-t border-[#223128] flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditingProfile(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveUser}>
              Save changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG: ADD/RENAME DEPARTMENT */}
      <Dialog
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Rename Department' : 'Create Department'}
      >
        <div className="space-y-4 text-xs">
          <FormField label="Department Name" required>
            <Input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Roads & Infrastructure Division"
              required
            />
          </FormField>
          <FormField label="Department Code" required hint="Short 3-5 letter identifier">
            <Input
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              placeholder="e.g. ROADS"
              maxLength={6}
              required
            />
          </FormField>
          <div className="pt-3 border-t border-[#223128] flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveDepartment}>
              Save department
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG: EDIT CATEGORY CONFIG */}
      <Dialog
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title="Edit Category Parameters"
      >
        <div className="space-y-4 text-xs">
          <FormField label="Category Label" required>
            <Input
              value={catLabel}
              onChange={(e) => setCatLabel(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Default Responsible Department">
            <Select
              value={catDeptId}
              onChange={(e) => setCatDeptId(e.target.value)}
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="SLA Target (Hours)" required hint="Target turnaround before escalation">
            <Input
              type="number"
              value={catSlaHours}
              onChange={(e) => setCatSlaHours(parseInt(e.target.value) || 24)}
              min={1}
              required
            />
          </FormField>

          <FormField
            label="Base Priority Weight"
            required
            hint="Determines baseline urgency score added to new reports of this type"
          >
            <Input
              type="number"
              value={catBaseWeight}
              onChange={(e) => setCatBaseWeight(parseInt(e.target.value) || 10)}
              min={1}
              max={100}
              required
            />
          </FormField>

          <div className="pt-3 border-t border-[#223128] flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCategoryConfig}>
              Update configuration
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
