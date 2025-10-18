import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useAppStore } from '../../stores';
import {
  formatTimestamp,
  formatTime,
  formatElevation,
  formatAzimuth,
  formatDuration,
} from '../../services/utils';
import type { PassData } from '../../types';

export const StationSchedule = () => {
  const schedules = useAppStore((state) => state.schedules);
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
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
      <Typography variant="h6" gutterBottom>
        Расписание проходов
      </Typography>

      {schedules.map((schedule) => (
        <Accordion
          key={schedule.stationId}
          expanded={expandedPanel === schedule.stationId}
          onChange={handleChange(schedule.stationId)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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

