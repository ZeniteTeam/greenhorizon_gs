import type {
  CommunityAlert,
  CommunityOverview,
  CropName,
  Evidence,
  FieldDetail,
  FieldHealth,
  FieldSummary,
  LatLng,
  LeafDiagnosis,
  Outbreak,
  StressZone,
  VisitPriority,
  ZoneStatus,
} from '../types/monitoring';
import { addDays, formatNumber, formatPercent, formatSigned } from '../utils/format';
import { areaHa, centroid, directionPhrase, distanceKm, offsetMeters } from '../utils/geo';
import { buildSeason, type SeasonConfig } from './season';

// Illustrative scenario: a soybean season in Sorriso (MT) that lost vigor in
// one corner during pod formation. Values are synthetic but follow the shape
// of real Sentinel-2 / CHIRPS series for the region.

export const DEMO_TODAY = '2024-12-21';
const REVISIT_DAYS = 5;

const ORIGIN: LatLng = [-12.4735, -55.9335];

function ring(origin: LatLng, offsets: Array<[number, number]>): LatLng[] {
  return offsets.map(([north, east]) => offsetMeters(origin, north, east));
}

interface FieldSeed {
  id: string;
  name: string;
  farm: string;
  municipality: string;
  crop: CropName;
  plantedAt: string;
  boundary: LatLng[];
  entrance: LatLng;
  season: Omit<SeasonConfig, 'crop' | 'plantedAt' | 'todayDap'>;
  zone?: { polygon: LatLng[]; scoutPoint: LatLng };
}

const field3Boundary = ring(ORIGIN, [[0, 0], [0, 600], [470, 600], [520, 560], [520, 0]]);
const field3Zone = ring(ORIGIN, [[330, 400], [345, 520], [420, 575], [490, 545], [495, 450], [440, 395]]);

const SEEDS: FieldSeed[] = [
  {
    id: 'talhao-3',
    name: 'Talhão 3',
    farm: 'Sítio Santa Helena',
    municipality: 'Sorriso, MT',
    crop: 'Soja',
    plantedAt: '2024-10-05',
    boundary: field3Boundary,
    entrance: offsetMeters(ORIGIN, 300, 600),
    season: {
      seed: 3,
      cloudyPasses: { 45: 0.96, 50: 0.58, 70: 0.34 },
      stress: {
        startDap: 65,
        detectDap: 75,
        dropAtDetect: 0.18,
        fieldShare: areaHa(field3Zone) / areaHa(field3Boundary),
      },
    },
    zone: { polygon: field3Zone, scoutPoint: offsetMeters(ORIGIN, 400, 520) },
  },
  {
    id: 'talhao-1',
    name: 'Talhão 1',
    farm: 'Sítio Santa Helena',
    municipality: 'Sorriso, MT',
    crop: 'Soja',
    plantedAt: '2024-09-30',
    boundary: ring(offsetMeters(ORIGIN, 80, -820), [[0, 0], [0, 700], [450, 700], [450, 0]]),
    entrance: offsetMeters(ORIGIN, 80, -120),
    season: { seed: 1, cloudyPasses: { 50: 0.97, 55: 0.41 } },
  },
  {
    id: 'talhao-5',
    name: 'Talhão 5',
    farm: 'Sítio Santa Helena',
    municipality: 'Sorriso, MT',
    crop: 'Milho',
    plantedAt: '2024-10-10',
    boundary: ring(offsetMeters(ORIGIN, -720, 40), [[0, 0], [0, 520], [380, 560], [400, 0]]),
    entrance: offsetMeters(ORIGIN, -320, 300),
    season: { seed: 5, bias: -0.09, cloudyPasses: { 40: 0.93 } },
  },
];

const zoneState: Record<string, { status: ZoneStatus; diagnosis?: string }> = {
  'talhao-3-z1': { status: 'awaiting-photo' },
};

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

function lastValue<T>(items: T[], pick: (item: T) => number | null): number {
  for (let i = items.length - 1; i >= 0; i--) {
    const value = pick(items[i]);
    if (value !== null) return value;
  }
  return 0;
}

