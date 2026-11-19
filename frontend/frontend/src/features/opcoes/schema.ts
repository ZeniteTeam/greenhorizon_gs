import { z } from 'zod';
import type { AlertPreferences } from '../../store/preferencesStore';

const PHONE = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const PHONE_MESSAGE = 'Use o formato (66) 99999-9999.';

export const RADIUS_OPTIONS = ['5', '10', '15', '30'] as const;

export const preferencesSchema = z
  .object({
    radiusKm: z.enum(RADIUS_OPTIONS),
    push: z.boolean(),
    whatsapp: z.boolean(),
    sms: z.boolean(),
    whatsappNumber: z.string().trim(),
    autoPlayAudio: z.boolean(),
    technicianName: z.string().trim().min(2, 'Informe o nome do técnico.'),
    technicianPhone: z.string().trim().regex(PHONE, PHONE_MESSAGE),
  })
  .superRefine((values, ctx) => {
    if (!values.push && !values.whatsapp && !values.sms) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['push'], message: 'Escolha pelo menos um canal.' });
    }
    if (values.whatsapp && !PHONE.test(values.whatsappNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['whatsappNumber'], message: PHONE_MESSAGE });
    }
  });

export type PreferencesForm = z.infer<typeof preferencesSchema>;

export function toForm(p: AlertPreferences): PreferencesForm {
  const radius = RADIUS_OPTIONS.find((r) => Number(r) === p.radiusKm) ?? '15';
  return { ...p, radiusKm: radius };
}

export function fromForm(values: PreferencesForm): AlertPreferences {
  return { ...values, radiusKm: Number(values.radiusKm) };
}
