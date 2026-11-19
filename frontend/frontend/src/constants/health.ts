import type { BadgeTone } from '../types';
import type { FieldHealth } from '../types/monitoring';

export const HEALTH_META: Record<FieldHealth, { tone: BadgeTone; label: string }> = {
  'on-track': { tone: 'good', label: 'Dentro do esperado' },
  attention: { tone: 'warn', label: 'Abaixo da curva' },
  stress: { tone: 'alert', label: 'Zona sob estresse' },
};

export const CROP_ICONS: Record<string, string> = {
  Soja: '/imagery/crop-soy.png',
  Milho: '/imagery/crop-corn.png',
  Arroz: '/imagery/crop-rice.png',
};
