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

export interface ApiError {
  message: string;
  statusCode?: number;
}

