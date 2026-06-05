import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  caption?: string;
  icon?: ReactNode;
  emphasis?: 'green' | 'neutral';
}

export function MetricCard({ label, value, caption, icon, emphasis = 'green' }: MetricCardProps) {
  return (
    <div
      className="flex flex-col gap-2.5 min-w-0"
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '20px 24px',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="gh-eyebrow"
          style={{ color: emphasis === 'green' ? 'var(--text-section)' : 'var(--text-body)' }}
        >
          {label}
        </span>
        {icon && (
          <span className="flex flex-shrink-0" style={{ color: 'var(--green-900)' }}>
            {icon}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 36,
          lineHeight: 1,
          color: emphasis === 'green' ? 'var(--text-brand)' : 'var(--text-heading)',
        }}
      >
        {value}
      </span>
      {caption && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-body)',
            lineHeight: 'var(--lh-snug)',
            color: 'var(--text-body)',
          }}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

export default MetricCard;
