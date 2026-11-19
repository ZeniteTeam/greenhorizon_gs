import { mockCommunity } from '../../mocks/monitoring';
import type { CommunityOverview } from '../../types/monitoring';
import api from '../axios';
import { fromDemo, USE_DEMO } from './demo';

const DEFAULT_RADIUS_KM = 15;

export async function getCommunityOverview(radiusKm = DEFAULT_RADIUS_KM): Promise<CommunityOverview> {
  if (USE_DEMO) return fromDemo(mockCommunity);
  const { data } = await api.get<CommunityOverview>('/community/overview', { params: { radiusKm } });
  return data;
}
