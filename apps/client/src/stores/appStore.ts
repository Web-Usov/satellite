import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Satellite, GroundStation, StationSchedule, CalculationMode } from '../types';
import { LOCAL_STORAGE_KEYS, APP_CONFIG } from '../constants';

interface AppState {
  satellites: Satellite[];
  stations: GroundStation[];
  schedules: StationSchedule[];
  days: number;
  calculationMode: CalculationMode;
  isCalculating: boolean;
  error: string | null;
  progress: number;
  totalRequests: number;
  apiTransactionsCount: number;
  apiTransactionsTimestamp: number;
  
  addSatellite: (satellite: Satellite) => void;
  removeSatellite: (noradId: number) => void;
  clearSatellites: () => void;
  
  addStation: (station: GroundStation) => void;
  removeStation: (id: string) => void;
  clearStations: () => void;
  
  setDays: (days: number) => void;
  setCalculationMode: (mode: CalculationMode) => void;
  
  setSchedules: (schedules: StationSchedule[]) => void;
  clearSchedules: () => void;
  
  setCalculating: (isCalculating: boolean) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number, totalRequests: number) => void;
  updateApiTransactions: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        satellites: [],
        stations: [],
        schedules: [],
        days: APP_CONFIG.DEFAULT_DAYS,
        calculationMode: 'api-tle' as CalculationMode,
        isCalculating: false,
        error: null,
        progress: 0,
        totalRequests: 0,
        apiTransactionsCount: 0,
        apiTransactionsTimestamp: 0,

        addSatellite: (satellite) =>
          set((state) => {
            const exists = state.satellites.some((s) => s.noradId === satellite.noradId);
            if (exists) return state;
            return { satellites: [...state.satellites, satellite] };
          }),

        removeSatellite: (noradId) =>
          set((state) => ({
            satellites: state.satellites.filter((s) => s.noradId !== noradId),
          })),

        clearSatellites: () => set({ satellites: [] }),

        addStation: (station) =>
          set((state) => {
            const exists = state.stations.some((s) => s.id === station.id);
            if (exists) return state;
            return { stations: [...state.stations, station] };
          }),

        removeStation: (id) =>
          set((state) => ({
            stations: state.stations.filter((s) => s.id !== id),
          })),

        clearStations: () => set({ stations: [] }),

        setDays: (days) => set({ days }),
        setCalculationMode: (mode) => set({ calculationMode: mode }),

        setSchedules: (schedules) => set({ schedules }),
        clearSchedules: () => set({ schedules: [] }),

        setCalculating: (isCalculating) => set({ isCalculating }),
        setError: (error) => set({ error }),
        setProgress: (progress, totalRequests) => set({ progress, totalRequests }),
        
        updateApiTransactions: (count) => 
          set({ 
            apiTransactionsCount: count,
            apiTransactionsTimestamp: Date.now(),
          }),
      }),
      {
        name: LOCAL_STORAGE_KEYS.SATELLITES,
        partialize: (state) => ({
          satellites: state.satellites,
          stations: state.stations,
          days: state.days,
          apiTransactionsCount: state.apiTransactionsCount,
          apiTransactionsTimestamp: state.apiTransactionsTimestamp,
        }),
      }
    )
  )
);

