export type Verdict = 'good' | 'warn' | 'alert';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeTone = 'good' | 'warn' | 'alert' | 'neutral';
export type StepState = 'active' | 'done' | 'idle';
export type IconButtonTone = 'light' | 'tint' | 'dark' | 'plain';
export type NavRoute = 'analysis' | 'history' | 'login';

export interface NavLink {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface RecomedacaoDto {
  id: number;
  descricao: string;
}

export interface InterpretacaoDto {
  id: number;
  descricao: string;
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
  interpretation: InterpretacaoDto[];
  recommendations: RecomedacaoDto[];
  ndviMedia?: number;
  areaTotalPercentual?: number;
  coberturaVegetal?: number;
  status?: string;
  clima?: string;
  temporada?: string;
}

export interface Crop {
  label: string;
  icon: string;
}
