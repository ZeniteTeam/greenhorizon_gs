import { mockFieldDetail, mockFields } from '../../mocks/monitoring';
import type { FieldDetail, FieldSummary, MapLayer } from '../../types/monitoring';
import api from '../axios';
import { fromDemo, USE_DEMO } from './demo';

export async function getFields(): Promise<FieldSummary[]> {
  if (USE_DEMO) return fromDemo(mockFields);
  const { data } = await api.get<FieldSummary[]>('/fields');
  return data;
}

/** Season series, expected curve, rain and stress zones. */
export async function getFieldDetail(id: string): Promise<FieldDetail> {
  if (USE_DEMO) return fromDemo(() => mockFieldDetail(id));
  const { data } = await api.get<FieldDetail>(`/fields/${id}`);
  return data;
}

export interface FieldTileRequest {
  fieldId: string;
  date: string;
  layer: MapLayer;
  /** Required for the 'change' layer: the pass to compare with. */
  previousDate?: string;
}

/** Earth Engine tile URL for one pass and layer (URLs expire after a few hours). */
export async function getFieldTile({ fieldId, ...params }: FieldTileRequest): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/fields/${fieldId}/tiles`, { params });
  return data.url;
}
