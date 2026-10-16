import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { PublicReport, HazardCategory, SeverityLevel, ReportStatus } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { StatusBadge } from './ui/StatusBadge';
import { PriorityGlyph } from './ui/PriorityGlyph';
import { Button } from './ui/Button';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface HomeIncidentMapProps {
  reports: PublicReport[];
  isDemoData: boolean;
  language: 'en' | 'hi' | 'te';
}

export const HomeIncidentMap: React.FC<HomeIncidentMapProps> = ({
  reports,
  isDemoData,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [17.385, 78.4867], // Hyderabad default
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layer;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore cleanup race
      }
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && r.effective_priority !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRef = r.ref_code.toLowerCase().includes(q);
      const matchCat = (CATEGORY_LABELS[r.category]?.[language] || r.category).toLowerCase().includes(q);
      if (!matchRef && !matchCat) return false;
    }
    return true;
  });

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const priorityColors: Record<SeverityLevel, string> = {
      low: '#9AA69C',
      medium: '#70B8F5',
      high: '#F0B65A',
      critical: '#B8F36B',
    };

    const validReports = filteredReports.filter((r) => r.lat && r.lng);

    validReports.forEach((r) => {
      const isSelected = r.id === selectedReportId;
      const color = priorityColors[r.effective_priority] || '#B8F36B';

      const markerHtml = `
        <div style="
          width: ${isSelected ? '26px' : '16px'};
          height: ${isSelected ? '26px' : '16px'};
          background-color: ${color};
          border: ${isSelected ? '3px solid #0B0F0D' : '2px solid #121916'};
          border-radius: 50%;
          box-shadow: 0 0 16px ${color}80;
          cursor: pointer;
          transition: all 0.2s ease;
        "></div>
      `;

      const icon = L.divIcon({
        className: 'home-map-marker',
        html: markerHtml,
        iconSize: [isSelected ? 26 : 16, isSelected ? 26 : 16],
        iconAnchor: [isSelected ? 13 : 8, isSelected ? 13 : 8],
      });

      const marker = L.marker([r.lat!, r.lng!], { icon });

      marker.on('click', () => {
        setSelectedReportId(r.id);
        if (mapRef.current) {
          try {
            mapRef.current.panTo([r.lat!, r.lng!], { animate: true });
          } catch {
            // safely ignore
          }
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    if (validReports.length > 0 && mapRef.current && !selectedReportId) {
      try {
        const group = L.featureGroup(markersLayerRef.current.getLayers() as L.Marker[]);
        if (group.getBounds().isValid()) {
          mapRef.current.fitBounds(group.getBounds().pad(0.12), { animate: false });
        }
      } catch {
        // safely ignore
      }
    }
  }, [filteredReports, selectedReportId, language]);

  const selectedReport = reports.find((r) => r.id === selectedReportId);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs bg-[#121916] p-3.5 border border-[#223128] rounded-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#9AA69C] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference code or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#19221D] border border-[#223128] rounded-xs text-[#F2F0E8] placeholder:text-[#9AA69C]/60 focus:outline-none focus:border-[#B8F36B] focus:ring-1 focus:ring-[#B8F36B]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABELS) as HazardCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat][language]}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-[#223128] rounded-xs bg-[#19221D] text-[#F2F0E8] font-medium focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Counter & Transparent Disclosure Label */}
        <div className="flex items-center gap-3 shrink-0 text-[#9AA69C]">
          <span className="font-mono text-[11px] tabular-nums text-[#B8F36B]">
            {filteredReports.length} {filteredReports.length === 1 ? 'incident' : 'incidents'} plotted
          </span>
          {isDemoData && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#261E10] border border-[#4A3B18] text-[#F0B65A] rounded-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B65A]" />
              SAMPLE DATA // HYDERABAD
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout: Map on Left (7 cols) + Report List & Detail Drawer on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-7 h-[460px] lg:h-[540px] rounded-xs border border-[#223128] overflow-hidden relative shadow-md bg-[#0E1411]">
          <div ref={containerRef} className="h-full w-full invert-tiles" />

          {/* Map Floating Legend */}
          <div className="absolute top-3 left-3 z-[400] bg-[#121916]/90 backdrop-blur-md border border-[#223128] rounded-xs p-2.5 text-[11px] shadow-lg space-y-1">
            <span className="font-semibold text-[#F2F0E8] block">Severity Index</span>
            <div className="flex items-center gap-2.5 text-[#9AA69C]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9AA69C]" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#70B8F5]" /> Med
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F0B65A]" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8F36B]" /> Critical
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Incident Detail or Fast Scanner List */}
        <div className="lg:col-span-5 h-[460px] lg:h-[540px] flex flex-col">
          {selectedReport ? (
            /* Selected Detail Panel */
            <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 flex flex-col justify-between h-full shadow-lg text-xs animate-in fade-in duration-150">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#223128]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-[#B8F36B]">
                        {selectedReport.ref_code}
                      </span>
                      {isDemoData && (
                        <span className="text-[10px] bg-[#19221D] px-1.5 py-0.5 border border-[#223128] text-[#9AA69C] rounded-xs font-mono">
                          SAMPLE
                        </span>
                      )}
                    </div>
                    <span className="font-heading text-lg font-bold text-[#F2F0E8] block leading-snug">
                      {CATEGORY_LABELS[selectedReport.category]?.[language] || selectedReport.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedReportId(null)}
                    className="p-1 text-[#9AA69C] hover:text-[#F2F0E8] hover:bg-[#19221D] rounded-xs"
                    aria-label="Close detail panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Priority Strip */}
                <div className="flex items-center justify-between bg-[#19221D] p-3 border border-[#223128] rounded-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-0.5">
                      Current Status
                    </span>
                    <StatusBadge status={selectedReport.status} size="sm" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block mb-0.5">
                      Priority Level
                    </span>
                    <PriorityGlyph priority={selectedReport.effective_priority} />
                  </div>
                </div>

                {/* Location & Coordinates */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block">
                    Municipal Coordinates
                  </span>
                  <p className="font-mono text-xs text-[#B8F36B]">
                    {selectedReport.lat?.toFixed(5)}° N, {selectedReport.lng?.toFixed(5)}° E
                  </p>
                </div>

                {/* Age & SLA sentence */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[#9AA69C] block">
                    Ledger Timestamp
                  </span>
                  <div className="flex items-center gap-1.5 text-[#9AA69C]">
                    <Clock className="w-3.5 h-3.5 text-[#9AA69C]" />
                    <span>Logged on {new Date(selectedReport.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* SLA target note if present */}
                {selectedReport.sla_due_at && (
                  <div className="p-3 bg-[#1A261E] border border-[#264F37] text-[#B8F36B] rounded-xs text-xs space-y-0.5">
                    <span className="font-semibold block">Target SLA Deadline:</span>
                    <span>{new Date(selectedReport.sla_due_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-[#223128] flex gap-2">
                <Link to={`/reports/${selectedReport.id}`} className="flex-1">
                  <Button variant="primary" size="md" className="w-full gap-2 text-xs">
                    <span>Inspect Full Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="px-3 py-2 text-xs text-[#9AA69C] hover:bg-[#19221D] border border-[#223128] rounded-xs"
                >
                  List
                </button>
              </div>
            </div>
          ) : (
            /* Fast Scanner Report List */
            <div className="bg-[#121916] border border-[#223128] rounded-xs flex flex-col h-full shadow-md">
              <div className="px-4 py-3 bg-[#0E1512] border-b border-[#223128] flex items-center justify-between text-xs font-semibold text-[#9AA69C]">
                <span className="uppercase tracking-wider text-[11px] font-mono">Incident Registry</span>
                <span>Select marker or row</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#19251E]">
                {filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#9AA69C]">
                    No hazards match your active filters. Try clearing some selections.
                  </div>
                ) : (
                  filteredReports.slice(0, 15).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReportId(r.id);
                        if (mapRef.current && r.lat && r.lng) {
                          mapRef.current.panTo([r.lat, r.lng]);
                        }
                      }}
                      className="p-3.5 hover:bg-[#19221D] cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#B8F36B]">
                            {r.ref_code}
                          </span>
                          <StatusBadge status={r.status} size="sm" />
                        </div>
                        <p className="font-medium text-[#F2F0E8] truncate">
                          {CATEGORY_LABELS[r.category]?.[language] || r.category}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#9AA69C]">
                          <PriorityGlyph priority={r.effective_priority} />
                          <span>·</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#223128] group-hover:text-[#B8F36B] shrink-0 transition-colors" />
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-[#0E1512] border-t border-[#223128] text-center">
                <Link
                  to="/public"
                  className="text-xs font-semibold text-[#B8F36B] hover:text-[#C9F788] inline-flex items-center gap-1 font-mono"
                >
                  <span>Explore complete public transparency ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
