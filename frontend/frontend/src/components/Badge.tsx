import type { ReactNode } from 'react';
import type { BadgeTone } from '../types';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  solid?: boolean;
}

const map: Record<BadgeTone, { bg: string; fg: string }> = {
  good:    { bg: 'var(--status-good-bg)',  fg: 'var(--status-good)' },
  warn:    { bg: 'var(--status-warn-bg)',  fg: 'var(--status-warn)' },
  alert:   { bg: 'var(--status-alert-bg)', fg: 'var(--status-alert)' },
  neutral: { bg: 'var(--gray-200)',         fg: 'var(--gray-700)' },
};

export function Badge({ children, tone = 'good', icon, solid = false }: BadgeProps) {
  const t = map[tone] ?? map.good;
  const bg = solid ? t.fg : t.bg;
  const fg = solid ? 'var(--white)' : t.fg;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{
        padding: '5px 12px',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color: fg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-semibold)',
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {icon && <span className="flex">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
