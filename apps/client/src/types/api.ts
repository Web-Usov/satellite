import type { PassData } from './pass';

export interface N2YOPassResponse {
  info: {
    satid: number;
    satname: string;
    transactionscount: number;
    passescount: number;
  };
  passes: PassData[];
}

export interface N2YOTLEResponse {
  info: {
    satid: number;
    satname: string;
    transactionscount: number;
  };
  tle: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

