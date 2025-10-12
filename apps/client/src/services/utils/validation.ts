import { APP_CONFIG } from '../../constants';

export const validateLatitude = (lat: number): boolean => {
  return lat >= APP_CONFIG.MIN_LATITUDE && lat <= APP_CONFIG.MAX_LATITUDE;
};

export const validateLongitude = (lng: number): boolean => {
  return lng >= APP_CONFIG.MIN_LONGITUDE && lng <= APP_CONFIG.MAX_LONGITUDE;
};

export const validateAltitude = (alt: number): boolean => {
  return alt >= APP_CONFIG.MIN_ALTITUDE && alt <= APP_CONFIG.MAX_ALTITUDE;
};

export const validateElevation = (elev: number): boolean => {
  return elev >= APP_CONFIG.MIN_ELEVATION && elev <= APP_CONFIG.MAX_ELEVATION;
};

export const validateDays = (days: number): boolean => {
  return days >= APP_CONFIG.MIN_DAYS && days <= APP_CONFIG.MAX_DAYS;
};

export const validateNoradId = (id: number): boolean => {
  return Number.isInteger(id) && id > 0;
};


