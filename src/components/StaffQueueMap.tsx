import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { StaffReport, SeverityLevel } from '../types/database';

interface StaffQueueMapProps {
  reports: StaffReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
}

export const StaffQueueMap: React.FC<StaffQueueMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [17.385, 78.4867], // Hyderabad default
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layer;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore
      }
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers when reports or selection change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const priorityColors: Record<SeverityLevel, string> = {
      low: '#9AA69C',
      medium: '#70B8F5',
      high: '#F0B65A',
      critical: '#B8F36B',
    };

    const validReportsWithCoords = reports.filter((r) => r.lat && r.lng);

    validReportsWithCoords.forEach((rep) => {
      const isSelected = rep.id === selectedReportId;
      const color = priorityColors[rep.effective_priority || rep.severity] || '#9AA69C';

      const markerHtml = `
        <div style="
          width: ${isSelected ? '28px' : '22px'};
          height: ${isSelected ? '28px' : '22px'};
          background-color: ${color};
          border: 2px solid ${isSelected ? '#B8F36B' : '#0B0F0D'};
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? '14px rgba(184,243,107,0.7)' : '8px rgba(0,0,0,0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0B0F0D;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: ${isSelected ? '11px' : '9px'};
          cursor: pointer;
        ">
          ${rep.effective_priority === 'critical' ? '!' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-staff-marker',
        html: markerHtml,
        iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
        iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
      });

      const marker = L.marker([rep.lat!, rep.lng!], { icon: customIcon });

      marker.on('click', () => {
        onSelectReport(rep.id);
      });

      marker.bindTooltip(
        `<b>${rep.ref_code}</b>: ${rep.title}<br/>Priority: ${rep.effective_priority || rep.severity}`,
        { direction: 'top', offset: [0, -10] }
      );

      markersLayerRef.current?.addLayer(marker);

      if (isSelected && mapRef.current) {
        try {
          mapRef.current.panTo([rep.lat!, rep.lng!], { animate: true });
        } catch {
          // safely ignore
        }
      }
    });

    if (validReportsWithCoords.length > 0 && !selectedReportId && mapRef.current) {
      try {
        const group = L.featureGroup(markersLayerRef.current.getLayers() as L.Marker[]);
        if (group.getBounds().isValid()) {
          mapRef.current.fitBounds(group.getBounds().pad(0.15), { animate: false });
        }
      } catch {
        // safely ignore
      }
    }
  }, [reports, selectedReportId, onSelectReport]);

  return (
    <div className="h-full w-full rounded-xs border border-[#223128] overflow-hidden relative shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
      <div ref={containerRef} className="h-full w-full invert-tiles" />
      <div className="absolute top-2 right-2 z-[400] bg-[#121916]/95 backdrop-blur-sm px-3 py-2 rounded-xs border border-[#223128] text-[11px] space-y-1 shadow-lg">
        <span className="font-mono font-bold text-[#F2F0E8] block uppercase text-[10px]">Priority Legend</span>
        <div className="flex items-center gap-2.5 text-[#9AA69C] font-mono text-[10px]">
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8F36B]" /> Crit
          </span>
        </div>
      </div>
    </div>
  );
};
