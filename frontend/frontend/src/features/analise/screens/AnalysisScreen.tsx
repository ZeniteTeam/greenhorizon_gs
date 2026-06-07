import { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Button } from '../../../components/Button';
import { InputPanel } from '../components/InputPanel';
import { MapHero } from '../components/MapHero';
import { ResultDashboard } from '../components/ResultDashboard';
import { GH_ANALYSES } from '../../../constants/analyses';
import { useCreateAnalysis } from '../hooks/createAnalysisHook';

interface AnalysisScreenProps {
  onSaved: () => void;
}

export function AnalysisScreen({ onSaved }: AnalysisScreenProps) {
  const [crop, setCrop] = useState('Soja');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const result = GH_ANALYSES[0];

  const [points, setPoints] = useState([]); 

  const {createAnalysis, analise, loading, error} = useCreateAnalysis();

  function handleAnalyze() {
    setAnalyzed(false);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1500);
  }

  function handleSave() {
    createAnalysis(points);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Heading */}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="gh-eyebrow" style={{ color: 'var(--text-brand)' }}>
            Análise por satélite
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
            Conheça o vigor da sua lavoura
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-regular)',
              fontSize: 16,
              lineHeight: 'var(--lh-snug)',
              color: 'var(--text-body)',
              maxWidth: 620,
              marginTop: 10,
            }}
          >
            Desenhe sua área no mapa e receba um diagnóstico NDVI com interpretação e
            recomendações, em segundos.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" iconLeft={<Download size={18} />}>
            Exportar PDF
          </Button>
          <Button
            variant="primary"
            iconLeft={<Save size={18} />}
            onClick={onSaved}
          >
            Salvar no histórico
          </Button>
        </div>
      </div>

      {/* Map row */}
      <div className="flex gap-5 items-stretch">
        <div style={{ flex: '0 0 360px', display: 'flex' }}>
          <InputPanel
            onSave={handleSave}
            crop={crop}
            setCrop={setCrop}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
          />
        </div>
        <div className="flex-1 min-w-0 flex">
          <MapHero 
            handleChangePoints={setPoints}
            analyzed={analyzed} 
            analyzing={analyzing}
             minHeight={460} />
        </div>
      </div>

      {/* Results */}
      {analyzed && (
        <div className="gh-reveal">
          <ResultDashboard analysis={result} />
        </div>
      )}
    </div>
  );
}

export default AnalysisScreen;
