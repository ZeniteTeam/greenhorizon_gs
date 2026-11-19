import { Ban, Link2, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../../components/Card';
import type { EvidenceTone, Hypothesis } from '../../../types/monitoring';

const TONE_META: Record<EvidenceTone, { icon: LucideIcon; chip: string; chipClass: string; iconClass: string }> = {
  signal: { icon: TrendingDown, chip: 'Sinal', chipClass: 'bg-zone-bg text-zone', iconClass: 'bg-zone-bg text-zone' },
  'rules-out': { icon: Ban, chip: 'Descarta', chipClass: 'bg-hairline text-heading', iconClass: 'bg-hairline text-heading' },
  supports: { icon: Link2, chip: 'Reforça', chipClass: 'bg-warn-bg text-warn', iconClass: 'bg-warn-bg text-warn' },
};

export function EvidencePanel({ hypothesis }: { hypothesis: Hypothesis }) {
  return (
    <Card padding={24} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="gh-eyebrow">Raciocínio do diagnóstico</span>
        <h2 className="text-lg font-semibold text-heading">Por que suspeitamos de praga ou doença</h2>
      </div>

      <ul className="flex flex-col gap-4">
        {hypothesis.evidence.map((item) => {
          const meta = TONE_META[item.tone];
          const Icon = meta.icon;
          return (
            <li key={item.id} className="flex gap-3">
              <span className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full ${meta.iconClass}`}>
                <Icon size={15} aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-body">{item.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.chipClass}`}>{meta.chip}</span>
                </div>
                <span className="text-base font-semibold text-heading">{item.value}</span>
                <span className="text-sm leading-snug text-body">{item.reading}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="rounded-md bg-tint p-4 text-sm leading-relaxed text-section">
        <b>Conclusão: {hypothesis.label.toLowerCase()}.</b> Confirme com uma foto da folha no ponto marcado.
      </div>
    </Card>
  );
}

export default EvidencePanel;
