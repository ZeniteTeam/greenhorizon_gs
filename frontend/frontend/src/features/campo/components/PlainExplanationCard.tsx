import { useEffect } from 'react';
import { MessageCircle, ShieldAlert, Sparkles, Square, Volume2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useSpeech } from '../../../hooks/useSpeech';
import { usePreferences } from '../../../store/preferencesStore';
import type { LeafDiagnosis } from '../../../types/monitoring';
import { formatPercent } from '../../../utils/format';

interface PlainExplanationCardProps {
  diagnosis: LeafDiagnosis;
  fieldName: string;
}

function toSpeech({ explanation }: LeafDiagnosis): string {
  return [explanation.summary, 'O que fazer agora:', ...explanation.whatToDo, explanation.caution].join(' ');
}

function toWhatsApp(diagnosis: LeafDiagnosis, fieldName: string): string {
  const { explanation } = diagnosis;
  return [
    `*Green Horizon · ${fieldName}*`,
    `Provável ${diagnosis.label.toLowerCase()} (${formatPercent(diagnosis.confidence * 100)} de confiança).`,
    '',
    explanation.summary,
    '',
    '*O que fazer agora:*',
    ...explanation.whatToDo.map((step) => `• ${step}`),
    '',
    `⚠️ ${explanation.caution}`,
  ].join('\n');
}

export function PlainExplanationCard({ diagnosis, fieldName }: PlainExplanationCardProps) {
  const { supported, speaking, speak, stop } = useSpeech();
  const autoPlay = usePreferences((s) => s.preferences.autoPlayAudio);
  const { explanation } = diagnosis;

  useEffect(() => {
    if (autoPlay) speak(toSpeech(diagnosis));
  }, [autoPlay, diagnosis, speak]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(toWhatsApp(diagnosis, fieldName))}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-subtle">
        <Sparkles size={14} aria-hidden="true" />
        Explicação gerada por IA
      </div>

      <p className="text-base leading-relaxed text-heading">{explanation.summary}</p>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-heading">O que fazer agora</span>
        <ol className="flex flex-col gap-2">
          {explanation.whatToDo.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-snug text-body">
              <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-tint text-xs font-bold text-brand">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3 rounded-md bg-warn-bg p-4">
        <ShieldAlert size={20} className="mt-0.5 flex-shrink-0 text-warn" aria-hidden="true" />
        <p className="text-sm leading-snug text-heading">{explanation.caution}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {supported && (
          <Button
            variant="secondary"
            iconLeft={speaking ? <Square size={16} /> : <Volume2 size={18} />}
            onClick={() => (speaking ? stop() : speak(toSpeech(diagnosis)))}
          >
            {speaking ? 'Parar áudio' : 'Ouvir explicação'}
          </Button>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-whatsapp px-5 text-base font-bold text-white transition hover:brightness-110"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Enviar no WhatsApp
        </a>
      </div>
    </div>
  );
}

export default PlainExplanationCard;
