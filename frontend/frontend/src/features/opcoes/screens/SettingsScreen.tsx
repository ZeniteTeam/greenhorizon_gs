import { useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LogOut } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components/PageHeader';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '../../../store/navigationStore';
import { usePreferences } from '../../../store/preferencesStore';
import { TextField } from '../components/TextField';
import { ToggleRow } from '../components/ToggleRow';
import { fromForm, preferencesSchema, RADIUS_OPTIONS, toForm, type PreferencesForm } from '../schema';

const SAVED_MESSAGE_MS = 2500;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card padding={24} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-heading">{title}</h2>
        {description && <p className="text-sm text-body">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

export function SettingsScreen() {
  const { preferences, save } = usePreferences();
  const { username, email, clearUser } = useAuthStore();
  const navigate = useNavigation((s) => s.navigate);
  const [saved, setSaved] = useState(false);

  const { control, register, handleSubmit, formState } = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: toForm(preferences),
  });
  const { errors } = formState;
  const whatsappOn = useWatch({ control, name: 'whatsapp' });

  const onSubmit = handleSubmit((values) => {
    save(fromForm(values));
    setSaved(true);
    setTimeout(() => setSaved(false), SAVED_MESSAGE_MS);
  });

  function logout() {
    clearUser();
    navigate('login');
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader eyebrow={email ?? 'Conta'} title="Configurações" />

      <Section title="Alertas da comunidade" description="Você é avisado quando um foco é confirmado dentro deste raio.">
        <Controller
          control={control}
          name="radiusKm"
          render={({ field }) => (
            <SegmentedControl
              label="Raio de alerta"
              value={field.value}
              onChange={field.onChange}
              options={RADIUS_OPTIONS.map((r) => ({ value: r, label: `${r} km` }))}
            />
          )}
        />
      </Section>

      <Section title="Como receber os avisos">
        <div className="flex flex-col divide-y divide-hairline">
          <ToggleRow id="pref-push" label="Notificação no celular" {...register('push')} />
          <ToggleRow id="pref-whatsapp" label="WhatsApp" hint="Funciona mesmo com pouco pacote de dados." {...register('whatsapp')} />
          <ToggleRow id="pref-sms" label="SMS" hint="Para quando não houver internet." {...register('sms')} />
        </div>
        {errors.push && <span className="text-xs text-alert">{errors.push.message}</span>}
        {whatsappOn && (
          <TextField
            id="pref-whatsapp-number"
            label="Número do WhatsApp"
            placeholder="(66) 99999-9999"
            inputMode="tel"
            error={errors.whatsappNumber?.message}
            {...register('whatsappNumber')}
          />
        )}
      </Section>

      <Section title="Explicações">
        <ToggleRow
          id="pref-audio"
          label="Tocar o áudio automaticamente"
          hint="Lê o diagnóstico em voz alta assim que ele fica pronto."
          {...register('autoPlayAudio')}
        />
      </Section>

      <Section title="Técnico de referência" description="Recebe seus pedidos de visita técnica.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="pref-tech-name" label="Nome" error={errors.technicianName?.message} {...register('technicianName')} />
          <TextField
            id="pref-tech-phone"
            label="Telefone"
            inputMode="tel"
            error={errors.technicianPhone?.message}
            {...register('technicianPhone')}
          />
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" iconLeft={<LogOut size={18} />} onClick={logout}>
          Sair de {username ?? 'sua conta'}
        </Button>
        <div className="flex items-center gap-3">
          {saved && (
            <span role="status" className="flex items-center gap-1.5 text-sm font-semibold text-brand">
              <CheckCircle2 size={16} aria-hidden="true" />
              Preferências salvas
            </span>
          )}
          <Button type="submit">Salvar</Button>
        </div>
      </div>
    </form>
  );
}

export default SettingsScreen;
