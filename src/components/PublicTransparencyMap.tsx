import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PublicReport, SeverityLevel } from '../types/database';
import { CATEGORY_LABELS } from '../lib/i18n';

interface PublicMapProps {
  reports: PublicReport[];
  viewMode: 'pins' | 'hotspots';
  language: 'en' | 'hi' | 'te';
}

export const PublicTransparencyMap: React.FC<PublicMapProps> = ({
  reports,
  viewMode,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [17.385, 78.4867], // Hyderabad
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore
      }
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();

    const priorityColors: Record<SeverityLevel, string> = {
      low: '#526477',
      medium: '#145388',
      high: '#9A6B1A',
      critical: '#D9A441',
    };

    const validReports = reports.filter((r) => r.lat && r.lng);

    if (viewMode === 'pins') {
      validReports.forEach((r) => {
        const color = priorityColors[r.effective_priority] || '#526477';

        const markerHtml = `
          <div style="
            width: 15px;
            height: 15px;
            background-color: ${color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 1px 6px rgba(16,42,67,0.3);
          "></div>
        `;

        const icon = L.divIcon({
          className: 'public-pin',
          html: markerHtml,
          iconSize: [15, 15],
          iconAnchor: [7.5, 7.5],
        });

        const marker = L.marker([r.lat!, r.lng!], { icon });

        // Strictly anonymous popup as mandated: category, status, age, and ref code only
        const ageDays = Math.max(
          0,
          Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24))
        );
        const catName = CATEGORY_LABELS[r.category]?.[language] || r.category;

        marker.bindPopup(`
          <div style="font-family: 'Manrope', sans-serif; font-size: 12px; color: #102A43;">
            <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #102A43; font-size: 11px;">
              ${r.ref_code}
            </div>
            <div style="font-weight: 700; margin-top: 3px; font-size: 13px;">
              ${catName}
            </div>
            <div style="color: #526477; margin-top: 4px; font-size: 11px;">
              Status: <span style="text-transform: capitalize; font-weight: 600;">${r.status.replace(/_/g, ' ')}</span>
            </div>
            <div style="color: #526477; font-size: 11px;">
              Age: ${ageDays === 0 ? 'Logged today' : `${ageDays} days ago`}
            </div>
          </div>
        `);

        layerRef.current?.addLayer(marker);
      });
    } else {
      // Hotspot density circles
      validReports.forEach((r) => {
        const circle = L.circle([r.lat!, r.lng!], {
          color: '#D9A441',
          fillColor: '#D9A441',
          fillOpacity: 0.22,
          radius: 140,
          weight: 1.5,
        });

        circle.bindTooltip(`Incident: ${r.ref_code}`);
        layerRef.current?.addLayer(circle);
      });
    }

    if (validReports.length > 0 && mapRef.current) {
      const group = L.featureGroup(layerRef.current.getLayers() as (L.Marker | L.Circle)[]);
      if (group.getBounds().isValid()) {
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [reports, viewMode, language]);

  return (
    <div className="h-full w-full rounded-xs border border-[#DEDCD3] overflow-hidden relative shadow-xs">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};
