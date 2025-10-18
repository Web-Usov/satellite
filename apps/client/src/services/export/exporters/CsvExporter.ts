import { formatTimestamp } from '../../utils';
import type { PassData, StationSchedule } from '../../../types';
import type { ExportFormat, ExportOptions, ExportResult } from '../types';
import { BaseExporter } from './BaseExporter';

export class CsvExporter extends BaseExporter {
  readonly format: ExportFormat = 'csv';
  readonly mimeType = 'text/csv;charset=utf-8;';
  readonly fileExtension = 'csv';

  private escapeCSV(value: string | number | undefined): string {
    if (value === undefined || value === null) {
      return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private formatPassToCSVRow(pass: PassData, includeStationName: boolean = true): string {
    const fields: (string | number)[] = [];
    
    if (includeStationName && pass.stationName) {
      fields.push(this.escapeCSV(pass.stationName));
    }
    
    if (pass.satelliteName) {
      fields.push(this.escapeCSV(pass.satelliteName));
    }
    
    fields.push(
      this.escapeCSV(formatTimestamp(pass.startUTC)),
      this.escapeCSV(formatTimestamp(pass.maxUTC)),
      this.escapeCSV(formatTimestamp(pass.endUTC)),
      pass.maxEl.toFixed(2),
      pass.startAz.toFixed(2),
      this.escapeCSV(pass.startAzCompass),
      pass.endAz.toFixed(2),
      this.escapeCSV(pass.endAzCompass),
      Math.round((pass.endUTC - pass.startUTC) / 60)
    );
    
    return fields.join(',');
  }

  private generateCSVHeaders(includeStationName: boolean = true): string {
    const headers: string[] = [];
    
    if (includeStationName) {
      headers.push('Station');
    }
    
    headers.push(
      'Satellite',
      'Start Time (UTC)',
      'Max Elevation Time (UTC)',
      'End Time (UTC)',
      'Max Elevation (°)',
      'Start Azimuth (°)',
      'Start Direction',
      'End Azimuth (°)',
      'End Direction',
      'Duration (min)'
    );
    
    return headers.join(',');
  }

  async export(data: StationSchedule[], options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const {
        filename,
        includeHeaders = true,
        includeStationName = true,
      } = options;

      const lines: string[] = [];
      
      if (includeHeaders) {
        lines.push(this.generateCSVHeaders(includeStationName));
      }

      for (const schedule of data) {
        for (const pass of schedule.passes) {
          lines.push(this.formatPassToCSVRow(pass, includeStationName));
        }
      }

      const csvContent = lines.join('\n');
      const finalFilename = filename || this.generateFilename('satellite-passes');
      
      this.downloadFile(csvContent, finalFilename);

      return {
        success: true,
        filename: finalFilename,
        format: this.format,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        format: this.format,
        error: error instanceof Error ? error.message : 'Unknown error during export',
      };
    }
  }

  async exportSingleStation(schedule: StationSchedule, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const {
        filename,
        includeHeaders = true,
      } = options;

      const lines: string[] = [];
      
      if (includeHeaders) {
        lines.push(this.generateCSVHeaders(false));
      }

      for (const pass of schedule.passes) {
        lines.push(this.formatPassToCSVRow(pass, false));
      }

      const csvContent = lines.join('\n');
      const stationSafeName = schedule.stationName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const finalFilename = filename || this.generateFilename(`passes_${stationSafeName}`);
      
      this.downloadFile(csvContent, finalFilename);

      return {
        success: true,
        filename: finalFilename,
        format: this.format,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        format: this.format,
        error: error instanceof Error ? error.message : 'Unknown error during export',
      };
    }
  }
}

