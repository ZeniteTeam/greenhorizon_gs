import type {
  AppNotification,
  DiseaseRisk,
  FieldDetail,
  FieldEvent,
  FieldWeather,
  ForecastDay,
  TechnicianVisit,
  VisitPeriod,
} from '../types/monitoring';
import { PERIOD_LABEL } from '../constants/visits';
import { formatDayMonth, formatNumber } from '../utils/format';
import { DEMO_TODAY, mockFieldDetail, mockFields } from './monitoring';

const TECHNICIAN = {
  technician: 'Carla Menezes',
  organization: 'Assistência técnica · Cooperativa Vale Verde',
  phone: '(66) 3000-0142',
};

const FORECAST: ForecastDay[] = [
  { date: '2024-12-22', minC: 21, maxC: 29, rainMm: 18, rainChance: 85, humidity: 88, leafWetnessHours: 13 },
  { date: '2024-12-23', minC: 21, maxC: 30, rainMm: 9, rainChance: 70, humidity: 84, leafWetnessHours: 11 },
  { date: '2024-12-24', minC: 22, maxC: 31, rainMm: 2, rainChance: 35, humidity: 76, leafWetnessHours: 7 },
  { date: '2024-12-25', minC: 21, maxC: 30, rainMm: 14, rainChance: 80, humidity: 87, leafWetnessHours: 12 },
  { date: '2024-12-26', minC: 20, maxC: 28, rainMm: 26, rainChance: 90, humidity: 91, leafWetnessHours: 15 },
  { date: '2024-12-27', minC: 20, maxC: 28, rainMm: 12, rainChance: 75, humidity: 88, leafWetnessHours: 12 },
  { date: '2024-12-28', minC: 21, maxC: 30, rainMm: 4, rainChance: 40, humidity: 80, leafWetnessHours: 8 },
];

const RAINY_DAY_MM = 5;
const WET_DAY_HOURS = 10;

const visits: TechnicianVisit[] = [];

const notes: FieldEvent[] = [
  {
    id: 'n-3-1',
    date: '2024-12-02',
    kind: 'note',
    title: 'Vistoria de rotina',
    description: 'Lavoura uniforme, sem sinais de pragas nas bordas.',
    author: 'Produtor',
  },
  {
    id: 'n-5-1',
    date: '2024-12-10',
    kind: 'note',
    title: 'Anotação',
    description: 'Plantas menores na parte baixa do talhão, perto do córrego.',
    author: 'Produtor',
  },
];
const noteField: Record<string, string> = { 'n-3-1': 'talhao-3', 'n-5-1': 'talhao-5' };

function soyRisks(forecast: ForecastDay[], nearbyRust: boolean): DiseaseRisk[] {
  const rainyDays = forecast.filter((d) => d.rainMm >= RAINY_DAY_MM).length;
  const wetDays = forecast.filter((d) => d.leafWetnessHours >= WET_DAY_HOURS).length;
  const minC = Math.min(...forecast.map((d) => d.minC));
  const maxC = Math.max(...forecast.map((d) => d.maxC));
  const humid = forecast.filter((d) => d.humidity >= 80).length;

  return [
    {
      disease: 'Ferrugem asiática',
      level: rainyDays >= 4 && wetDays >= 4 ? 'high' : 'moderate',
      reasons: [
        `Chuva em ${rainyDays} dos próximos ${forecast.length} dias`,
        `${wetDays} dias com mais de ${WET_DAY_HOURS} h de folha molhada`,
        `Temperatura entre ${minC} e ${maxC} °C, faixa favorável ao fungo`,
        ...(nearbyRust ? ['Foco confirmado a 8 km'] : []),
      ],
    },
    {
      disease: 'Mancha-alvo',
      level: humid >= 5 ? 'moderate' : 'low',
      reasons: [`Umidade acima de 80% em ${humid} dias`],
    },
  ];
}

function cornRisks(forecast: ForecastDay[]): DiseaseRisk[] {
  const humid = forecast.filter((d) => d.humidity >= 85).length;
  return [
    { disease: 'Cercosporiose', level: humid >= 4 ? 'moderate' : 'low', reasons: [`Umidade acima de 85% em ${humid} dias`] },
    { disease: 'Ferrugem polissora', level: 'low', reasons: ['Temperaturas acima da faixa ideal do fungo à tarde'] },
  ];
}

export function mockFieldWeather(fieldId: string): FieldWeather {
  const detail = mockFieldDetail(fieldId);
  const recent = detail.rain.slice(-6);
  return {
    forecast: FORECAST,
    risks: detail.crop === 'Milho' ? cornRisks(FORECAST) : soyRisks(FORECAST, true),
    rain30dMm: recent.reduce((sum, r) => sum + r.mm, 0),
    normal30dMm: recent.reduce((sum, r) => sum + r.normalMm, 0),
  };
}

function passEvents(detail: FieldDetail): FieldEvent[] {
  return detail.samples.slice(-4).map((s) => ({
    id: `pass-${s.dap}`,
    date: s.date,
    kind: 'pass' as const,
    title: s.fieldNdvi === null ? 'Passagem sem leitura (nuvens)' : 'Passagem do Sentinel-2',
    description:
      s.fieldNdvi === null
        ? 'Cena coberta por nuvens. Os dados voltam na próxima passagem.'
        : `NDVI médio ${formatNumber(s.fieldNdvi)} · ${s.stage}`,
  }));
}

