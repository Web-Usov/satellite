export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.DEV ? '/api/n2yo' : 'https://api.n2yo.com/rest/v1/satellite',
  API_TIMEOUT: 10000,
  API_DELAY_MS: 100,
  API_REQUESTS_PER_HOUR: 1000,
  MIN_DAYS: 1,
  MAX_DAYS: 10,
  DEFAULT_DAYS: 7,
  MIN_ELEVATION: 0,
  MAX_ELEVATION: 90,
  DEFAULT_MIN_ELEVATION: 10,
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
  MIN_ALTITUDE: 0,
  MAX_ALTITUDE: 10000,
} as const;

export const POPULAR_SATELLITES = [
  { noradId: 25544, name: 'ISS (ZARYA)', description: 'Международная космическая станция' },
  { noradId: 48274, name: 'STARLINK-1007', description: 'Спутник Starlink' },
  { noradId: 20580, name: 'HST', description: 'Телескоп Hubble' },
  { noradId: 39444, name: 'COSMOS 2251 DEB', description: 'Обломки Космос 2251' },
  { noradId: 43013, name: 'TIANGONG 1', description: 'Китайская космическая станция' },
] as const;

export const LOCAL_STORAGE_KEYS = {
  SATELLITES: 'satellite-tracker-satellites',
  STATIONS: 'satellite-tracker-stations',
  DAYS: 'satellite-tracker-days',
  API_KEY: 'satellite-tracker-api-key',
} as const;

