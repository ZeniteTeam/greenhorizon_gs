import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { REGIONAL_TILES } from '../../../constants/map';
import { colors } from '../../../styles/colors';
import type { LatLng, Outbreak } from '../../../types/monitoring';
import { formatDayMonth, formatNumber } from '../../../utils/format';

const SPREAD_RISK_RADIUS_M = 5_000;

function outbreakStyle(o: Outbreak) {
  const fill = o.status === 'confirmed' ? colors.alert : colors.suspected;
  return {
    color: o.isMine ? colors.dark : colors.white,
    weight: o.isMine ? 3 : 2,
    fillColor: fill,
    fillOpacity: 1,
  };
}

interface OutbreakMapProps {
  center: LatLng;
  radiusKm: number;
  outbreaks: Outbreak[];
}

function zoomFor(radiusKm: number): number {
  if (radiusKm <= 5) return 12;
  if (radiusKm <= 15) return 11;
  return 10;
}

export function OutbreakMap({ center, radiusKm, outbreaks }: OutbreakMapProps) {
  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-lg shadow-card">
      <MapContainer key={radiusKm} center={center} zoom={zoomFor(radiusKm)} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url={REGIONAL_TILES.url} attribution={REGIONAL_TILES.attribution} />

        <Circle
          center={center}
          radius={radiusKm * 1000}
          interactive={false}
          pathOptions={{ color: colors.dark, weight: 1, dashArray: '4 6', fill: false }}
        />

        {outbreaks
          .filter((o) => o.status === 'confirmed')
          .map((o) => (
            <Circle
              key={`risk-${o.id}`}
              center={o.position}
              radius={SPREAD_RISK_RADIUS_M}
              interactive={false}
              pathOptions={{ stroke: false, fillColor: colors.alert, fillOpacity: 0.08 }}
            />
          ))}

        <CircleMarker
          center={center}
          radius={6}
          pathOptions={{ color: colors.white, weight: 2, fillColor: colors.brand, fillOpacity: 1 }}
        >
          <Tooltip direction="bottom" offset={[0, 6]}>Seus talhões</Tooltip>
        </CircleMarker>

        {outbreaks.map((o) => (
          <CircleMarker key={o.id} center={o.position} radius={o.status === 'confirmed' ? 9 : 7} pathOptions={outbreakStyle(o)}>
            <Tooltip direction="top" offset={[0, -8]}>
              <b>{o.disease}</b>
              <br />
              {o.status === 'confirmed' ? 'Confirmado' : 'Suspeita'} em {formatDayMonth(o.reportedAt)} · {o.municipality}
              <br />
              {o.isMine ? 'No seu talhão' : `${formatNumber(o.distanceKm, 1)} km de você`}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-col gap-2 rounded-md bg-white/92 p-3 text-xs text-heading shadow-soft">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-alert" aria-hidden="true" /> Foco confirmado por foto
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-warn" aria-hidden="true" /> Suspeita aguardando confirmação
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-alert/15" aria-hidden="true" /> Área de risco (5 km)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-3 border-t border-dashed border-dark" aria-hidden="true" /> Raio de alerta ({radiusKm} km)
        </span>
      </div>
    </div>
  );
}

export default OutbreakMap;
