import { mockConfirmZone, mockDismissZone, mockLeafDiagnosis } from '../../mocks/monitoring';
import type { LeafDiagnosis } from '../../types/monitoring';
import api from '../axios';
import { fromDemo, USE_DEMO } from './demo';

const CLASSIFY_LATENCY_MS = 1600;

export interface ClassifyLeafRequest {
  zoneId: string;
  photo: Blob;
}

/** Sends the leaf photo; the backend asks the AI (Gemini) with the zone's satellite context. */
export async function classifyLeaf({ zoneId, photo }: ClassifyLeafRequest): Promise<LeafDiagnosis> {
  if (USE_DEMO) return fromDemo(mockLeafDiagnosis, CLASSIFY_LATENCY_MS);
  const form = new FormData();
  form.append('photo', photo, photo instanceof File ? photo.name : 'folha.jpg');
  const { data } = await api.post<LeafDiagnosis>(`/zones/${zoneId}/photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Becomes ground truth and alerts neighbors within 15 km. */
export async function confirmZone(zoneId: string, diagnosis: string): Promise<void> {
  if (USE_DEMO) return fromDemo(() => mockConfirmZone(zoneId, diagnosis));
  await api.post(`/zones/${zoneId}/confirmation`, { diagnosis });
}

export async function dismissZone(zoneId: string): Promise<void> {
  if (USE_DEMO) return fromDemo(() => mockDismissZone(zoneId));
  await api.post(`/zones/${zoneId}/dismissal`);
}
