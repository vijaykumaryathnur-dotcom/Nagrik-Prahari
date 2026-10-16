import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface StaticReportMapProps {
  lat: number;
  lng: number;
  label?: string;
}

export const StaticReportMap: React.FC<StaticReportMapProps> = ({ lat, lng, label }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (label) {
      marker.bindPopup(label);
    }

    mapRef.current = map;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore
      }
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={mapContainerRef}
      className="h-44 w-full rounded-xs border border-[#223128] z-0 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] invert-tiles"
      aria-label="Location map"
    />
  );
};
