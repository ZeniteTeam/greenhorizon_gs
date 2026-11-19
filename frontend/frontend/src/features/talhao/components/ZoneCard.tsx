import { CalendarCheck, CalendarPlus, Camera, CheckCircle2, MapPin, Users, XCircle } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { PERIOD_LABEL } from '../../../constants/visits';
import type { StressZone, TechnicianVisit } from '../../../types/monitoring';
import { formatDayMonth, formatNumber, formatSigned } from '../../../utils/format';

interface ZoneCardProps {
  zone: StressZone;
  visit?: TechnicianVisit;
  onScout: () => void;
  onCommunity: () => void;
  onRequestVisit: () => void;
}

export function ZoneCard({ zone, visit, onScout, onCommunity, onRequestVisit }: ZoneCardProps) {
  return (
    <Card padding={24} className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="gh-eyebrow">Zona detectada em {formatDayMonth(zone.detectedAt)}</span>
          <h2 className="text-lg font-semibold text-heading">{formatNumber(zone.areaHa, 1)} ha perdendo vigor</h2>
        </div>
        {zone.status === 'confirmed' && <Badge tone="alert" icon={<CheckCircle2 size={14} />}>Confirmado</Badge>}
        {zone.status === 'dismissed' && <Badge tone="neutral" icon={<XCircle size={14} />}>Descartado</Badge>}
        {zone.status === 'awaiting-photo' && <Badge tone="warn">Aguardando foto</Badge>}
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-body">Queda na zona</dt>
          <dd className="text-2xl font-bold text-heading">{formatSigned(zone.vigorDropPct)}%</dd>
          <dd className="text-xs text-subtle">em {zone.windowDays} dias</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-body">Média do talhão</dt>
          <dd className="text-2xl font-bold text-heading">{formatSigned(zone.fieldDropPct, 1)}%</dd>
          <dd className="text-xs text-subtle">no mesmo período</dd>
        </div>
      </dl>

      {zone.status === 'awaiting-photo' && (
        <>
          <div className="flex gap-3 rounded-md bg-zone-bg p-4">
            <MapPin size={20} className="mt-0.5 flex-shrink-0 text-zone" aria-hidden="true" />
            <p className="text-sm leading-snug text-heading">
              Vá até o ponto marcado no mapa, <b>{zone.scoutHint}</b>, e fotografe uma folha do terço de baixo da planta.
            </p>
          </div>
          <Button fullWidth size="md" iconLeft={<Camera size={18} />} onClick={onScout}>
            Confirmar em campo
          </Button>
        </>
      )}

      {zone.status === 'confirmed' && (
        <>
          <p className="text-sm leading-snug text-body">
            <b className="text-heading">{zone.diagnosis}</b> confirmada por foto. Os produtores vizinhos foram avisados.
          </p>
          <Button variant="secondary" fullWidth iconLeft={<Users size={18} />} onClick={onCommunity}>
            Ver focos na região
          </Button>
        </>
      )}

      {zone.status === 'dismissed' && (
        <p className="text-sm leading-snug text-body">Você marcou esta zona como alarme falso.</p>
      )}

      {zone.status !== 'dismissed' &&
        (visit ? (
          <div className="flex gap-3 rounded-md bg-tint p-4">
            <CalendarCheck size={20} className="mt-0.5 flex-shrink-0 text-brand" aria-hidden="true" />
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-heading">
                Visita técnica em {formatDayMonth(visit.date)}, de {PERIOD_LABEL[visit.period]}
              </span>
              <span className="text-body">
                {visit.technician} · {visit.phone}
              </span>
            </div>
          </div>
        ) : (
          <Button variant="ghost" fullWidth iconLeft={<CalendarPlus size={18} />} onClick={onRequestVisit}>
            Pedir visita técnica
          </Button>
        ))}
    </Card>
  );
}

export default ZoneCard;
