import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { N2YOPassResponse, ApiError, GroundStation, PassData } from '../../types';
import { APP_CONFIG } from '../../constants';

class N2YOClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_N2YO_API_KEY || '';
    
    this.client = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: APP_CONFIG.API_TIMEOUT,
    });
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getRadioPasses(
    noradId: number,
    station: GroundStation,
    days: number
  ): Promise<N2YOPassResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('API ключ не настроен. Установите VITE_N2YO_API_KEY в .env файле');
      }

      const url = `/radiopasses/${noradId}/${station.latitude}/${station.longitude}/${station.altitude}/${days}/${station.minElevation}`;
      
      const response = await this.client.get<N2YOPassResponse>(url, {
        params: { apiKey: this.apiKey },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllPasses(
    noradIds: number[],
    stations: GroundStation[],
    days: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<Map<string, PassData[]>> {
    const total = noradIds.length * stations.length;
    let current = 0;

    const passesMap = new Map<string, PassData[]>();

    for (const station of stations) {
      passesMap.set(station.id, []);
    }

    for (const noradId of noradIds) {
      for (const station of stations) {
        try {
          const response = await this.getRadioPasses(noradId, station, days);
          
          const enrichedPasses = response.passes.map((pass) => ({
            ...pass,
            satelliteName: response.info.satname,
            stationId: station.id,
            stationName: station.name,
          }));

          const existingPasses = passesMap.get(station.id) || [];
          passesMap.set(station.id, [...existingPasses, ...enrichedPasses]);

          current++;
          if (onProgress) {
            onProgress(current, total);
          }

          await this.delay(APP_CONFIG.API_DELAY_MS);
        } catch (error) {
          console.error(`Ошибка при получении данных для спутника ${noradId} и станции ${station.name}:`, error);
          current++;
          if (onProgress) {
            onProgress(current, total);
          }
        }
      }
    }

    for (const [stationId, passes] of passesMap) {
      const sortedPasses = passes.sort((a, b) => a.startUTC - b.startUTC);
      passesMap.set(stationId, sortedPasses);
    }

    return passesMap;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        return {
          message: `Ошибка API: ${axiosError.response.status} - ${axiosError.response.statusText}`,
          statusCode: axiosError.response.status,
        };
      }
      
      if (axiosError.request) {
        return {
          message: 'Не удалось подключиться к API. Проверьте интернет соединение.',
        };
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'Неизвестная ошибка при работе с API',
    };
  }
}

export const n2yoClient = new N2YOClient();

