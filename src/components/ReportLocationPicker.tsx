import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { Button } from './ui/Button';

// Fix default Leaflet icon paths in bundler
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressLookup?: (address: string) => void;
}

export const ReportLocationPicker: React.FC<LocationPickerProps> = ({
  lat,
  lng,
  onChange,
  onAddressLookup,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = lat || 17.385;
    const initialLng = lng || 78.4867;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange(pos.lat, pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      try {
        map.stop();
        map.remove();
      } catch {
        // safely ignore
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync external coords
  useEffect(() => {
    if (markerRef.current && mapRef.current && lat && lng) {
      try {
        const cur = markerRef.current.getLatLng();
        if (Math.abs(cur.lat - lat) > 0.0001 || Math.abs(cur.lng - lng) > 0.0001) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.panTo([lat, lng], { animate: true });
        }
      } catch {
        // safely ignore
      }
    }
  }, [lat, lng]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'NagrikPrahariCivicApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name && onAddressLookup) {
          onAddressLookup(data.display_name);
        }
      }
    } catch {
      // Graceful fallback: user enters manually
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNote(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        setLocationNote(
          err.code === 1
            ? 'Location access denied. Please click or drag the pin on the map.'
            : 'Unable to determine GPS location. Please place the pin manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#9AA69C]">
          <MapPin className="w-3.5 h-3.5 text-[#B8F36B]" />
          <span className="font-mono tabular-nums text-[#F2F0E8]">
            {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleUseMyLocation}
          isLoading={isLocating}
          className="gap-1.5 text-xs"
        >
          <Navigation className="w-3.5 h-3.5 text-[#B8F36B]" />
          <span>Use my GPS location</span>
        </Button>
      </div>

      {locationNote && (
        <p className="text-xs text-[#FCA5A5] bg-[#291414] p-2.5 rounded-xs border border-[#521E1E]">
          {locationNote}
        </p>
      )}

      <div
        ref={mapContainerRef}
        className="h-64 sm:h-72 w-full rounded-xs border border-[#223128] z-10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] invert-tiles"
        tabIndex={0}
        aria-label="Interactive map for hazard location"
      />
      <p className="text-[11px] text-[#9AA69C]">
        Click or drag the marker to pinpoint the exact municipal coordinates on the city grid.
      </p>
    </div>
  );
};
