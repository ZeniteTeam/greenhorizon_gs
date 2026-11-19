// Contracts the backend is expected to serve for continuous field monitoring.
// The front-end currently resolves them from src/mocks.

export type LatLng = [number, number];

export type CropName = 'Soja' | 'Milho' | 'Arroz';

export type FieldHealth = 'on-track' | 'attention' | 'stress';

export interface FieldSummary {
  id: string;
  name: string;
  farm: string;
  municipality: string;
  crop: CropName;
  areaHa: number;
  plantedAt: string;
  daysAfterPlanting: number;
  stage: string;
  health: FieldHealth;
  ndviNow: number;
  expectedNow: [number, number];
  trend: number[];
  lastPass: string;
  nextPass: string;
  openZones: number;
  centroid: LatLng;
}

/** One Sentinel-2 pass over the field, after per-pixel cloud masking. */
export interface SatelliteSample {
  date: string;
  dap: number;
  stage: string;
  /** null when every pixel of the field was masked as cloud. */
  fieldNdvi: number | null;
  zoneNdvi: number | null;
  fieldNdmi: number | null;
  zoneNdmi: number | null;
  /** Share of field pixels masked as cloud/shadow (0–1). */
  cloudMasked: number;
}

export interface ExpectedPoint {
  dap: number;
  low: number;
  high: number;
}

export interface RainSample {
  date: string;
  dap: number;
  mm: number;
  normalMm: number;
}

export type EvidenceTone = 'signal' | 'supports' | 'rules-out';

export interface Evidence {
  id: string;
  label: string;
  value: string;
  reading: string;
  tone: EvidenceTone;
}

export type HypothesisKind = 'pest-or-disease' | 'water-stress' | 'nutrient' | 'natural-cycle';

export interface Hypothesis {
  kind: HypothesisKind;
  label: string;
  evidence: Evidence[];
}

export type ZoneStatus = 'awaiting-photo' | 'confirmed' | 'dismissed';

export interface StressZone {
  id: string;
  polygon: LatLng[];
  areaHa: number;
  detectedAt: string;
  vigorDropPct: number;
  windowDays: number;
  fieldDropPct: number;
  scoutPoint: LatLng;
  scoutHint: string;
  status: ZoneStatus;
  hypothesis: Hypothesis;
  diagnosis?: string;
}

export interface FieldDetail extends FieldSummary {
  boundary: LatLng[];
  entrance: LatLng;
  today: string;
  todayDap: number;
  seasonLengthDays: number;
  samples: SatelliteSample[];
  expected: ExpectedPoint[];
  rain: RainSample[];
  zones: StressZone[];
}

export interface ClassScore {
  label: string;
  confidence: number;
}

export interface PlainExplanation {
  summary: string;
  whatToDo: string[];
  caution: string;
}

export interface LeafDiagnosis {
  label: string;
  scientificName: string;
  confidence: number;
  alternatives: ClassScore[];
  model: string;
  explanation: PlainExplanation;
}

export type OutbreakStatus = 'confirmed' | 'suspected';

export interface Outbreak {
  id: string;
  disease: string;
  status: OutbreakStatus;
  position: LatLng;
  reportedAt: string;
  distanceKm: number;
  municipality: string;
  isMine?: boolean;
}

export type AlertSeverity = 'act' | 'watch' | 'info';

export interface CommunityAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  createdAt: string;
}

export interface VisitPriority {
  id: string;
  producer: string;
  fieldName: string;
  municipality: string;
  reason: string;
  score: number;
  distanceKm: number;
}

export interface CommunityOverview {
  asOf: string;
  center: LatLng;
  radiusKm: number;
  outbreaks: Outbreak[];
  alerts: CommunityAlert[];
  visits: VisitPriority[];
  stats: {
    confirmed: number;
    suspected: number;
    producersAlerted: number;
    areaAtRiskHa: number;
  };
}

export type MapLayer = 'ndvi' | 'ndmi' | 'change';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface ForecastDay {
  date: string;
  minC: number;
  maxC: number;
  rainMm: number;
  rainChance: number;
  humidity: number;
  leafWetnessHours: number;
}

export interface DiseaseRisk {
  disease: string;
  level: RiskLevel;
  reasons: string[];
}

export interface FieldWeather {
  forecast: ForecastDay[];
  risks: DiseaseRisk[];
  rain30dMm: number;
  normal30dMm: number;
}

export type FieldEventKind = 'planting' | 'pass' | 'zone' | 'diagnosis' | 'dismissal' | 'visit' | 'note';

export interface FieldEvent {
  id: string;
  date: string;
  kind: FieldEventKind;
  title: string;
  description?: string;
  author?: string;
}

export type VisitPeriod = 'manha' | 'tarde';

export interface TechnicianVisit {
  id: string;
  fieldId: string;
  zoneId?: string;
  date: string;
  period: VisitPeriod;
  technician: string;
  organization: string;
  phone: string;
  note?: string;
  status: 'scheduled' | 'done';
}

export type NotificationKind = 'zone' | 'outbreak' | 'risk' | 'pass' | 'visit' | 'diagnosis';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  fieldId?: string;
  target: 'fields' | 'field' | 'community';
}
