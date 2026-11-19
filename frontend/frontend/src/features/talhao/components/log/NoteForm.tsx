import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../../components/Button';
import { useAuthStore } from '../../../../store/authStore';
import { useAddNote } from '../../hooks/useFieldExtras';

const noteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, 'Escreva pelo menos 3 caracteres.')
    .max(280, 'Use no máximo 280 caracteres.'),
});

type NoteValues = z.infer<typeof noteSchema>;

export function NoteForm({ fieldId }: { fieldId: string }) {
  const author = useAuthStore((s) => s.username) ?? 'Produtor';
  const addNote = useAddNote(fieldId);
  const { control, register, handleSubmit, reset, formState } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: '' },
  });
  const length = useWatch({ control, name: 'text' }).length;

  const onSubmit = handleSubmit(({ text }) =>
    addNote.mutate({ text, author }, { onSuccess: () => reset() }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <label htmlFor="field-note" className="text-sm font-semibold text-heading">
        Nova anotação
      </label>
      <textarea
        id="field-note"
        rows={3}
        placeholder="Ex.: folhas amareladas perto da cerca leste"
        className="w-full resize-none rounded-md bg-card p-3 text-sm text-heading ring-2 ring-hairline outline-none focus:ring-brand"
        aria-invalid={Boolean(formState.errors.text)}
        {...register('text')}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs ${formState.errors.text ? 'text-alert' : 'text-subtle'}`}>
          {formState.errors.text?.message ?? `${length}/280`}
        </span>
        <Button type="submit" size="sm" disabled={addNote.isPending}>
          {addNote.isPending ? 'Salvando…' : 'Salvar anotação'}
        </Button>
      </div>
    </form>
  );
}

export default NoteForm;
