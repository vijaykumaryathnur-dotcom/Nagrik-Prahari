import { supabase, formatLocationEWKT } from './supabase';
import { HazardCategory, SeverityLevel } from '../types/database';

export interface OfflineDraft {
  localId: string;
  category: HazardCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: { name: string; type: string; base64: string }[];
  createdAt: string;
  status: 'waiting_to_send' | 'syncing' | 'failed';
  error?: string;
}

const STORAGE_KEY = 'nagrik_offline_drafts';

export function getOfflineDrafts(): OfflineDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline drafts:', err);
    return [];
  }
}

export function saveOfflineDraft(draft: Omit<OfflineDraft, 'localId' | 'createdAt' | 'status'>): OfflineDraft {
  const drafts = getOfflineDrafts();
  const newDraft: OfflineDraft = {
    ...draft,
    localId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'waiting_to_send',
  };
  drafts.unshift(newDraft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  return newDraft;
}

export function removeOfflineDraft(localId: string) {
  const drafts = getOfflineDrafts().filter((d) => d.localId !== localId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function updateOfflineDraftStatus(localId: string, status: OfflineDraft['status'], error?: string) {
  const drafts = getOfflineDrafts().map((d) =>
    d.localId === localId ? { ...d, status, error } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

// Convert base64 data to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export async function syncSingleDraft(draft: OfflineDraft, userId: string): Promise<{ success: boolean; refCode?: string; error?: string }> {
  try {
    updateOfflineDraftStatus(draft.localId, 'syncing');

    // 1. Insert report
    const locationEWKT = formatLocationEWKT(draft.lng, draft.lat);
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        reporter_id: userId,
        category: draft.category,
        severity: draft.severity,
        title: draft.title,
        description: draft.description || null,
        location: locationEWKT,
        address: draft.address || null,
        status: 'submitted',
      })
      .select('id, ref_code')
      .single();

    if (reportError || !reportData) {
      throw new Error(reportError?.message || 'Failed to insert report on ledger.');
    }

    const reportId = reportData.id;
    const refCode = reportData.ref_code;

    // 2. Upload photos if any
    for (let i = 0; i < draft.photos.length; i++) {
      const p = draft.photos[i];
      const blob = base64ToBlob(p.base64, p.type);
      const ext = p.name.split('.').pop() || 'jpg';
      const filename = `evidence_${Date.now()}_${i}.${ext}`;
      const storagePath = `${userId}/${reportId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('report-media')
        .upload(storagePath, blob, { contentType: p.type });

      if (!uploadError) {
        await supabase.from('report-media').insert({
          report_id: reportId,
          storage_path: storagePath,
          kind: 'evidence',
          caption: 'Citizen report evidence photo',
          uploaded_by: userId,
        });
      }
    }

    // Success: remove draft
    removeOfflineDraft(draft.localId);
    return { success: true, refCode };
  } catch (err: any) {
    console.error('Failed to sync offline draft:', err);
    updateOfflineDraftStatus(draft.localId, 'failed', err.message || 'Network sync failed');
    return { success: false, error: err.message };
  }
}
