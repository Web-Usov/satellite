import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useAppStore } from '../../stores';
import {
  formatTimestamp,
  formatTime,
  formatElevation,
  formatAzimuth,
  formatDuration,
} from '../../services/utils';
import { exportManager } from '../../services/export';
import type { PassData, StationSchedule as StationScheduleType } from '../../types';

export const StationSchedule = () => {
  const schedules = useAppStore((state) => state.schedules);
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
  const [exporting, setExporting] = useState(false);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const result = await exportManager.export('csv', schedules);
      if (!result.success) {
        console.error('Export failed:', result.error);
        alert(`Ошибка экспорта: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setExporting(false);
    }
  };

  const handleExportStation = async (schedule: StationScheduleType, event: React.MouseEvent) => {
    event.stopPropagation();
    setExporting(true);
    try {
      const result = await exportManager.exportSingleStation('csv', schedule);
      if (!result.success) {
        console.error('Export failed:', result.error);
        alert(`Ошибка экспорта: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setExporting(false);
    }
  };

  const columns: GridColDef<PassData>[] = [
    {
      field: 'satelliteName',
      headerName: 'Спутник',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'startUTC',
      headerName: 'Начало (UTC)',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: 'maxUTC',
      headerName: 'Максимум (UTC)',
      flex: 1,
      minWidth: 80,
      valueFormatter: (value) => formatTime(value),
    },
    {
      field: 'endUTC',
      headerName: 'Окончание (UTC)',
      flex: 1,
      minWidth: 80,
      valueFormatter: (value) => formatTime(value),
    },
    {
      field: 'duration',
      headerName: 'Длительность',
      width: 120,
      valueGetter: (_, row) => formatDuration(row.startUTC, row.endUTC),
    },
    {
      field: 'maxEl',
      headerName: 'Макс. угол',
      width: 110,
      valueFormatter: (value) => formatElevation(value),
    },
    {
      field: 'startAz',
      headerName: 'Азимут начала',
      width: 140,
      valueGetter: (_, row) => formatAzimuth(row.startAz, row.startAzCompass),
    },
    {
      field: 'endAz',
      headerName: 'Азимут окончания',
      width: 160,
      valueGetter: (_, row) => formatAzimuth(row.endAz, row.endAzCompass),
    },
  ];

  if (schedules.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Расписание проходов
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Добавьте спутники и станции, затем нажмите "Рассчитать проходы" для получения расписания
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Расписание проходов
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportAll}
          disabled={exporting || schedules.length === 0}
          size="small"
        >
          Экспорт CSV
        </Button>
      </Box>

      {schedules.map((schedule) => (
        <Accordion
          key={schedule.stationId}
          expanded={expandedPanel === schedule.stationId}
          onChange={handleChange(schedule.stationId)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {schedule.stationName}
                </Typography>
                <Chip
                  label={`${schedule.passes.length} проходов`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Tooltip title="Экспортировать эту станцию">
                <IconButton
                  size="small"
                  onClick={(e) => handleExportStation(schedule, e)}
                  disabled={exporting}
                  sx={{ mr: 1 }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={schedule.passes}
                columns={columns}
                getRowId={(row) => `${row.satelliteName}-${row.startUTC}`}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                  sorting: {
                    sortModel: [{ field: 'startUTC', sort: 'asc' }],
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                density="compact"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Всего найдено {schedules.reduce((sum, s) => sum + s.passes.length, 0)} проходов
      </Typography>
    </Paper>
  );
};

