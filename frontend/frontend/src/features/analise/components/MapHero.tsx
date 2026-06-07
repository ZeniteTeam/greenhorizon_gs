import { PenTool } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapHeroProps {
  analyzed: boolean;
  analyzing: boolean;
  minHeight?: number;
}

export function MapHero({ analyzed, analyzing, minHeight = 440 }: MapHeroProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight,
        height: "100%",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        background: "url(/imagery/hero-map.png) center / cover no-repeat",
      }}
    >
      <MapContainer
        {...({
          center: [-15.7942, -47.8822],
          zoom: 4,
          scrollWheelZoom: false,
          style: { height: "100%", width: "100%" },
        } as any)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          {...{
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }}
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