function buildField(seed: FieldSeed): { summary: FieldSummary; detail: FieldDetail } {
  const todayDap = daysBetween(seed.plantedAt, DEMO_TODAY);
  const season = buildSeason({ ...seed.season, crop: seed.crop, plantedAt: seed.plantedAt, todayDap });
  const { samples, expected, rain } = season;
  const last = samples[samples.length - 1];
  const zones = seed.zone ? [buildZone(seed, season)] : [];

  const ndviNow = lastValue(samples, (s) => s.fieldNdvi);
  const expectedPoint = expected.reduce((best, p) =>
    Math.abs(p.dap - last.dap) < Math.abs(best.dap - last.dap) ? p : best,
  );
  const openZones = zones.filter((z) => z.status === 'awaiting-photo').length;
  const health: FieldHealth =
    zones.some((z) => z.status !== 'dismissed') ? 'stress'
      : ndviNow < expectedPoint.low ? 'attention'
        : 'on-track';

  const summary: FieldSummary = {
    id: seed.id,
    name: seed.name,
    farm: seed.farm,
    municipality: seed.municipality,
    crop: seed.crop,
    areaHa: Math.round(areaHa(seed.boundary) * 10) / 10,
    plantedAt: seed.plantedAt,
    daysAfterPlanting: todayDap,
    stage: last.stage,
    health,
    ndviNow,
    expectedNow: [expectedPoint.low, expectedPoint.high],
    trend: samples.map((s) => s.fieldNdvi).filter((v): v is number => v !== null).slice(-10),
    lastPass: last.date,
    nextPass: addDays(last.date, REVISIT_DAYS),
    openZones,
    centroid: centroid(seed.boundary),
  };

  const detail: FieldDetail = {
    ...summary,
    boundary: seed.boundary,
    entrance: seed.entrance,
    today: DEMO_TODAY,
    todayDap,
    seasonLengthDays: season.seasonLengthDays,
    samples,
    expected,
    rain,
    zones,
  };

  return { summary, detail };
}

function buildZone(seed: FieldSeed, season: ReturnType<typeof buildSeason>): StressZone {
  const zone = seed.zone!;
  const stress = seed.season.stress!;
  const { samples, rain } = season;
  const at = (dap: number) => samples.find((s) => s.dap === dap)!;
  const before = at(stress.detectDap - 10);
  const after = at(stress.detectDap);
  const pctChange = (from: number | null, to: number | null) =>
    from && to ? ((to - from) / from) * 100 : 0;

  const vigorDropPct = pctChange(before.zoneNdvi, after.zoneNdvi);
  const fieldDropPct = pctChange(before.fieldNdvi, after.fieldNdvi);
  const recentRain = rain.filter((r) => r.dap > stress.detectDap - 30 && r.dap <= stress.detectDap);
  const rainPct =
    (recentRain.reduce((sum, r) => sum + r.mm, 0) / recentRain.reduce((sum, r) => sum + r.normalMm, 0)) * 100;
  const zoneArea = areaHa(zone.polygon);
  const fromEntrance = distanceKm(seed.entrance, zone.scoutPoint) * 1000;
  const state = zoneState[`${seed.id}-z1`];

  const evidence: Evidence[] = [
    {
      id: 'zone-ndvi',
      label: 'Vigor da zona (NDVI)',
      value: `${formatSigned(vigorDropPct)}% em 10 dias`,
      reading: `Queda concentrada em ${formatNumber(zoneArea, 1)} ha do talhão.`,
      tone: 'signal',
    },
    {
      id: 'field-mean',
      label: 'Média do talhão inteiro',
      value: `${formatSigned(fieldDropPct, 1)}%`,
      reading: 'Olhando só a média, o problema passaria despercebido.',
      tone: 'signal',
    },
    {
      id: 'rain',
      label: 'Chuva, últimos 30 dias (CHIRPS)',
      value: `${formatPercent(rainPct)} da média`,
      reading: 'Choveu normalmente: falta de água é improvável.',
      tone: 'rules-out',
    },
    {
      id: 'ndmi',
      label: 'Umidade da folha (NDMI)',
      value: `${formatNumber(before.zoneNdmi ?? 0)} → ${formatNumber(after.zoneNdmi ?? 0)}`,
      reading: 'Praticamente estável: sem sinal de estresse hídrico.',
      tone: 'rules-out',
    },
    {
      id: 'stage',
      label: 'Fase da cultura',
      value: after.stage,
      reading: 'Nesta fase a soja ainda deveria estar no pico de vigor: não é maturação natural.',
      tone: 'rules-out',
    },
    {
      id: 'community',
      label: 'Focos na região',
      value: 'Ferrugem confirmada a 8 km',
      reading: 'Os esporos viajam com o vento: risco real de chegada.',
      tone: 'supports',
    },
  ];

  return {
    id: `${seed.id}-z1`,
    polygon: zone.polygon,
    areaHa: Math.round(zoneArea * 10) / 10,
    detectedAt: after.date,
    vigorDropPct,
    windowDays: 10,
    fieldDropPct,
    scoutPoint: zone.scoutPoint,
    scoutHint: `${Math.round(fromEntrance / 10) * 10} m ${directionPhrase(seed.entrance, zone.scoutPoint)} da porteira`,
    status: state.status,
    diagnosis: state.diagnosis,
    hypothesis: { kind: 'pest-or-disease', label: 'Provável praga ou doença', evidence },
  };
}

