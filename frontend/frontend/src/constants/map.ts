export const SATELLITE_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Imagens © Esri, Maxar, Earthstar Geographics',
} as const;

export const REGIONAL_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Mapa © Esri, HERE, Garmin, © OpenStreetMap',
} as const;
