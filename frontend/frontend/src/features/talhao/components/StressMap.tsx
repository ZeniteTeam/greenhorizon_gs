import { useMemo } from 'react';
import { CloudOff, Cloudy } from 'lucide-react';
import { CircleMarker, MapContainer, Polygon, Rectangle, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SATELLITE_TILES } from '../../../constants/map';
import { CHANGE_DISPLAY_RANGE, colors, NDMI_DISPLAY_RANGE, NDVI_DISPLAY_RANGE } from '../../../styles/colors';
import type { LatLng, MapLayer, SatelliteSample, StressZone } from '../../../types/monitoring';
import { formatDayMonth, formatNumber, formatPercent, formatSigned } from '../../../utils/format';
import { bounds } from '../../../utils/geo';
import { USE_DEMO } from '../../../api/monitoring/demo';
import type { FieldTileRequest } from '../../../api/monitoring/fields';
import { useFieldTile } from '../hooks/useFieldTile';
import { buildPixelGrid } from '../utils/pixelGrid';

interface StressMapProps {
  fieldId: string;
  boundary: LatLng[];
  zone?: StressZone;
  sample: SatelliteSample;
  previous?: SatelliteSample;
  layer: MapLayer;
  showZone: boolean;
}

const LEGEND: Record<MapLayer, { title: string; gradient: string; low: string; high: string }> = {
  ndvi: {
    title: 'Vigor (NDVI) por pixel',
    gradient: 'bg-(image:--ndvi-gradient)',
    low: formatNumber(NDVI_DISPLAY_RANGE[0]),
    high: formatNumber(NDVI_DISPLAY_RANGE[1]),
  },
  ndmi: {
    title: 'Umidade da folha (NDMI)',
    gradient: 'bg-(image:--moisture-gradient)',
    low: `${formatNumber(NDMI_DISPLAY_RANGE[0])} seco`,
    high: `${formatNumber(NDMI_DISPLAY_RANGE[1])} úmido`,
  },
  change: {
    title: 'Mudança de vigor em 10 dias',
    gradient: 'bg-(image:--change-gradient)',
    low: `${formatSigned(CHANGE_DISPLAY_RANGE[0], 2)} perda`,
    high: `${formatSigned(CHANGE_DISPLAY_RANGE[1], 2)} ganho`,
  },
};

const TILE_OPACITY = 0.85;

function tileRequest(
  fieldId: string,
  sample: SatelliteSample,
  layer: MapLayer,
  previous: SatelliteSample | undefined,
): FieldTileRequest | null {
  if (USE_DEMO || sample.fieldNdvi === null) return null;
  if (layer !== 'change') return { fieldId, date: sample.date, layer };
  return previous ? { fieldId, date: sample.date, layer, previousDate: previous.date } : null;
}

export function StressMap({ fieldId, boundary, zone, sample, previous, layer, showZone }: StressMapProps) {
  // Demo mode draws a synthetic pixel grid; otherwise the real Sentinel-2 pixels come as map tiles.
  const cells = useMemo(
    () => (USE_DEMO ? buildPixelGrid(boundary, zone?.polygon, sample, layer, previous) : []),
    [boundary, zone, sample, layer, previous],
  );
  const tile = useFieldTile(tileRequest(fieldId, sample, layer, previous));
  const mapBounds = useMemo(() => bounds(boundary), [boundary]);
  const fullyClouded = sample.fieldNdvi === null;

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg shadow-card lg:h-full lg:min-h-[460px]">
      <MapContainer
        bounds={mapBounds}
        boundsOptions={{ padding: [48, 48] }}
        scrollWheelZoom={false}
        preferCanvas
        className="h-full w-full"
      >
        <TileLayer url={SATELLITE_TILES.url} attribution={SATELLITE_TILES.attribution} maxZoom={19} />
        {tile.data && <TileLayer key={tile.data} url={tile.data} opacity={TILE_OPACITY} maxZoom={19} />}

        {cells.map((cell) => (
          <Rectangle
            key={cell.id}
            bounds={cell.bounds}
            interactive={false}
            pathOptions={{ stroke: false, fillColor: cell.fill, fillOpacity: cell.cloud ? 0.6 : 0.82 }}
          />
        ))}

        <Polygon positions={boundary} interactive={false} pathOptions={{ color: colors.white, weight: 2, fill: false }} />

        {showZone && zone && (
          <>
            <Polygon positions={zone.polygon} interactive={false} pathOptions={{ color: colors.zone, weight: 3, fill: false }} />
            <CircleMarker
              center={zone.scoutPoint}
              radius={8}
              pathOptions={{ color: colors.white, weight: 3, fillColor: colors.zone, fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent>
                Ponto para foto
              </Tooltip>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute top-3 right-3 left-14 z-[500] flex flex-wrap items-start justify-between gap-2">
        <span className="rounded-full bg-dark/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          Sentinel-2 · {formatDayMonth(sample.date)}
          {layer === 'change' && previous && ` vs ${formatDayMonth(previous.date)}`}
        </span>
        {fullyClouded ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-heading">
            <CloudOff size={14} aria-hidden="true" />
            Cena coberta por nuvens
          </span>
        ) : sample.cloudMasked >= 0.05 ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-heading">
            <Cloudy size={14} aria-hidden="true" />
            {formatPercent(sample.cloudMasked * 100)} com nuvem
          </span>
        ) : null}
      </div>

      <MapLegend layer={layer} showZone={showZone && Boolean(zone)} />
    </div>
  );
}

function MapLegend({ layer, showZone }: { layer: MapLayer; showZone: boolean }) {
  const legend = LEGEND[layer];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-col gap-2 rounded-md bg-white/92 p-3 text-xs text-heading shadow-soft">
      <span className="font-semibold">{legend.title}</span>
      <div className="flex items-center gap-2">
        <span>{legend.low}</span>
        <span className={`h-2 w-24 rounded-full ${legend.gradient}`} aria-hidden="true" />
        <span>{legend.high}</span>
      </div>
      <div className="flex items-center gap-4">
        {showZone && (
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border-[3px] border-zone" aria-hidden="true" />
            Zona sob estresse
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-cloud" aria-hidden="true" />
          Nuvem / sem dado
        </span>
      </div>
    </div>
  );
}

export default StressMap;
