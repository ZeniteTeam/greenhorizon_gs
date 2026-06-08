import type { ReactNode } from 'react';
import { Search, MousePointer2, ShieldCheck, ScanLine } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { StepBadge } from '../../../components/StepBadge';
import { CropCard } from '../../../components/CropCard';
import { GH_CROPS } from '../../../constants/crops';

interface StepRowProps {
  n: number;
  state: 'active' | 'done' | 'idle';
  title: string;
  children: ReactNode;
}

function StepRow({ n, state, title, children }: StepRowProps) {
  return (
    <div className="flex gap-3.5">
      <StepBadge n={n} state={state} />
      <div className="flex-1 min-w-0" style={{ paddingTop: 2 }}>
        <h4
          className="mb-3"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: 16,
            color: 'var(--text-heading)',
          }}
        >
          {title}
        </h4>
        {children}
      </div>
    </div>
  );
}

interface InputPanelProps {
  onSave: () => void;
  crop: string;
  setCrop: (crop: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
}

export function InputPanel({ onSave, crop, setCrop, onAnalyze, analyzing }: InputPanelProps) {
  return (
    <Card
      padding={24}
      style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 22 }}
    >
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 22,
            color: 'var(--green-900)',
          }}
        >
          Analisar lavoura
        </h3>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-body)',
            lineHeight: 'var(--lh-snug)',
            color: 'var(--text-body)',
          }}
        >
          Três passos para o diagnóstico por satélite.
        </p>
      </div>

      <StepRow n={1} state="done" title="Localize sua área">
        <Input icon={<Search size={18} />} placeholder="Buscar no Google Maps" />
        <div
          className="flex gap-3 mt-3"
          style={{
            padding: 14,
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-tint)',
            boxShadow: 'var(--hairline-tint)',
          }}
        >
          <MousePointer2 size={22} color="var(--green-700)" className="flex-shrink-0" />
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              lineHeight: 1.35,
              color: 'var(--text-on-tint)',
            }}
          >
            Clique no mapa para traçar os pontos ao redor da sua área. Finalize clicando no primeiro ponto.
          </p>
        </div>
      </StepRow>

      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

      <StepRow n={2} state="active" title="Selecione a cultura">
        <div className="flex gap-3">
          {GH_CROPS.map((c) => (
            <CropCard
              key={c.label}
              label={c.label}
              icon={c.icon}
              selected={crop === c.label}
              onClick={() => setCrop(c.label)}
            />
          ))}
        </div>
      </StepRow>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!crop || analyzing}
        onClick={onSave}
        iconLeft={analyzing ? undefined : <ScanLine size={22} />}
      >
        {analyzing ? 'Analisando…' : 'Analisar área'}
      </Button>

      <div
        className="flex items-center gap-2.5"
        style={{ color: 'var(--text-brand)' }}
      >
        <ShieldCheck size={18} />
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-semibold)',
            fontSize: 13,
          }}
        >
          Seus dados estão seguros
        </span>
      </div>
    </Card>
  );
}

export default InputPanel;
