import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../../components/Badge';
import { Card } from '../../../../components/Card';
import { RISK_META } from '../../../../constants/risk';
import type { DiseaseRisk, RiskLevel } from '../../../../types/monitoring';

const ICON: Record<RiskLevel, typeof AlertOctagon> = {
  high: AlertOctagon,
  moderate: AlertTriangle,
  low: ShieldCheck,
};

export function DiseaseRiskCard({ risks }: { risks: DiseaseRisk[] }) {
  const hasHigh = risks.some((r) => r.level === 'high');

  return (
    <Card padding={24} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="gh-eyebrow">Risco climático</span>
        <h2 className="text-lg font-semibold text-heading">Doenças favorecidas pelo tempo</h2>
      </div>

      <ul className="flex flex-col gap-4">
        {risks.map((risk) => {
          const meta = RISK_META[risk.level];
          const Icon = ICON[risk.level];
          return (
            <li key={risk.disease} className="flex flex-col gap-2 rounded-md bg-page p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-base font-semibold text-heading">{risk.disease}</span>
                <Badge tone={meta.tone} icon={<Icon size={14} />}>
                  {meta.label}
                </Badge>
              </div>
              <ul className="flex flex-col gap-1">
                {risk.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-sm text-body">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-subtle" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      {hasHigh && (
        <p className="rounded-md bg-warn-bg p-4 text-sm leading-snug text-heading">
          Reforce a vistoria nas folhas de baixo durante a semana. Converse com seu técnico antes de qualquer aplicação.
        </p>
      )}
    </Card>
  );
}

export default DiseaseRiskCard;
