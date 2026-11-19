import type { BadgeTone } from '../types';
import type { RiskLevel } from '../types/monitoring';

export const RISK_META: Record<RiskLevel, { tone: BadgeTone; label: string }> = {
  high: { tone: 'alert', label: 'Risco alto' },
  moderate: { tone: 'warn', label: 'Risco moderado' },
  low: { tone: 'good', label: 'Risco baixo' },
};
