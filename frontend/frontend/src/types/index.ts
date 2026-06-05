export type Verdict = 'good' | 'warn' | 'alert';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeTone = 'good' | 'warn' | 'alert' | 'neutral';
export type StepState = 'active' | 'done' | 'idle';
export type IconButtonTone = 'light' | 'tint' | 'dark' | 'plain';
export type NavRoute = 'analysis' | 'history';

export interface NavLink {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface Analysis {
  id: string;
  crop: string;
  cropIcon: string;
  date: string;
  location: string;
  area: string;
  ndvi: number;
  coverage: number;
  vigor: string;
  verdict: Verdict;
  verdictLabel: string;
  interpretation: string;
  recommendations: string[];
}

export interface Crop {
  label: string;
  icon: string;
}
