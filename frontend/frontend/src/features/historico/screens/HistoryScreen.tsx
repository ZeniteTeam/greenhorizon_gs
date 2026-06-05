import { Card } from '../../../components/Card';
import { HistoryRow } from '../components/HistoryRow';
import { GH_ANALYSES } from '../../../constants/analyses';
import type { Analysis } from '../../../types';

interface HistoryScreenProps {
  onOpen: (a: Analysis) => void;
}

export function HistoryScreen({ onOpen }: HistoryScreenProps) {
  const items = GH_ANALYSES;

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <span className="gh-eyebrow" style={{ color: 'var(--text-brand)' }}>
          Suas análises
        </span>
        <h1
          className="mt-2"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 36,
            color: 'var(--green-900)',
            letterSpacing: 'var(--ls-tight)',
          }}
        >
          Histórico de análises
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 16,
            lineHeight: 'var(--lh-snug)',
            color: 'var(--text-body)',
          }}
        >
          {items.length} análises salvas. Toque em uma linha para ver o diagnóstico completo.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="flex gap-4 flex-wrap">
        <Card padding={18} style={{ flex: 1, minWidth: 180 }}>
          <span className="gh-eyebrow">Análises</span>
          <div
            className="mt-1.5"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 32,
              color: 'var(--text-heading)',
            }}
          >
            {items.length}
          </div>
        </Card>
        <Card padding={18} style={{ flex: 1, minWidth: 180 }}>
          <span className="gh-eyebrow">Área monitorada</span>
          <div
            className="mt-1.5"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 32,
              color: 'var(--text-brand)',
            }}
          >
            322 ha
          </div>
        </Card>
        <Card padding={18} style={{ flex: 1, minWidth: 180 }}>
          <span className="gh-eyebrow">NDVI médio</span>
          <div
            className="mt-1.5"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 32,
              color: 'var(--text-brand)',
            }}
          >
            0,64
          </div>
        </Card>
      </div>

      {/* History list */}
      <div className="flex flex-col gap-3">
        {items.map((a) => (
          <HistoryRow key={a.id} analysis={a} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default HistoryScreen;
