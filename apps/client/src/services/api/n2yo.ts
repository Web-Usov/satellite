import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { N2YOPassResponse, N2YOTLEResponse, ApiError, GroundStation, PassData, CalculationMode } from '../../types';
import { APP_CONFIG } from '../../constants';
import { calculateSatellitePasses, parseTLE } from '../utils/satelliteCalculator';

class N2YOClient {
  private client: AxiosInstance;

  constructor() {
    console.log('[N2YOClient] Инициализация с baseURL:', APP_CONFIG.API_BASE_URL);
    this.client = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: APP_CONFIG.API_TIMEOUT,
    });
    console.log('[N2YOClient] Axios client создан');
  }

  async getTLE(
    noradId: number,
    onTransactionUpdate?: (count: number) => void
  ): Promise<N2YOTLEResponse> {
    try {
      const url = `/tle/${noradId}`;
      
      console.log(`[getTLE] Запрос TLE для спутника ${noradId}, URL: ${url}`);
      const response = await this.client.get<any>(url);
      
      console.log(`[getTLE] Ответ для спутника ${noradId}:`, response.data);

      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error}`);
      }

      if (!response.data.info || !response.data.tle) {
        console.error(`[getTLE] Некорректный ответ:`, response.data);
        throw new Error(`Invalid TLE response for satellite ${noradId}`);
      }

      if (onTransactionUpdate && response.data.info) {
        onTransactionUpdate(response.data.info.transactionscount);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRadioPasses(
    noradId: number,
    station: GroundStation,
    days: number,
    onTransactionUpdate?: (count: number) => void
  ): Promise<N2YOPassResponse> {
    try {

      const url = `/radiopasses/${noradId}/${station.latitude}/${station.longitude}/${station.altitude}/${days}/${station.minElevation}`;
      
      const response = await this.client.get<N2YOPassResponse>(url, {
      });

      if (onTransactionUpdate && response.data.info) {
        onTransactionUpdate(response.data.info.transactionscount);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllPassesWithApiRadio(
    noradIds: number[],
    stations: GroundStation[],
    days: number,
    onProgress?: (current: number, total: number) => void,
    onTransactionUpdate?: (count: number) => void
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
          const response = await this.getRadioPasses(noradId, station, days, onTransactionUpdate);
          
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

  async getAllPassesWithApiTle(
    noradIds: number[],
    stations: GroundStation[],
    days: number,
    onProgress?: (current: number, total: number) => void,
    onTransactionUpdate?: (count: number) => void
  ): Promise<Map<string, PassData[]>> {
    const tleCache = new Map<number, { tle: { line1: string; line2: string }; satname: string }>();
    
    const totalSteps = noradIds.length + (noradIds.length * stations.length);
    let currentStep = 0;

    const passesMap = new Map<string, PassData[]>();

    for (const station of stations) {
      passesMap.set(station.id, []);
    }

    for (const noradId of noradIds) {
      try {
        const tleResponse = await this.getTLE(noradId, onTransactionUpdate);
        
        const { line1, line2 } = parseTLE(tleResponse.tle);
        
        tleCache.set(noradId, {
          tle: { line1, line2 },
          satname: tleResponse.info.satname,
        });

        currentStep++;
        if (onProgress) {
          onProgress(currentStep, totalSteps);
        }

        await this.delay(APP_CONFIG.API_DELAY_MS);
      } catch (error) {
        let errorMessage = 'Неизвестная ошибка';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String((error as any).message);
        } else {
          errorMessage = String(error);
        }
        console.error(`Ошибка при получении TLE для спутника ${noradId}:`, errorMessage);
        currentStep++;
        if (onProgress) {
          onProgress(currentStep, totalSteps);
        }
      }
    }

    for (const noradId of noradIds) {
      const tleData = tleCache.get(noradId);
      
      if (!tleData) {
        currentStep += stations.length;
        if (onProgress) {
          onProgress(currentStep, totalSteps);
        }
        continue;
      }

      for (const station of stations) {
        try {
          const passes = calculateSatellitePasses(
            tleData.tle.line1,
            tleData.tle.line2,
            station,
            days
          );

          const enrichedPasses = passes.map((pass) => ({
            ...pass,
            satelliteName: tleData.satname,
            stationId: station.id,
            stationName: station.name,
          }));

          const existingPasses = passesMap.get(station.id) || [];
          passesMap.set(station.id, [...existingPasses, ...enrichedPasses]);

          currentStep++;
          if (onProgress) {
            onProgress(currentStep, totalSteps);
          }

          await this.delay(10);
        } catch (error) {
          console.error(`Ошибка при расчете проходов для спутника ${noradId} над станцией ${station.name}:`, error);
          currentStep++;
          if (onProgress) {
            onProgress(currentStep, totalSteps);
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

  async getAllPasses(
    noradIds: number[],
    stations: GroundStation[],
    days: number,
    mode: CalculationMode,
    onProgress?: (current: number, total: number) => void,
    onTransactionUpdate?: (count: number) => void
  ): Promise<Map<string, PassData[]>> {
    switch (mode) {
      case 'api-tle':
        return this.getAllPassesWithApiTle(noradIds, stations, days, onProgress, onTransactionUpdate);
      case 'api-radio':
        return this.getAllPassesWithApiRadio(noradIds, stations, days, onProgress, onTransactionUpdate);
      case 'input-tle':
        throw new Error('Input TLE mode не реализован');
      default:
        throw new Error(`Неизвестный режим расчета: ${mode}`);
    }
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

