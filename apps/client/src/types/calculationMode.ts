export type CalculationMode = 'api-tle' | 'api-radio' | 'input-tle';

export interface CalculationModeInfo {
  id: CalculationMode;
  name: string;
  description: string;
  enabled: boolean;
}

export const CALCULATION_MODES: CalculationModeInfo[] = [
  {
    id: 'api-tle',
    name: 'API TLE',
    description: 'Получение TLE через API + локальные расчеты ',
    enabled: true,
  },
  {
    id: 'api-radio',
    name: 'API Radio',
    description: 'Прямой запрос проходов через N2YO API ',
    enabled: true,
  },
  {
    id: 'input-tle',
    name: 'Input TLE',
    description: 'Ручной ввод TLE (скоро)',
    enabled: false,
  },
];




