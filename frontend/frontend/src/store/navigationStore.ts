import { create } from 'zustand';
import type { NavRoute } from '../types';

interface RouteParams {
  fieldId?: string;
  zoneId?: string;
}

interface NavigationState extends RouteParams {
  route: NavRoute;
  navigate: (route: NavRoute, params?: RouteParams) => void;
}

export const useNavigation = create<NavigationState>()((set) => ({
  route: 'login',
  navigate: (route, params = {}) => {
    set({ route, fieldId: params.fieldId, zoneId: params.zoneId });
    window.scrollTo({ top: 0 });
  },
}));
