import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  LinearProgress,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAppStore } from '../../stores';
import { n2yoClient } from '../../services';
import { ErrorAlert } from '../ui';
import { APP_CONFIG } from '../../constants';
import type { StationSchedule } from '../../types';

export const CalculateButton = () => {
  const [localError, setLocalError] = useState<string | null>(null);

  const satellites = useAppStore((state) => state.satellites);
  const stations = useAppStore((state) => state.stations);
  const days = useAppStore((state) => state.days);
  const isCalculating = useAppStore((state) => state.isCalculating);
  const progress = useAppStore((state) => state.progress);
  const totalRequests = useAppStore((state) => state.totalRequests);
  const error = useAppStore((state) => state.error);

  const setDays = useAppStore((state) => state.setDays);
  const setSchedules = useAppStore((state) => state.setSchedules);
  const setCalculating = useAppStore((state) => state.setCalculating);
  const setError = useAppStore((state) => state.setError);
  const setProgress = useAppStore((state) => state.setProgress);

  const handleCalculate = async () => {
    if (satellites.length === 0) {
      setLocalError('Добавьте хотя бы один спутник');
      return;
    }

    if (stations.length === 0) {
      setLocalError('Добавьте хотя бы одну станцию');
      return;
    }

    setLocalError(null);
    setError(null);
    setCalculating(true);
    setProgress(0, satellites.length * stations.length);

    try {
      const noradIds = satellites.map((s) => s.noradId);
      
      const passesMap = await n2yoClient.getAllPasses(
        noradIds,
        stations,
        days,
        (current, total) => {
          setProgress(current, total);
        }
      );

      const schedules: StationSchedule[] = [];
      for (const station of stations) {
        const passes = passesMap.get(station.id) || [];
        schedules.push({
          stationId: station.id,
          stationName: station.name,
          passes,
        });
      }

      setSchedules(schedules);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при расчете проходов';
      setError(message);
    } finally {
      setCalculating(false);
    }
  };

  const progressPercent = totalRequests > 0 ? (progress / totalRequests) * 100 : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Расчет проходов
      </Typography>

      {(localError || error) && (
        <ErrorAlert
          message={localError || error || ''}
          onClose={() => {
            setLocalError(null);
            setError(null);
          }}
        />
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Период прогнозирования (дни)"
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          inputProps={{
            min: APP_CONFIG.MIN_DAYS,
            max: APP_CONFIG.MAX_DAYS,
          }}
          size="small"
          disabled={isCalculating}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        startIcon={<CalculateIcon />}
        onClick={handleCalculate}
        disabled={isCalculating || satellites.length === 0 || stations.length === 0}
      >
        {isCalculating
          ? `Расчет... (${progress}/${totalRequests})`
          : 'Рассчитать проходы'}
      </Button>

      {isCalculating && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progressPercent} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Выполнено {progress} из {totalRequests} запросов ({progressPercent.toFixed(0)}%)
          </Typography>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Будет выполнено {satellites.length} × {stations.length} ={' '}
        {satellites.length * stations.length} запросов к API
      </Typography>
    </Paper>
  );
};

