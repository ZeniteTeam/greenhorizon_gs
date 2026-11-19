import { BellRing, CheckCircle2, Database, Stethoscope, Users } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';

interface ConfirmationDoneProps {
  diagnosis: string;
  onCommunity: () => void;
  onBack: () => void;
}

const OUTCOMES = [
  { icon: Database, text: 'Diagnóstico salvo no registro do talhão.' },
  { icon: BellRing, text: 'Produtores num raio de 15 km foram avisados.' },
  { icon: Stethoscope, text: 'Seu técnico de referência vê o caso na lista de visitas.' },
];

export function ConfirmationDone({ diagnosis, onCommunity, onBack }: ConfirmationDoneProps) {
  return (
    <Card padding={24} className="gh-reveal flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-good-bg text-good">
          <CheckCircle2 size={28} aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold text-heading">Diagnóstico registrado</h2>
        <p className="text-sm text-body">{diagnosis} confirmada.</p>
      </div>
      <ul className="flex flex-col gap-3">
        {OUTCOMES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-sm leading-snug text-heading">
            <Icon size={18} className="mt-0.5 flex-shrink-0 text-brand" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button fullWidth iconLeft={<Users size={18} />} onClick={onCommunity}>
          Ver focos na região
        </Button>
        <Button variant="ghost" fullWidth onClick={onBack}>
          Voltar ao talhão
        </Button>
      </div>
    </Card>
  );
}

export default ConfirmationDone;