export function mockFields(): FieldSummary[] {
  return SEEDS.map((seed) => buildField(seed).summary);
}

export function mockFieldDetail(id: string): FieldDetail {
  const seed = SEEDS.find((s) => s.id === id);
  if (!seed) throw new Error(`Talhão não encontrado: ${id}`);
  return buildField(seed).detail;
}

export function mockLeafDiagnosis(): LeafDiagnosis {
  return {
    label: 'Ferrugem asiática',
    scientificName: 'Phakopsora pachyrhizi',
    confidence: 0.91,
    alternatives: [
      { label: 'Mancha-alvo', confidence: 0.05 },
      { label: 'Crestamento foliar', confidence: 0.02 },
      { label: 'Folha sadia', confidence: 0.02 },
    ],
    model: 'Análise da foto cruzada com a zona detectada pelo satélite',
    explanation: {
      summary:
        'A foto mostra pontinhos marrons na parte de baixo da folha. Esse é o sinal mais comum da ferrugem asiática. ' +
        'O satélite já tinha visto essa parte da lavoura perdendo força nos últimos 10 dias, e choveu normalmente, ' +
        'então a falta de água não explica o problema.',
      whatToDo: [
        'Chame hoje o técnico da Emater ou da sua cooperativa para confirmar.',
        'Olhe as folhas de baixo das plantas em volta da área marcada e tire mais duas ou três fotos.',
        'Evite passar com máquinas da área afetada para as áreas sadias sem limpar antes.',
        'Fique de olho no app: o satélite passa de novo daqui a 5 dias.',
      ],
      caution:
        'Isto é uma suspeita, não uma receita. Não aplique nenhum defensivo sem a orientação de um técnico.',
    },
  };
}

export function mockConfirmZone(zoneId: string, diagnosis: string): void {
  zoneState[zoneId] = { status: 'confirmed', diagnosis };
}

export function mockDismissZone(zoneId: string): void {
  zoneState[zoneId] = { status: 'dismissed' };
}

const NEIGHBORS_ALERTED_ON_CONFIRM = 14;

