import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SATELLITE_TILES } from '../../../constants/map';
import { colors } from '../../../styles/colors';
import type { LatLng, StressZone } from '../../../types/monitoring';
import { bounds } from '../../../utils/geo';

interface ScoutMapProps {
  boundary: LatLng[];
  entrance: LatLng;
  zone: StressZone;
}

export function ScoutMap({ boundary, entrance, zone }: ScoutMapProps) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-md">
      <MapContainer
        bounds={bounds([...zone.polygon, entrance])}
        boundsOptions={{ padding: [36, 36] }}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer url={SATELLITE_TILES.url} attribution={SATELLITE_TILES.attribution} maxZoom={19} />
        <Polygon positions={boundary} interactive={false} pathOptions={{ color: colors.white, weight: 2, fill: false }} />
        <Polygon
          positions={zone.polygon}
          interactive={false}
          pathOptions={{ color: colors.zone, weight: 3, fillColor: colors.zone, fillOpacity: 0.18 }}
        />
        <Polyline
          positions={[entrance, zone.scoutPoint]}
          interactive={false}
          pathOptions={{ color: colors.white, weight: 3, dashArray: '6 8' }}
        />
        <CircleMarker center={entrance} radius={7} pathOptions={{ color: colors.dark, weight: 3, fillColor: colors.white, fillOpacity: 1 }}>
          <Tooltip direction="right" offset={[8, 0]} permanent>
            Porteira
          </Tooltip>
        </CircleMarker>
        <CircleMarker center={zone.scoutPoint} radius={9} pathOptions={{ color: colors.white, weight: 3, fillColor: colors.zone, fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -10]} permanent>
            Fotografe aqui
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}

export default ScoutMap;
