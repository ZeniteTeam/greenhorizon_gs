import { Microscope } from 'lucide-react';
import type { LeafDiagnosis } from '../../../types/monitoring';
import { formatPercent } from '../../../utils/format';

export function DiagnosisResult({ diagnosis }: { diagnosis: LeafDiagnosis }) {
  const pct = diagnosis.confidence * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-zone-bg text-zone">
          <Microscope size={20} aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-body">Provável causa</span>
          <span className="text-2xl font-bold text-heading">{diagnosis.label}</span>
          <span className="text-sm italic text-subtle">{diagnosis.scientificName}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-body">Confiança do modelo</span>
          <span className="text-lg font-bold text-heading">{formatPercent(pct)}</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-hairline"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Confiança do modelo"
        >
          <div className="h-full rounded-full bg-heading" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-body">Outras possibilidades</span>
        <ul className="flex flex-wrap gap-2">
          {diagnosis.alternatives.map((alt) => (
            <li key={alt.label} className="rounded-full bg-page px-3 py-1 text-xs text-heading">
              {alt.label} · <span className="tabular-nums">{formatPercent(alt.confidence * 100)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-subtle">{diagnosis.model}, cruzado com a zona detectada pelo satélite.</p>
    </div>
  );
}

export default DiagnosisResult;
