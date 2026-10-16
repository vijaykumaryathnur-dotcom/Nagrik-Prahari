import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { LanguageCode } from '../types/database';
import {
  FileText,
  BarChart2,
  Shield,
  Settings,
  PlusCircle,
  Home,
  WifiOff,
  RefreshCw,
  LogOut,
  LogIn,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { getOfflineDrafts, syncSingleDraft } from '../lib/offlineSync';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, role, signOut, language, setLanguage, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineDraftCount, setOfflineDraftCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const checkDrafts = () => {
    const drafts = getOfflineDrafts();
    setOfflineDraftCount(drafts.length);
  };

  useEffect(() => {
    checkDrafts();
    const handleOnline = async () => {
      setIsOnline(true);
      const drafts = getOfflineDrafts();
      if (drafts.length > 0 && user) {
        setIsSyncing(true);
        for (const draft of drafts) {
          await syncSingleDraft(draft, user.id);
        }
        setIsSyncing(false);
        checkDrafts();
        setSyncNotice(t.backOnlineSynced);
        setTimeout(() => setSyncNotice(null), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, t]);

  const triggerSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    const drafts = getOfflineDrafts();
    for (const draft of drafts) {
      await syncSingleDraft(draft, user.id);
    }
    setIsSyncing(false);
    checkDrafts();
  };

  const isStaff = role === 'reviewer' || role === 'officer' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F0D] text-[#F2F0E8]">
      {/* 1. Tactical Command Bar / Prototype Ribbon */}
      <div className="w-full bg-[#0E1512] text-[#9AA69C] text-[11px] font-mono tracking-wide py-1.5 px-4 text-center select-none border-b border-[#223128]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8F36B] animate-pulse" />
            <span className="hidden sm:inline">
              CIVIC INTELLIGENCE PLATFORM · SURAKSHIT BHARAT INITIATIVE
            </span>
          </div>
          <span className="font-semibold text-[#B8F36B]">
            {t.prototypeNotice}
          </span>
          <span className="hidden md:inline text-[10px] text-[#9AA69C]/80">
            SRID 4326 · REALTIME POSTGIS LEDGER
          </span>
        </div>
      </div>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="w-full bg-[#261E10] text-[#F0B65A] border-b border-[#4A3B18] px-4 py-2 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.offlineDraftSaved}</span>
          </div>
          {offlineDraftCount > 0 && (
            <span className="text-[11px] tabular-nums font-semibold">
              ({offlineDraftCount} draft{offlineDraftCount > 1 ? 's' : ''} saved locally)
            </span>
          )}
        </div>
      )}

      {/* Sync Notice Alert */}
      {syncNotice && (
        <div className="w-full bg-[#14271B] text-[#B8F36B] border-b border-[#234A31] px-4 py-2 text-xs font-medium flex items-center justify-between">
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice(null)} className="font-bold text-sm cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* 2. Top Bar Navigation Contract: Brand wordmark — Nav links — Primary action */}
      <header className="sticky top-0 z-40 bg-[#0B0F0D]/90 backdrop-blur-md border-b border-[#223128]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="flex items-baseline gap-2.5 group">
              <span className="font-heading text-2xl font-bold tracking-tight text-[#F2F0E8] group-hover:text-[#B8F36B] transition-colors flex items-center gap-1.5">
                <span>NagrikPrahari</span>
                <span className="w-2 h-2 rounded-full bg-[#B8F36B]" />
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#9AA69C] hidden lg:inline">
                CIVIC INTELLIGENCE
              </span>
            </Link>

            {/* Zone 2: Single-line Text Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold tracking-tight text-[#9AA69C]">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                  }`
                }
              >
                Overview
              </NavLink>

              <NavLink
                to="/public"
                className={({ isActive }) =>
                  `transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                  }`
                }
              >
                Public statistics
              </NavLink>

              {user && (
                <>
                  <NavLink
                    to="/report"
                    className={({ isActive }) =>
                      `transition-colors whitespace-nowrap ${
                        isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                      }`
                    }
                  >
                    Report hazard
                  </NavLink>

                  <NavLink
                    to="/my-reports"
                    className={({ isActive }) =>
                      `transition-colors whitespace-nowrap ${
                        isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                      }`
                    }
                  >
                    {t.myReports}
                  </NavLink>
                </>
              )}

              {isStaff && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `transition-colors whitespace-nowrap ${
                      isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                    }`
                  }
                >
                  {t.staffWorkspace}
                </NavLink>
              )}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `transition-colors whitespace-nowrap ${
                      isActive ? 'text-[#F2F0E8] border-b-2 border-[#B8F36B] pb-0.5' : 'hover:text-[#F2F0E8]'
                    }`
                  }
                >
                  {t.adminWorkspace}
                </NavLink>
              )}
            </nav>
          </div>

          {/* Zone 3: Controls & Account Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Offline draft sync badge button */}
            {offlineDraftCount > 0 && isOnline && (
              <button
                onClick={triggerSync}
                disabled={isSyncing}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#261E10] text-[#F0B65A] border border-[#4A3B18] rounded-xs hover:bg-[#332815] transition-colors"
                title="Sync pending drafts to ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap font-medium">
                  {isSyncing ? 'Syncing...' : `Sync ${offlineDraftCount} draft`}
                </span>
              </button>
            )}

            {/* Language Selector (Segmented buttons) */}
            <div className="flex items-center border border-[#223128] rounded-xs bg-[#121916] overflow-hidden text-[11px] font-semibold">
              {(['en', 'hi', 'te'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
                    language === code
                      ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold'
                      : 'text-[#9AA69C] hover:bg-[#19221D] hover:text-[#F2F0E8]'
                  }`}
                  aria-label={`Switch language to ${code}`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Notifications Bell */}
            {user && <NotificationsDropdown />}

            {/* Account CTA Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-xs text-[#9AA69C] max-w-[130px] truncate font-medium">
                  {profile?.full_name || user.email?.split('@')[0]}
                  {role !== 'citizen' && (
                    <span className="ml-1 text-[10px] uppercase font-bold text-[#B8F36B] bg-[#14271B] border border-[#234A31] px-1.5 py-0.5 rounded-xs">
                      {role}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 text-xs text-[#9AA69C] hover:text-[#F87171] hover:bg-[#251313] rounded-xs transition-colors cursor-pointer"
                  title={t.signOut}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-[#F2F0E8] hover:bg-[#19221D] border border-[#223128] rounded-xs transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.signIn}</span>
                </Link>
                <Link
                  to="/report"
                  className="min-h-[38px] px-4 py-1.5 text-xs font-bold bg-[#B8F36B] text-[#0B0F0D] hover:bg-[#C9F788] rounded-xs transition-all shadow-[0_0_15px_rgba(184,243,107,0.2)] whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <span>Report hazard</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Cinematic Dark Footer */}
      <footer className="mt-24 border-t border-[#223128] bg-[#0E1512] text-[#F2F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-[#223128]">
            {/* Col 1: Wordmark & Purpose */}
            <div className="lg:col-span-2 space-y-4">
              <span className="font-heading text-2xl font-bold tracking-tight text-[#F2F0E8] flex items-center gap-2">
                <span>NagrikPrahari</span>
                <span className="w-2 h-2 rounded-full bg-[#B8F36B]" />
              </span>
              <p className="text-xs sm:text-sm text-[#9AA69C] max-w-sm leading-relaxed">
                An open civic intelligence platform and public infrastructure resolution ledger for Indian municipal bodies.
                Transforming citizen reports into prioritized action and photographic resolution proof.
              </p>
              <div className="pt-2 text-xs text-[#9AA69C] flex items-center gap-2 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-[#B8F36B]" />
                <span className="font-medium text-[#F2F0E8]">Civic Transparency Standard</span>
                <span>·</span>
                <span>PostGIS SRID 4326</span>
              </div>
            </div>

            {/* Col 2: Citizen Actions */}
            <div className="space-y-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#9AA69C] block text-[11px] font-mono">
                Citizen Portal
              </span>
              <ul className="space-y-2 text-[#9AA69C]">
                <li>
                  <Link to="/report" className="hover:text-[#B8F36B] transition-colors">
                    Report a Hazard
                  </Link>
                </li>
                <li>
                  <Link to="/my-reports" className="hover:text-[#B8F36B] transition-colors">
                    My Incident History
                  </Link>
                </li>
                <li>
                  <Link to="/public" className="hover:text-[#B8F36B] transition-colors">
                    Public City Ledger
                  </Link>
                </li>
                <li>
                  <a href="#incident-map" className="hover:text-[#B8F36B] transition-colors">
                    Interactive Incident Map
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Resolution & Authority */}
            <div className="space-y-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#9AA69C] block text-[11px] font-mono">
                Authority & SLA
              </span>
              <ul className="space-y-2 text-[#9AA69C]">
                <li>
                  <Link to="/dashboard" className="hover:text-[#B8F36B] transition-colors">
                    Staff Workspace
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#B8F36B] transition-colors">
                    Municipal Administration
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#B8F36B] transition-colors">
                    SLA & Verification Process
                  </a>
                </li>
                <li>
                  <a href="#evidence-standard" className="hover:text-[#B8F36B] transition-colors">
                    Resolution Proof Standards
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Legal */}
            <div className="space-y-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#9AA69C] block text-[11px] font-mono">
                Architecture
              </span>
              <p className="text-[#9AA69C] leading-relaxed text-[11px]">
                Engineered for municipal integration, ward pilot programs, and civic tech partnerships across India.
              </p>
              <div className="pt-1">
                <span className="text-[11px] text-[#B8F36B] font-mono">
                  PostGIS EWKT · PostgREST · OpenStreetMap
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Statement & Independence Disclaimer */}
          <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#9AA69C]">
            <p className="max-w-2xl text-[11px] leading-relaxed">
              <strong>Notice:</strong> NagrikPrahari is an independent civic technology platform engineered for open municipal accountability.
              Not affiliated with any specific municipal corporation unless explicitly established via formal partnership.
            </p>
            <div className="text-[11px] font-mono shrink-0 text-[#9AA69C]">
              © 2026 NagrikPrahari · Command Edition
            </div>
          </div>
        </div>
      </footer>

      {/* 3. Mobile Bottom Navigation Bar for Citizens */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1512]/95 backdrop-blur-md border-t border-[#223128] px-2 py-1 flex items-center justify-around"
        aria-label="Mobile navigation"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#B8F36B]' : 'text-[#9AA69C]'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#B8F36B]' : 'text-[#9AA69C]'
            }`
          }
        >
          <PlusCircle className="w-5 h-5 mb-0.5" />
          <span>Report</span>
        </NavLink>

        <NavLink
          to="/my-reports"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#B8F36B]' : 'text-[#9AA69C]'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>My reports</span>
        </NavLink>

        <NavLink
          to="/public"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#B8F36B]' : 'text-[#9AA69C]'
            }`
          }
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span>Public</span>
        </NavLink>

        {isStaff && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-[11px] font-semibold transition-colors ${
                isActive ? 'text-[#B8F36B]' : 'text-[#9AA69C]'
              }`
            }
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Staff</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};