export function mockFieldEvents(fieldId: string): FieldEvent[] {
  const detail = mockFieldDetail(fieldId);
  const events: FieldEvent[] = [
    {
      id: 'planting',
      date: detail.plantedAt,
      kind: 'planting',
      title: 'Plantio',
      description: `${detail.crop} · ${formatNumber(detail.areaHa, 1)} ha`,
    },
    ...passEvents(detail),
  ];

  for (const zone of detail.zones) {
    events.push({
      id: `zone-${zone.id}`,
      date: zone.detectedAt,
      kind: 'zone',
      title: 'Zona sob estresse detectada',
      description: `${formatNumber(zone.areaHa, 1)} ha · ${formatNumber(Math.abs(zone.vigorDropPct), 0)}% de queda de vigor em ${zone.windowDays} dias`,
    });
    if (zone.status === 'confirmed') {
      events.push({
        id: `diag-${zone.id}`,
        date: DEMO_TODAY,
        kind: 'diagnosis',
        title: `${zone.diagnosis} confirmada por foto`,
        description: 'Vizinhos num raio de 15 km foram avisados.',
        author: 'Produtor',
      });
    }
    if (zone.status === 'dismissed') {
      events.push({
        id: `dismiss-${zone.id}`,
        date: DEMO_TODAY,
        kind: 'dismissal',
        title: 'Alerta marcado como alarme falso',
        author: 'Produtor',
      });
    }
  }

  for (const visit of visits.filter((v) => v.fieldId === fieldId)) {
    events.push({
      id: `visit-${visit.id}`,
      date: DEMO_TODAY,
      kind: 'visit',
      title: 'Visita técnica agendada',
      description: `${formatDayMonth(visit.date)} · ${PERIOD_LABEL[visit.period]} · ${visit.technician}`,
    });
  }

  events.push(...notes.filter((n) => noteField[n.id] === fieldId));

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function mockFieldVisits(fieldId: string): TechnicianVisit[] {
  return visits.filter((v) => v.fieldId === fieldId);
}

export interface VisitRequest {
  fieldId: string;
  zoneId?: string;
  date: string;
  period: VisitPeriod;
  note?: string;
}

export function mockRequestVisit(request: VisitRequest): TechnicianVisit {
  const visit: TechnicianVisit = {
    id: `v-${visits.length + 1}`,
    ...request,
    ...TECHNICIAN,
    status: 'scheduled',
  };
  visits.push(visit);
  return visit;
}

export function mockAddNote(fieldId: string, text: string, author: string): FieldEvent {
  const note: FieldEvent = {
    id: `n-${Date.now()}`,
    date: DEMO_TODAY,
    kind: 'note',
    title: 'Anotação',
    description: text,
    author,
  };
  notes.push(note);
  noteField[note.id] = fieldId;
  return note;
}

export function mockNotifications(): AppNotification[] {
  const items: AppNotification[] = [
    {
      id: 'outbreak-o1',
      kind: 'outbreak',
      title: 'Ferrugem asiática confirmada a 8 km',
      body: 'Monitore a parte de baixo das folhas nos próximos 7 dias.',
      createdAt: '2024-12-17',
      target: 'community',
    },
    {
      id: 'pass-1219',
      kind: 'pass',
      title: 'Nova passagem do satélite processada',
      body: '3 talhões analisados. Próxima passagem em 24/12.',
      createdAt: '2024-12-19',
      target: 'fields',
    },
    {
      id: 'risk-1221',
      kind: 'risk',
      title: 'Semana favorável à ferrugem',
      body: 'Chuva na maior parte dos próximos dias e muitas horas de folha molhada.',
      createdAt: DEMO_TODAY,
      fieldId: 'talhao-3',
      target: 'field',
    },
  ];

  for (const field of mockFields()) {
    const detail = mockFieldDetail(field.id);
    for (const zone of detail.zones) {
      if (zone.status === 'awaiting-photo') {
        items.push({
          id: `zone-${zone.id}`,
          kind: 'zone',
          title: `${field.name}: ${formatNumber(zone.areaHa, 1)} ha perdendo vigor`,
          body: 'Vá até o ponto marcado e fotografe uma folha.',
          createdAt: zone.detectedAt,
          fieldId: field.id,
          target: 'field',
        });
      }
      if (zone.status === 'confirmed') {
        items.push({
          id: `diag-${zone.id}`,
          kind: 'diagnosis',
          title: 'Vizinhos avisados',
          body: `14 produtores receberam o alerta de ${zone.diagnosis?.toLowerCase()} do ${field.name}.`,
          createdAt: DEMO_TODAY,
          target: 'community',
        });
      }
    }
  }

  for (const visit of visits) {
    items.push({
      id: `visit-${visit.id}`,
      kind: 'visit',
      title: 'Visita técnica confirmada',
      body: `${visit.technician} vai ao talhão em ${formatDayMonth(visit.date)}, de ${PERIOD_LABEL[visit.period]}.`,
      createdAt: DEMO_TODAY,
      fieldId: visit.fieldId,
      target: 'field',
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
