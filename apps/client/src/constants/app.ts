export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_BACKEND_API_URL || '/api/satellite',
  API_TIMEOUT: 10000,
  API_DELAY_MS: 100,
  API_REQUESTS_PER_HOUR: 100,
  MIN_DAYS: 1,
  MAX_DAYS: 10,
  DEFAULT_DAYS: 7,
  MIN_ELEVATION: 0,
  MAX_ELEVATION: 90,
  DEFAULT_MIN_ELEVATION: 20,
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
  { noradId: 61772, name: 'Hyper View', description: 'Дистанционное зондирование Земли' },
  { noradId: 39133, name: 'Aist', description: 'Анлиз атмосферы заряженных частиц' },
] as const;

export const POPULAR_STATIONS = [
  { name: 'Байконур', latitude: 45.9636, longitude: 63.3050, altitude: 90, description: 'Космодром Байконур, Казахстан' },
  { name: 'Кеннеди', latitude: 28.5721, longitude: -80.6480, altitude: 3, description: 'Космический центр Кеннеди, США' },
  { name: 'Куру', latitude: 5.2390, longitude: -52.7683, altitude: 9, description: 'Космодром Куру, Французская Гвиана' },
  { name: 'Плесецк', latitude: 62.9257, longitude: 40.5771, altitude: 118, description: 'Космодром Плесецк, Россия' },
  { name: 'Ванденберг', latitude: 34.7420, longitude: -120.5724, altitude: 112, description: 'База ВВС Ванденберг, США' },
  { name: 'Сичан', latitude: 28.2461, longitude: 102.0264, altitude: 1820, description: 'Космодром Сичан, Китай' },
  { name: 'Танегасима', latitude: 30.4006, longitude: 130.9758, altitude: 194, description: 'Космический центр Танегасима, Япония' },
  { name: 'Самара', latitude: 53.214027 , longitude: 50.175086, altitude: 113, description: 'ЦУП Самара' },
  { name: 'Москва', latitude: 55.760042, longitude: 37.634706, altitude: 166, description: 'ЦУП Москва' },
] as const;

export const LOCAL_STORAGE_KEYS = {
  SATELLITES: 'satellite-tracker-satellites',
  STATIONS: 'satellite-tracker-stations',
  DAYS: 'satellite-tracker-days',
  API_KEY: 'satellite-tracker-api-key',
} as const;

