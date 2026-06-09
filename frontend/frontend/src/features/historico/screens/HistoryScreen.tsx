import { useEffect } from 'react';
import { Card } from '../../../components/Card';
import { HistoryRow } from '../components/HistoryRow';
import { GH_ANALYSES } from '../../../constants/analyses';
import { GH_CROPS } from '../../../constants/crops';
import type { Analysis, Verdict } from '../../../types';
import { useGetAnalysis } from '../hooks/getAnalysisByUserHook';
import type { AnalysisResponse } from '../../../api/analysis/get-analysis-by-user-email';

interface HistoryScreenProps {
  onOpen: (a: Analysis) => void;
}

function mapToAnalysis(a: AnalysisResponse): Analysis {
  const cropIcon =
    GH_CROPS.find((c) => c.label.toLowerCase() === a.tipo?.toLowerCase())?.icon ??
    GH_CROPS[0].icon;

  let verdict: Verdict;
  let vigor: string;
  let verdictLabel: string;
  if (a.ndviMedia >= 0.6) {
    verdict = 'good'; vigor = 'Saudável'; verdictLabel = 'Saudável';
  } else if (a.ndviMedia >= 0.4) {
    verdict = 'warn'; vigor = 'Moderado'; verdictLabel = 'Moderado';
  } else {
    verdict = 'alert'; vigor = 'Crítico'; verdictLabel = 'Crítico';
  }

  return {
    id: String(a.id),
    crop: a.tipo,
    cropIcon,
    date: a.date,
    location: a.safra,
    area: `${a.areaTotalPercentual} ha`,
    ndvi: a.ndviMedia,
    coverage: a.coberturaVegetal,
    vigor,
    verdict,
    verdictLabel,
    interpretation: a.interpretacao,
    recommendations: a.recomendacao,
    ndviMedia: a.ndviMedia,
    areaTotalPercentual: a.areaTotalPercentual,
    coberturaVegetal: a.coberturaVegetal,
    status: a.status,
    clima: a.clima,
    temporada: a.temporada,
  };
}

export function HistoryScreen({ onOpen }: HistoryScreenProps) {
  const items = GH_ANALYSES;

  const { getAnalysis, analises, loading, error } = useGetAnalysis();

  useEffect(() => {
    getAnalysis();
  }, []);

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
          ({items.length + analises.length}) análises salvas. Toque em uma linha para ver o diagnóstico completo.
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
            {items.length + analises.length}
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
            {322 + analises.reduce((sum, a) => sum + a.areaTotalPercentual, 0)} ha
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
            {analises.length > 0 ? (analises.reduce((sum, a) => sum + a.ndviMedia, 0) / analises.length).toFixed(2) : '0,00'}
          </div>
        </Card>
      </div>

      {/* History list */}
      <div className="flex flex-col gap-3">
        {analises.map((a) => (
          <HistoryRow key={a.id} analysis={mapToAnalysis(a)} onOpen={onOpen} />
        ))}

        {items.map((a) => (
          <HistoryRow key={a.id} analysis={a} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default HistoryScreen;

