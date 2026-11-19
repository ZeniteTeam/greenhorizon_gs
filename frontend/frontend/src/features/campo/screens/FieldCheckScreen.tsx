import { useState } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { Button } from '../../../components/Button';
import { QueryState } from '../../../components/QueryState';
import { useNavigation } from '../../../store/navigationStore';
import type { FieldDetail, StressZone } from '../../../types/monitoring';
import { apiErrorMessage } from '../../../utils/apiError';
import { formatNumber, formatPercent } from '../../../utils/format';
import { useFieldDetail } from '../../talhao/hooks/useFieldDetail';
import { ConfirmationDone } from '../components/ConfirmationDone';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { LeafCapture } from '../components/LeafCapture';
import { PlainExplanationCard } from '../components/PlainExplanationCard';
import { ScoutMap } from '../components/ScoutMap';
import { ScoutStep } from '../components/ScoutStep';
import { useClassifyLeaf, useZoneDecision } from '../hooks/useLeafDiagnosis';

type Stage = 'navigate' | 'capture' | 'result';

export function FieldCheckScreen() {
  const fieldId = useNavigation((s) => s.fieldId);
  const zoneId = useNavigation((s) => s.zoneId);
  const navigate = useNavigation((s) => s.navigate);
  const { data, isLoading, error, refetch } = useFieldDetail(fieldId);
  const zone = data?.zones.find((z) => z.id === zoneId) ?? data?.zones[0];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <button
        type="button"
        onClick={() => navigate('field', { fieldId })}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-brand"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar ao talhão
      </button>

      <QueryState loading={isLoading} error={error} onRetry={() => refetch()} />
      {data && zone && <FieldCheckFlow detail={data} zone={zone} />}
    </div>
  );
}

function FieldCheckFlow({ detail, zone }: { detail: FieldDetail; zone: StressZone }) {
  const navigate = useNavigation((s) => s.navigate);
  const [stage, setStage] = useState<Stage>('navigate');
  const classify = useClassifyLeaf();
  const { confirm, dismiss } = useZoneDecision();
  const diagnosis = classify.data;
  const [lat, lng] = zone.scoutPoint;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  const backToField = () => navigate('field', { fieldId: detail.id });

  if (zone.status === 'confirmed') {
    return (
      <ConfirmationDone
        diagnosis={zone.diagnosis ?? 'Doença'}
        onCommunity={() => navigate('community')}
        onBack={backToField}
      />
    );
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <span className="gh-eyebrow text-brand">Confirmar em campo · {detail.name}</span>
        <h1 className="text-2xl font-bold tracking-tight text-section">
          {formatNumber(zone.areaHa, 1)} ha perdendo vigor
        </h1>
      </header>

      <ScoutStep n={1} state={stage === 'navigate' ? 'active' : 'done'} title="Vá até o ponto marcado" summary={zone.scoutHint}>
        <ScoutMap boundary={detail.boundary} entrance={detail.entrance} zone={zone} />
        <div className="flex gap-3 rounded-md bg-zone-bg p-4">
          <MapPin size={20} className="mt-0.5 flex-shrink-0 text-zone" aria-hidden="true" />
          <p className="text-sm leading-snug text-heading">
            Caminhe <b>{zone.scoutHint}</b>. É o centro da área que mais perdeu vigor.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={() => setStage('capture')}>Cheguei no ponto</Button>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md text-base font-bold text-brand hover:bg-tint"
          >
            <Navigation size={18} aria-hidden="true" />
            Abrir rota no Google Maps
          </a>
        </div>
      </ScoutStep>

      <ScoutStep
        n={2}
        state={stage === 'capture' ? 'active' : stage === 'result' ? 'done' : 'idle'}
        title="Fotografe uma folha"
        summary="Foto enviada"
      >
        <LeafCapture
          analyzing={classify.isPending}
          onAnalyze={(photo) =>
            classify.mutate({ zoneId: zone.id, photo }, { onSuccess: () => setStage('result') })
          }
        />
        {classify.isError && (
          <p className="text-sm text-alert">
            {apiErrorMessage(classify.error, 'Não foi possível analisar a foto. Tente de novo.')}
          </p>
        )}
      </ScoutStep>

      <ScoutStep
        n={3}
        state={stage === 'result' ? 'active' : 'idle'}
        title="Diagnóstico"
        summary={diagnosis ? `${diagnosis.label} · ${formatPercent(diagnosis.confidence * 100)}` : undefined}
      >
        {diagnosis && (
          <>
            <DiagnosisResult diagnosis={diagnosis} />
            <div className="h-px bg-hairline" />
            <PlainExplanationCard diagnosis={diagnosis} fieldName={`${detail.name} · ${detail.farm}`} />
            <div className="h-px bg-hairline" />
            <div className="flex flex-col gap-2">
              <Button
                fullWidth
                disabled={confirm.isPending || dismiss.isPending}
                onClick={() => confirm.mutate({ zoneId: zone.id, diagnosis: diagnosis.label })}
              >
                {confirm.isPending ? 'Registrando…' : 'Confirmar e avisar vizinhos'}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                disabled={confirm.isPending || dismiss.isPending}
                onClick={() => dismiss.mutate(zone.id, { onSuccess: backToField })}
              >
                Não parece isso
              </Button>
            </div>
          </>
        )}
      </ScoutStep>
    </>
  );
}

export default FieldCheckScreen;
