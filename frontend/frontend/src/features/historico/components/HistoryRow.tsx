import { ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import type { Analysis } from '../../../types';
import { formatDate } from '../../../util/formateDate';

interface HistoryRowProps {
  analysis: Analysis;
  onOpen: (a: Analysis) => void;
}

export function HistoryRow({ analysis: a, onOpen }: HistoryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(a)}
      className="gh-historyrow w-full text-left grid items-center"
      style={{
        gridTemplateColumns: '52px 1.6fr 1fr 1fr 150px 28px',
        gap: 18,
        padding: '16px 20px',
        border: 'none',
        cursor: 'pointer',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      }}
    >
      {/* Crop icon */}
      <span
        className="flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: 'var(--surface-tint)',
        }}
      >
        <img src={a.cropIcon} alt="" width={32} height={32} className="object-contain" />
      </span>

      {/* Crop + location */}
      <span>
        <span
          className="block"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: 16,
            color: 'var(--text-heading)',
          }}
        >
          {a.crop}
        </span>
        <span
          className="block mt-0.5"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 13,
            lineHeight: 'var(--lh-snug)',
            color: 'var(--text-body)',
          }}
        >
          {a.location}
        </span>
      </span>

      {/* Date */}
      <span>
        <span className="gh-eyebrow block" style={{ fontSize: 10 }}>Data</span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-medium)',
            fontSize: 14,
            color: 'var(--text-heading)',
          }}
        >
          {formatDate(a.date)}
        </span>
      </span>

      {/* Area */}
      <span>
        <span className="gh-eyebrow block" style={{ fontSize: 10 }}>Área</span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-medium)',
            fontSize: 14,
            color: 'var(--text-heading)',
          }}
        >
          {a.area}
        </span>
      </span>

      {/* NDVI + badge */}
      <span className="flex flex-col gap-1.5">
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body)' }}>
          NDVI{' '}
          <b style={{ color: 'var(--text-brand)' }}>
            {a.ndvi.toFixed(2).replace('.', ',')}
          </b>
        </span>
        <Badge tone={a.verdict}>{a.vigor}</Badge>
      </span>

      <ChevronRight size={22} color="var(--text-muted)" />
    </button>
  );
}

export default HistoryRow;
