import { PenTool } from 'lucide-react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';
import { useEffect, useState } from 'react';
import React from 'react';
import L from 'leaflet';

interface MapHeroProps {
  handleChangePoints: (points: any) => void;
  analyzed: boolean;
  analyzing: boolean;
  minHeight?: number;
  tileUrl?: string;
}

type Coordenada = [number, number];

interface GeomanControlesProps {
  onPerimetroCalculado: (metros: number) => void;
  onCoordenadasSalvas: (coords: Coordenada[]) => void;
}

const GeomanControles: React.FC<GeomanControlesProps> = ({ onPerimetroCalculado, onCoordenadasSalvas }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Configura e adiciona os controles do Geoman no mapa
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawPolygon: true,
      drawRectangle: true,
      drawCircle: false,
      drawText: false,
      editMode: true,
      removalMode: true,
    });

    // Função auxiliar para calcular o perímetro a partir da camada (layer)
    const processarGeometria = (layer: L.Layer) => {
      if (typeof (layer as any).toGeoJSON === 'function') {
        const geoJsonData = (layer as any).toGeoJSON();

        // 1. Calcula o perímetro
        const comprimentoKm = turf.length(geoJsonData, { units: 'kilometers' });
        onPerimetroCalculado(comprimentoKm * 1000);

        // 2. Extrai as coordenadas dependendo do tipo de forma desenhada
        // O GeoJSON estrutura polígonos dentro de uma matriz extra para representar anéis (rings)
        const tipo = geoJsonData.geometry.type;
        let pontos: Coordenada[] = [];

        if (tipo === 'Polygon') {
          // geoJsonData.geometry.coordinates[0] contém o array de [long, lat] do contorno exterior
          pontos = geoJsonData.geometry.coordinates[0];
        } else if (tipo === 'LineString') {
          pontos = geoJsonData.geometry.coordinates;
        }

        // Envia as coordenadas para o componente pai
        onCoordenadasSalvas(pontos);
      }
    };

    // Evento disparado ao terminar de desenhar uma forma
    // Evento: Quando o desenho é concluído
    map.on('pm:create', (e: any) => {
      const layer = e.layer as L.Layer;
      processarGeometria(layer);

      // Evento: Quando o utilizador edita/arrasta os pontos da forma existente
      layer.on('pm:edit', () => {
        processarGeometria(layer);
      });
    });

    // Evento: Quando uma forma é removida do mapa
    map.on('pm:remove', () => {
      onPerimetroCalculado(0);
      onCoordenadasSalvas([]);
    });

    // Limpeza dos controles ao desmontar o componente
    return () => {
      map.pm.removeControls();
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map, onPerimetroCalculado, onCoordenadasSalvas]);

  return null;
};

export function MapHero({ handleChangePoints, analyzed, analyzing, minHeight = 440, tileUrl }: MapHeroProps) {

  const [perimetro, setPerimetro] = useState<number>(0);
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);

  useEffect(() => {
    if (coordenadas.length > 0) {

      console.table(
        coordenadas.map((coord, index) => ({
          Ponto: index + 1,
          Longitude: coord[0],
          Latitude: coord[1],
          Formatado_para_Leaflet: `[${coord[1]}, ${coord[0]}]` // Caso precise inverter para [Lat, Lng]
        }))
      );
    } else {
      console.log("Nenhuma coordenada no mapa.");
    }
  }, [coordenadas]);

  function handleChangeCoordenada(coordenadas: Coordenada[]) {
    handleChangePoints(
      coordenadas.map(coord => ({ latitude: coord[1], longitude: coord[0] }))
    );
  }

  
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight,
        height: "100%",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <MapContainer
        {...({
          center: [-15.7942, -47.8822],
          zoom: 10,
          scrollWheelZoom: false,
          style: { height: "100%", width: "100%" },
        } as any)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}

        <GeomanControles
          onPerimetroCalculado={setPerimetro}
          onCoordenadasSalvas={handleChangeCoordenada}
        />
      </MapContainer>

      {!analyzed && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,35,24,.18), rgba(3,35,24,.42))",
          }}
        >
          <div
            className="flex items-center gap-3"
            style={{
              padding: "12px 20px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(3,35,24,.72)",
              backdropFilter: "blur(6px)",
              color: "var(--white)",
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--fw-semibold)",
              fontSize: 15,
            }}
          >
            <PenTool size={18} />
            {analyzing
              ? "Processando imagens de satélite…"
              : "Desenhe o polígono da sua área no mapa"}
          </div>
        </div>
      )}
      {analyzing && (
        <div className="gh-scan absolute inset-0 pointer-events-none" />
      )}
    </div>
  );
}

export default MapHero;
