import {
  mockAddNote,
  mockFieldEvents,
  mockFieldVisits,
  mockFieldWeather,
  mockNotifications,
  mockRequestVisit,
  type VisitRequest,
} from '../../mocks/fieldExtras';
import type { AppNotification, FieldEvent, FieldWeather, TechnicianVisit } from '../../types/monitoring';
import api from '../axios';
import { fromDemo, USE_DEMO } from './demo';

export type { VisitRequest };

/** 7-day forecast + disease risk. */
export async function getFieldWeather(fieldId: string): Promise<FieldWeather> {
  if (USE_DEMO) return fromDemo(() => mockFieldWeather(fieldId));
  const { data } = await api.get<FieldWeather>(`/fields/${fieldId}/weather`);
  return data;
}

export async function getFieldEvents(fieldId: string): Promise<FieldEvent[]> {
  if (USE_DEMO) return fromDemo(() => mockFieldEvents(fieldId));
  const { data } = await api.get<FieldEvent[]>(`/fields/${fieldId}/events`);
  return data;
}

export async function addFieldNote(fieldId: string, text: string, author: string): Promise<FieldEvent> {
  if (USE_DEMO) return fromDemo(() => mockAddNote(fieldId, text, author));
  const { data } = await api.post<FieldEvent>(`/fields/${fieldId}/notes`, { text, author });
  return data;
}

export async function getFieldVisits(fieldId: string): Promise<TechnicianVisit[]> {
  if (USE_DEMO) return fromDemo(() => mockFieldVisits(fieldId));
  const { data } = await api.get<TechnicianVisit[]>(`/fields/${fieldId}/visits`);
  return data;
}

export async function requestVisit(request: VisitRequest): Promise<TechnicianVisit> {
  if (USE_DEMO) return fromDemo(() => mockRequestVisit(request));
  const { data } = await api.post<TechnicianVisit>('/visits', request);
  return data;
}

export async function getNotifications(): Promise<AppNotification[]> {
  if (USE_DEMO) return fromDemo(mockNotifications, 250);
  const { data } = await api.get<AppNotification[]>('/notifications');
  return data;
}
