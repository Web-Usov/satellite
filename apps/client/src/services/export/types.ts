import type { StationSchedule } from '../../types';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'ical';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  includeStationName?: boolean;
  dateFormat?: 'timestamp' | 'iso' | 'formatted';
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  error?: string;
}

export interface IExporter {
  readonly format: ExportFormat;
  readonly mimeType: string;
  readonly fileExtension: string;
  
  export(data: StationSchedule[], options?: ExportOptions): Promise<ExportResult>;
  exportSingleStation(schedule: StationSchedule, options?: ExportOptions): Promise<ExportResult>;
  canExport(): boolean;
}

export interface ExportData {
  stations: StationSchedule[];
  exportedAt: number;
  totalPasses: number;
}

