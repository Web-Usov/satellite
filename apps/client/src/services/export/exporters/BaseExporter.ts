import type { StationSchedule } from '../../../types';
import type { ExportFormat, ExportOptions, ExportResult, IExporter } from '../types';

export abstract class BaseExporter implements IExporter {
  abstract readonly format: ExportFormat;
  abstract readonly mimeType: string;
  abstract readonly fileExtension: string;

  protected generateFilename(baseName: string = 'satellite-passes'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${baseName}_${timestamp}.${this.fileExtension}`;
  }

  protected downloadFile(content: string | Blob, filename: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: this.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  canExport(): boolean {
    return typeof window !== 'undefined' && 'Blob' in window && 'URL' in window;
  }

  abstract export(data: StationSchedule[], options?: ExportOptions): Promise<ExportResult>;
  abstract exportSingleStation(schedule: StationSchedule, options?: ExportOptions): Promise<ExportResult>;
}

