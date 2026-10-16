import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { PublicReport, HazardCategory, SeverityLevel } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';
import { StatusBadge } from './ui/StatusBadge';
import { PriorityGlyph } from './ui/PriorityGlyph';
import {
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
  Maximize2,
  Navigation,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AnimatedGeospatialHeroProps {
  reports: PublicReport[];
  isDemoData: boolean;
  language: 'en' | 'hi' | 'te';
  onSelectReportModal: (report: PublicReport) => void;
}

const LOCATION_DESCRIPTIONS: Record<string, string> = {
  'demo-1': 'Abids GPO Main Junction, Ward 04',
  'demo-2': 'Banjara Hills Rd No. 12, Ward 02',
  'demo-3': 'MG Road near Paradise Circle, Secunderabad',
  'demo-4': 'Hitec City Cyber Towers Crossroad, Ward 09',
  'demo-5': 'Charminar East Pedestrian Plaza, Ward 03',
  'demo-6': 'Jubilee Hills Checkpost Circle, Ward 01',
  'demo-7': 'Lakdikapul Metro Pillar 1142, Ward 05',
};

// Dispatch Hub for Hyderabad Central Municipal Command
const MUNICIPAL_DISPATCH_COORDS: [number, number] = [17.4065, 78.4715];

export const AnimatedGeospatialHero: React.FC<AnimatedGeospatialHeroProps> = ({
  reports,
  isDemoData,
  language,
  onSelectReportModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const dispatchMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Filter reports by category
  const filteredReports = reports.filter((r) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'roads') {
      return r.category === 'pothole' || r.category === 'damaged_road' || r.category === 'damaged_footpath';
    }
    if (selectedCategory === 'lighting') {
      return r.category === 'broken_streetlight';
    }
    if (selectedCategory === 'drainage') {
      return r.category === 'open_drain' || r.category === 'garbage_overflow';
    }
    if (selectedCategory === 'waterlogging') {
      return r.category === 'waterlogging';
    }
    if (selectedCategory === 'traffic') {
      return r.category === 'fallen_tree' || r.category === 'other';
    }
    return r.category === selectedCategory;
  });

  // Set default selection to first report if none selected
  useEffect(() => {
    if (!selectedReportId && filteredReports.length > 0) {
      setSelectedReportId(filteredReports[0].id);
    } else if (selectedReportId && !filteredReports.some((r) => r.id === selectedReportId)) {
      if (filteredReports.length > 0) {
        setSelectedReportId(filteredReports[0].id);
      }
    }
  }, [filteredReports, selectedReportId]);

  // 1. Initialize Real Leaflet Map of Hyderabad
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Centered on Hyderabad (Hussain Sagar / Banjara Hills corridor)
    const map = L.map(containerRef.current, {
      center: [17.412, 78.455],
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    // Authentic OpenStreetMap tiles for Hyderabad with dark cartography inversion (no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layer;

    // Add Central Municipal Dispatch Depot Marker
    const depotIcon = L.divIcon({
      className: 'depot-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #14271B;
          border: 2px solid #B8F36B;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(184,243,107,0.6);
        ">
          <div style="width: 8px; height: 8px; background: #B8F36B; border-radius: 1px;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const depotMarker = L.marker(MUNICIPAL_DISPATCH_COORDS, { icon: depotIcon })
      .bindTooltip('<b>Hyderabad Municipal Dispatch Command</b><br/><span style="font-size:10px;color:#9AA69C">Base Depot · Rapid Response Unit</span>', {
        direction: 'top',
        offset: [0, -10],
      })
      .addTo(map);
    dispatchMarkerRef.current = depotMarker;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore
      }
      mapRef.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  // 2. Render Markers and Dynamic Route Lines
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const priorityColors: Record<SeverityLevel, string> = {
      low: '#9AA69C',
      medium: '#70B8F5',
      high: '#F0B65A',
      critical: '#B8F36B',
    };

    const validReports = filteredReports.filter((r) => r.lat && r.lng);

    validReports.forEach((rep) => {
      const isSelected = rep.id === selectedReportId;
      const color = priorityColors[rep.effective_priority] || '#B8F36B';
      const isCritical = rep.effective_priority === 'critical';

      const markerHtml = `
        <div style="
          position: relative;
          width: ${isSelected ? '32px' : '22px'};
          height: ${isSelected ? '32px' : '22px'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          ${
            isSelected || isCritical
              ? `<span style="
                  position: absolute;
                  inset: -6px;
                  border-radius: 50%;
                  background: ${color};
                  opacity: 0.35;
                  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></span>`
              : ''
          }
          <div style="
            width: ${isSelected ? '24px' : '16px'};
            height: ${isSelected ? '24px' : '16px'};
            background-color: ${color};
            border: 2px solid ${isSelected ? '#FFFFFF' : '#0B0F0D'};
            border-radius: 50%;
            box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color}B3;
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${
              isCritical
                ? `<div style="width: 5px; height: 5px; background: #0B0F0D; border-radius: 50%;"></div>`
                : ''
            }
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'hyd-hazard-marker',
        html: markerHtml,
        iconSize: [isSelected ? 32 : 22, isSelected ? 32 : 22],
        iconAnchor: [isSelected ? 16 : 11, isSelected ? 16 : 11],
      });

      const marker = L.marker([rep.lat!, rep.lng!], { icon });

      marker.on('click', () => {
        setSelectedReportId(rep.id);
        if (mapRef.current) {
          try {
            mapRef.current.panTo([rep.lat!, rep.lng!], { animate: true, duration: 0.6 });
          } catch {
            // safely ignore
          }
        }
      });

      marker.bindTooltip(
        `<b>${rep.ref_code}</b>: ${CATEGORY_LABELS[rep.category]?.[language] || rep.category}<br/><span style="font-size:10px;color:#B8F36B;font-family:monospace">Status: ${rep.status.toUpperCase()}</span>`,
        { direction: 'top', offset: [0, -12] }
      );

      markersLayerRef.current?.addLayer(marker);
    });

    // 3. Draw subtle animated route line from Dispatch Depot to Selected Report
    const selectedRep = validReports.find((r) => r.id === selectedReportId);
    if (selectedRep && selectedRep.lat && selectedRep.lng && mapRef.current) {
      // Create waypoint route that travels along Hyderabad avenues
      const midLat = (MUNICIPAL_DISPATCH_COORDS[0] + selectedRep.lat) / 2 + 0.004;
      const midLng = (MUNICIPAL_DISPATCH_COORDS[1] + selectedRep.lng) / 2 - 0.003;

      const pathPoints: [number, number][] = [
        MUNICIPAL_DISPATCH_COORDS,
        [midLat, midLng],
        [selectedRep.lat, selectedRep.lng],
      ];

      const routePolyline = L.polyline(pathPoints, {
        color: '#B8F36B',
        weight: 3,
        opacity: 0.85,
        dashArray: '6, 10',
        className: 'hero-animated-route',
      }).addTo(mapRef.current);

      routeLayerRef.current = routePolyline;
    }
  }, [filteredReports, selectedReportId, language]);

  const activeReport = reports.find((r) => r.id === selectedReportId) || filteredReports[0] || reports[0];
  const activeLocation = activeReport ? LOCATION_DESCRIPTIONS[activeReport.id] || `Ward ${activeReport.ward_id}, Hyderabad` : 'Hyderabad Municipal Area';
  const categoryTitle = activeReport ? CATEGORY_LABELS[activeReport.category]?.[language] || activeReport.category : '';

  return (
    <div className="relative w-full h-[580px] lg:h-[620px] bg-[#0B0F0D] border border-[#223128] rounded-xs overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col justify-between select-none">
      {/* 1. Tactical Command Header Strip */}
      <div className="p-3.5 sm:p-4 bg-[#121916]/95 backdrop-blur-md border-b border-[#223128] flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8F36B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B8F36B]"></span>
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#F2F0E8] uppercase">
              HYDERABAD SECTOR // LIVE MAP
            </span>
          </div>
          <span className="hidden sm:inline text-[#223128]">|</span>
          <span className="hidden sm:inline text-[11px] text-[#9AA69C] font-mono">
            17.3850° N, 78.4867° E
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {isDemoData ? (
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#261E10] border border-[#4A3B18] text-[#F0B65A] rounded-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B65A]" />
              SAMPLE DATA
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#14271B] border border-[#234A31] text-[#B8F36B] rounded-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8F36B]" />
              LIVE LEDGER
            </span>
          )}
          <span className="font-mono text-[#9AA69C] hidden md:inline">
            {filteredReports.length} HAZARDS
          </span>
        </div>
      </div>

      {/* 2. Interactive Category Filter Chips */}
      <div className="px-3.5 py-2 bg-[#0E1512]/95 backdrop-blur-sm border-b border-[#223128] z-20 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-[11px]">
        <span className="text-[#9AA69C] font-mono text-[10px] uppercase mr-1 hidden sm:inline">
          Filter:
        </span>
        {[
          { id: 'all', label: 'All Hazards' },
          { id: 'roads', label: 'Roads & Potholes' },
          { id: 'lighting', label: 'Streetlights' },
          { id: 'drainage', label: 'Drainage' },
          { id: 'waterlogging', label: 'Waterlogging' },
          { id: 'traffic', label: 'Traffic & Signals' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#B8F36B] text-[#0B0F0D] font-bold shadow-[0_0_12px_rgba(184,243,107,0.3)]'
                : 'bg-[#19221D] border border-[#223128] text-[#9AA69C] hover:text-[#F2F0E8] hover:border-[#384E3F]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. The Recognizable Hyderabad Leaflet Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={containerRef} className="w-full h-full z-0 invert-tiles" />

        {/* Subtle Map Compass Indicator */}
        <div className="absolute top-3 right-3 z-[400] bg-[#121916]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xs border border-[#223128] flex items-center gap-2 text-[10px] font-mono text-[#9AA69C] shadow-lg pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-[#B8F36B] animate-spin-slow" />
          <span>HYD GRID · N</span>
        </div>

        {/* Floating Route Legend */}
        <div className="absolute top-3 left-3 z-[400] bg-[#121916]/90 backdrop-blur-md px-3 py-1.5 rounded-xs border border-[#223128] flex items-center gap-2 text-[10px] font-mono text-[#F2F0E8] shadow-lg pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#14271B] border border-[#B8F36B] inline-block" />
          <span className="text-[#9AA69C]">Base</span>
          <span className="text-[#B8F36B]">➔</span>
          <span className="w-2 h-2 rounded-full bg-[#B8F36B] inline-block animate-pulse" />
          <span>Active Patrol Vector</span>
        </div>
      </div>

      {/* 4. Selected Incident Inspection Panel (Overlaid on Bottom) */}
      {activeReport && (
        <motion.div
          key={activeReport.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-[#121916]/95 backdrop-blur-md border-t border-[#223128] z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xl"
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#B8F36B] tracking-wider">
                {activeReport.ref_code}
              </span>
              <StatusBadge status={activeReport.status} size="sm" />
              <PriorityGlyph priority={activeReport.effective_priority} />
              {activeReport.effective_priority === 'critical' && (
                <span className="px-1.5 py-0.5 bg-[#2B1414] border border-[#521E1E] text-[#F87171] font-mono text-[10px] font-bold rounded-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F87171]" />
                  CRITICAL DISPATCH
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm font-bold text-[#F2F0E8] truncate">
              <span>{categoryTitle}</span>
              <span className="text-[#223128]">·</span>
              <span className="text-xs font-normal text-[#9AA69C] truncate">
                {activeLocation}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9AA69C] font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#B8F36B]" />
                {activeReport.lat?.toFixed(4)}° N, {activeReport.lng?.toFixed(4)}° E
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#F0B65A]" />
                SLA: {activeReport.sla_due_at ? new Date(activeReport.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Statutory'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onSelectReportModal(activeReport)}
              className="px-3.5 py-2 bg-[#B8F36B] text-[#0B0F0D] hover:bg-[#C9F788] rounded-xs font-bold font-mono text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Inspect Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
