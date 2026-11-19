import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AlertPreferences {
  radiusKm: number;
  push: boolean;
  whatsapp: boolean;
  sms: boolean;
  whatsappNumber: string;
  autoPlayAudio: boolean;
  technicianName: string;
  technicianPhone: string;
}

export const DEFAULT_PREFERENCES: AlertPreferences = {
  radiusKm: 15,
  push: true,
  whatsapp: true,
  sms: false,
  whatsappNumber: '',
  autoPlayAudio: false,
  technicianName: 'Carla Menezes',
  technicianPhone: '(66) 3000-0142',
};

interface PreferencesState {
  preferences: AlertPreferences;
  save: (preferences: AlertPreferences) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      save: (preferences) => set({ preferences }),
    }),
    { name: 'alert-preferences' },
  ),
);
