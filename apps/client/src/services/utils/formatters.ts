import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatTimestamp = (timestamp: number): string => {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDate = (timestamp: number): string => {
  return dayjs.unix(timestamp).format('YYYY-MM-DD');
};

export const formatTime = (timestamp: number): string => {
  return dayjs.unix(timestamp).format('HH:mm:ss');
};

export const formatDuration = (startTimestamp: number, endTimestamp: number): string => {
  const durationMinutes = Math.floor((endTimestamp - startTimestamp) / 60);
  const minutes = durationMinutes % 60;
  const hours = Math.floor(durationMinutes / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
};

export const formatElevation = (elevation: number): string => {
  return `${elevation.toFixed(1)}°`;
};

export const formatAzimuth = (azimuth: number, compass: string): string => {
  return `${azimuth.toFixed(1)}° (${compass})`;
};


