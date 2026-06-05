import { ThumbsUp, AlertTriangle, AlertOctagon, Leaf, Maximize, Sprout, TrendingUp, Microscope, ClipboardList } from 'lucide-react';
import { Card } from '../../../components/Card';
import { MetricCard } from '../../../components/MetricCard';
import { NdviScale } from '../../../components/NdviScale';
import { Badge } from '../../../components/Badge';
import { RecommendationList } from '../../../components/RecommendationList';
import type { Analysis } from '../../../types';

interface ResultDashboardProps {
  analysis: Analysis;
  compact?: boolean;
}

function fmtNdvi(v: number) {
  return v.toFixed(2).replace('.', ',');
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === 'good') return <ThumbsUp size={15} />;
  if (verdict === 'warn') return <AlertTriangle size={15} />;
  return <AlertOctagon size={15} />;
}

export function ResultDashboard({ analysis: a, compact = false }: ResultDashboardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-semibold)',
              fontSize: 24,
              color: 'var(--text-heading)',
            }}
          >
            Resultado da Análise
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-regular)',
              fontSize: 'var(--fs-body)',
              lineHeight: 'var(--lh-snug)',
              color: 'var(--text-muted)',
            }}
          >
            Índice de vegetação (NDVI)
          </span>
        </div>
        <Badge
          tone={a.verdict}
          solid={false}
          icon={<VerdictIcon verdict={a.verdict} />}
        >
          {a.verdictLabel}
        </Badge>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="NDVI MÉDIO"
          value={fmtNdvi(a.ndvi)}
          caption="Faixa ideal: 0,60–0,80"
          icon={<Leaf size={22} />}
        />
        <MetricCard
          label="ÁREA ANALISADA"
          value={a.area}
          caption="Polígono selecionado"
          emphasis="neutral"
          icon={<Maximize size={22} />}
        />
        <MetricCard
          label="COBERTURA VEGETAL"
          value={`${a.coverage}%`}
          caption="Boa cobertura"
          icon={<Sprout size={22} />}
        />
        <MetricCard
          label="VIGOR DA CULTURA"
          value={a.vigor}
          caption={a.verdictLabel}
          icon={<TrendingUp size={22} />}
        />
      </div>

      {/* NDVI scale */}
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <span className="gh-eyebrow">Escala NDVI</span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-regular)',
              fontSize: 'var(--fs-body)',
              lineHeight: 'var(--lh-snug)',
              color: 'var(--text-body)',
            }}
          >
            Medido:{' '}
            <b style={{ color: 'var(--text-brand)' }}>{fmtNdvi(a.ndvi)}</b>
          </span>
        </div>
        <NdviScale value={a.ndvi} ideal={[0.6, 0.8]} />
      </Card>

      {/* Interpretation + Recommendations */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: compact ? '1fr' : '1fr 1.2fr' }}
      >
        <Card>
          <RecommendationList
            title="Interpretação"
            icon={<Microscope size={22} />}
            items={[a.interpretation]}
          />
        </Card>
        <Card tint style={{ padding: 24 }}>
          <RecommendationList
            title="Recomendações"
            icon={<ClipboardList size={22} />}
            items={a.recommendations}
          />
        </Card>
      </div>
    </div>
  );
}

export default ResultDashboard;