export function mockCommunity(): CommunityOverview {
  const home = buildField(SEEDS[0]).detail;
  const center = home.centroid;
  const atKm = (north: number, east: number) => offsetMeters(center, north * 1000, east * 1000);

  const base: Array<Omit<Outbreak, 'distanceKm'>> = [
    { id: 'o1', disease: 'Ferrugem asiática', status: 'confirmed', position: atKm(5.8, 5.8), reportedAt: '2024-12-17', municipality: 'Gleba Rio Lira' },
    { id: 'o2', disease: 'Ferrugem asiática', status: 'confirmed', position: atKm(-0.6, 11.5), reportedAt: '2024-12-15', municipality: 'Linha Boa Esperança' },
    { id: 'o3', disease: 'Ferrugem asiática', status: 'confirmed', position: atKm(13.4, -3.2), reportedAt: '2024-12-12', municipality: 'Comunidade Primavera' },
    { id: 's1', disease: 'Ferrugem asiática', status: 'suspected', position: atKm(-6.1, -0.8), reportedAt: '2024-12-20', municipality: 'Gleba Mercedes' },
    { id: 's2', disease: 'Mancha-alvo', status: 'suspected', position: atKm(2.1, -16.5), reportedAt: '2024-12-19', municipality: 'Linha 5' },
  ];

  const zone = home.zones[0];
  if (zone?.status === 'confirmed') {
    base.unshift({
      id: zone.id,
      disease: zone.diagnosis ?? 'Ferrugem asiática',
      status: 'confirmed',
      position: zone.scoutPoint,
      reportedAt: DEMO_TODAY,
      municipality: `${home.name} · ${home.farm}`,
      isMine: true,
    });
  } else if (zone?.status === 'awaiting-photo') {
    base.unshift({
      id: zone.id,
      disease: 'Causa a confirmar',
      status: 'suspected',
      position: zone.scoutPoint,
      reportedAt: zone.detectedAt,
      municipality: `${home.name} · ${home.farm}`,
      isMine: true,
    });
  }

  const outbreaks: Outbreak[] = base
    .map((o) => ({ ...o, distanceKm: Math.round(distanceKm(center, o.position) * 10) / 10 }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestConfirmed = outbreaks.find((o) => o.status === 'confirmed' && !o.isMine);
  const confirmedByMe = zone?.status === 'confirmed';

  const alerts: CommunityAlert[] = [
    ...(confirmedByMe
      ? [{
          id: 'a-mine',
          severity: 'act' as const,
          title: `Você confirmou ${zone.diagnosis?.toLowerCase()} no ${home.name}`,
          body: `${NEIGHBORS_ALERTED_ON_CONFIRM} produtores num raio de 15 km foram avisados para monitorar as lavouras.`,
          createdAt: DEMO_TODAY,
        }]
      : []),
    {
      id: 'a1',
      severity: 'act',
      title: `Ferrugem confirmada a ${formatNumber(nearestConfirmed?.distanceKm ?? 0, 0)} km de você`,
      body: 'Monitore sua lavoura nos próximos 7 dias, olhando a parte de baixo das folhas.',
      createdAt: '2024-12-17',
    },
    ...(zone?.status === 'awaiting-photo'
      ? [{
          id: 'a2',
          severity: 'watch' as const,
          title: `${formatNumber(zone.areaHa, 1)} ha sob estresse no ${home.name}`,
          body: 'Vá até o ponto indicado e fotografe uma folha para confirmar o que é.',
          createdAt: zone.detectedAt,
        }]
      : []),
    {
      id: 'a3',
      severity: 'info',
      title: 'Nova passagem do Sentinel-2 processada',
      body: '3 talhões analisados automaticamente. Próxima passagem em 24/12.',
      createdAt: '2024-12-19',
    },
  ];

  const ownVisit: VisitPriority[] = !zone || zone.status === 'dismissed' ? [] : [
    {
      id: 'v0',
      producer: 'Sítio Santa Helena',
      fieldName: `${home.name} · ${home.crop}`,
      municipality: home.municipality,
      reason: confirmedByMe
        ? `${zone?.diagnosis} confirmada por foto do produtor, aguarda visita técnica`
        : `Zona de ${formatNumber(zone?.areaHa ?? 0, 1)} ha sob estresse, sem confirmação, a 8 km de foco`,
      score: confirmedByMe ? 96 : 92,
      distanceKm: 0,
    },
  ];

  const visits: VisitPriority[] = [
    ...ownVisit,
    { id: 'v1', producer: 'Sítio Boa Esperança', fieldName: 'Lote 2 · Soja', municipality: 'Linha Boa Esperança', reason: 'Queda de 12% no vigor, a 3 km de foco confirmado', score: 88, distanceKm: 10.8 },
    { id: 'v2', producer: 'Gleba Mercedes, lote 14', fieldName: 'Soja', municipality: 'Gleba Mercedes', reason: 'Suspeita por foto sem técnico vinculado', score: 81, distanceKm: 6.2 },
    { id: 'v3', producer: 'Chácara Rio Lira', fieldName: 'Soja', municipality: 'Gleba Rio Lira', reason: 'Vizinha de foco confirmado, sem passagem limpa há 10 dias', score: 74, distanceKm: 8.9 },
    { id: 'v4', producer: 'Sítio Primavera', fieldName: 'Milho', municipality: 'Comunidade Primavera', reason: 'Lavoura abaixo da curva esperada', score: 61, distanceKm: 13.7 },
  ];

  return {
    asOf: DEMO_TODAY,
    center,
    radiusKm: 15,
    outbreaks,
    alerts,
    visits,
    stats: {
      confirmed: outbreaks.filter((o) => o.status === 'confirmed').length,
      suspected: outbreaks.filter((o) => o.status === 'suspected').length,
      producersAlerted: 37 + (confirmedByMe ? NEIGHBORS_ALERTED_ON_CONFIRM : 0),
      areaAtRiskHa: 1840 + (confirmedByMe ? 31 : 0),
    },
  };
}
