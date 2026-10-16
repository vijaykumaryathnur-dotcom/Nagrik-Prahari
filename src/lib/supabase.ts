import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mghugbjazrhochdotsna.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_W-2sxnirFmjuAqe0hY9K8Q_cs-yfu4U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Format coordinates to PostGIS EWKT Point format required by database:
 * 'SRID=4326;POINT(<lng> <lat>)' (longitude first)
 */
export function formatLocationEWKT(lng: number, lat: number): string {
  return `SRID=4326;POINT(${lng.toFixed(7)} ${lat.toFixed(7)})`;
}

/**
 * Parse PostGIS EWKT Point format 'SRID=4326;POINT(lng lat)' into [lat, lng]
 */
export function parseLocationEWKT(locationStr: string | null): [number, number] | null {
  if (!locationStr) return null;
  const match = locationStr.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
  }
  return null;
}

/**
 * Create a signed URL for a file in the private 'report-media' bucket.
 * Bucket path: <auth user id>/<report id>/<filename>
 */
export async function getSignedMediaUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
  if (!storagePath) return null;
  // If already a full http URL (e.g., fallback), return as is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  try {
    const { data, error } = await supabase.storage
      .from('report-media')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn('Failed to generate signed url for:', storagePath, error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.warn('Exception generating signed url:', err);
    return null;
  }
}
