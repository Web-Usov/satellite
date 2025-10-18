import type { StationSchedule } from '../../types';
import type { ExportFormat, ExportOptions, ExportResult, IExporter } from './types';
import { CsvExporter } from './exporters/CsvExporter';

export class ExportManager {
  private exporters: Map<ExportFormat, IExporter> = new Map();

  constructor() {
    this.registerExporter(new CsvExporter());
  }

  registerExporter(exporter: IExporter): void {
    if (!exporter.canExport()) {
      console.warn(`Exporter ${exporter.format} cannot export in this environment`);
      return;
    }
    this.exporters.set(exporter.format, exporter);
  }

  unregisterExporter(format: ExportFormat): boolean {
    return this.exporters.delete(format);
  }

  getExporter(format: ExportFormat): IExporter | undefined {
    return this.exporters.get(format);
  }

  getSupportedFormats(): ExportFormat[] {
    return Array.from(this.exporters.keys());
  }

  isFormatSupported(format: ExportFormat): boolean {
    return this.exporters.has(format);
  }

  async export(
    format: ExportFormat,
    data: StationSchedule[],
    options?: ExportOptions
  ): Promise<ExportResult> {
    const exporter = this.getExporter(format);
    
    if (!exporter) {
      return {
        success: false,
        filename: '',
        format,
        error: `Exporter for format "${format}" is not registered`,
      };
    }

    return exporter.export(data, options);
  }

  async exportSingleStation(
    format: ExportFormat,
    schedule: StationSchedule,
    options?: ExportOptions
  ): Promise<ExportResult> {
    const exporter = this.getExporter(format);
    
    if (!exporter) {
      return {
        success: false,
        filename: '',
        format,
        error: `Exporter for format "${format}" is not registered`,
      };
    }

    return exporter.exportSingleStation(schedule, options);
  }

  getExporterInfo(format: ExportFormat): { mimeType: string; extension: string } | null {
    const exporter = this.getExporter(format);
    if (!exporter) {
      return null;
    }
    return {
      mimeType: exporter.mimeType,
      extension: exporter.fileExtension,
    };
  }
}

export const exportManager = new ExportManager();

