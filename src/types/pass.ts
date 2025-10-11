export interface PassData {
  startUTC: number;
  maxUTC: number;
  endUTC: number;
  maxEl: number;
  startAz: number;
  maxAz: number;
  endAz: number;
  startAzCompass: string;
  maxAzCompass: string;
  endAzCompass: string;
  satelliteName?: string;
  stationId?: string;
  stationName?: string;
}

export interface StationSchedule {
  stationId: string;
  stationName: string;
  passes: PassData[];
}

