import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/Button';
import { Dialog } from '../../../components/Dialog';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { PERIOD_LABEL } from '../../../constants/visits';
import { usePreferences } from '../../../store/preferencesStore';
import { addDays, formatDayMonth, formatWeekday } from '../../../utils/format';
import { useRequestVisit } from '../hooks/useFieldExtras';

const visitSchema = z.object({
  date: z.string().min(1, 'Escolha um dia.'),
  period: z.enum(['manha', 'tarde']),
  note: z.string().trim().max(200, 'Use no máximo 200 caracteres.').optional(),
});

type VisitValues = z.infer<typeof visitSchema>;

const DAYS_AHEAD = 5;

interface VisitRequestDialogProps {
  open: boolean;
  onClose: () => void;
  fieldId: string;
  zoneId?: string;
  today: string;
}

export function VisitRequestDialog({ open, onClose, fieldId, zoneId, today }: VisitRequestDialogProps) {
  const technician = usePreferences((s) => s.preferences.technicianName);
  const request = useRequestVisit();
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i + 1));
  const { control, register, handleSubmit, formState, reset } = useForm<VisitValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: { date: days[0], period: 'manha', note: '' },
  });

  const close = () => {
    reset();
    request.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) =>
    request.mutate({ fieldId, zoneId, ...values }, { onSuccess: close }),
  );

  return (
    <Dialog open={open} onClose={close} title="Pedir visita técnica" description={`O pedido vai para ${technician}.`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-heading">Dia</legend>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <div className="grid grid-cols-5 gap-2">
                {days.map((day) => {
                  const active = field.value === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={active}
                      onClick={() => field.onChange(day)}
                      className={`flex flex-col items-center rounded-md px-2 py-2.5 text-xs transition ${
                        active ? 'bg-brand text-white' : 'bg-page text-heading hover:bg-tint'
                      }`}
                    >
                      <span className="font-semibold capitalize">{formatWeekday(day)}</span>
                      <span>{formatDayMonth(day)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-heading">Período</span>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <SegmentedControl
                label="Período da visita"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'manha', label: PERIOD_LABEL.manha },
                  { value: 'tarde', label: PERIOD_LABEL.tarde },
                ]}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="visit-note" className="text-sm font-semibold text-heading">
            Recado para o técnico <span className="font-normal text-subtle">(opcional)</span>
          </label>
          <textarea
            id="visit-note"
            rows={3}
            placeholder="Ex.: a porteira do lado leste fica aberta"
            className="w-full resize-none rounded-md bg-card p-3 text-sm text-heading ring-2 ring-hairline outline-none focus:ring-brand"
            {...register('note')}
          />
          {formState.errors.note && <span className="text-xs text-alert">{formState.errors.note.message}</span>}
        </div>

        {request.isError && <p className="text-sm text-alert">Não foi possível enviar o pedido. Tente de novo.</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={request.isPending}>
            {request.isPending ? 'Enviando…' : 'Enviar pedido'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default VisitRequestDialog;
