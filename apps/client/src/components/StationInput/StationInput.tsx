import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAppStore } from '../../stores';
import {
  validateLatitude,
  validateLongitude,
  validateAltitude,
  validateElevation,
} from '../../services/utils';
import { APP_CONFIG, POPULAR_STATIONS } from '../../constants';

export const StationInput = () => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [minElevation, setMinElevation] = useState(String(APP_CONFIG.DEFAULT_MIN_ELEVATION));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stations = useAppStore((state) => state.stations);
  const addStation = useAppStore((state) => state.addStation);
  const removeStation = useAppStore((state) => state.removeStation);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Введите название';
    }

    const lat = Number(latitude);
    if (!latitude || !validateLatitude(lat)) {
      newErrors.latitude = `Широта должна быть от ${APP_CONFIG.MIN_LATITUDE} до ${APP_CONFIG.MAX_LATITUDE}`;
    }

    const lng = Number(longitude);
    if (!longitude || !validateLongitude(lng)) {
      newErrors.longitude = `Долгота должна быть от ${APP_CONFIG.MIN_LONGITUDE} до ${APP_CONFIG.MAX_LONGITUDE}`;
    }

    const alt = Number(altitude);
    if (!altitude || !validateAltitude(alt)) {
      newErrors.altitude = `Высота должна быть от ${APP_CONFIG.MIN_ALTITUDE} до ${APP_CONFIG.MAX_ALTITUDE} м`;
    }

    const elev = Number(minElevation);
    if (!minElevation || !validateElevation(elev)) {
      newErrors.minElevation = `Угол должен быть от ${APP_CONFIG.MIN_ELEVATION} до ${APP_CONFIG.MAX_ELEVATION}°`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;

    const station = {
      id: `${Date.now()}-${Math.random()}`,
      name: name.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      altitude: Number(altitude),
      minElevation: Number(minElevation),
    };

    addStation(station);
    
    setName('');
    setLatitude('');
    setLongitude('');
    setAltitude('');
    setMinElevation(String(APP_CONFIG.DEFAULT_MIN_ELEVATION));
    setErrors({});
  };

  const handleQuickAdd = (popularStation: typeof POPULAR_STATIONS[number]) => {
    const station = {
      id: `${Date.now()}-${Math.random()}`,
      name: popularStation.name,
      latitude: popularStation.latitude,
      longitude: popularStation.longitude,
      altitude: popularStation.altitude,
      minElevation: APP_CONFIG.DEFAULT_MIN_ELEVATION,
    };
    addStation(station);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Наземные станции
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Популярные станции:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {POPULAR_STATIONS.map((station) => (
            <Chip
              key={station.name}
              label={station.name}
              onClick={() => handleQuickAdd(station)}
              size="small"
              title={station.description}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Название станции"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            size="small"
          />
        </Box>
        <TextField
          fullWidth
          label="Широта"
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          error={!!errors.latitude}
          helperText={errors.latitude}
          size="small"
          inputProps={{ step: 0.0001 }}
        />
        <TextField
          fullWidth
          label="Долгота"
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          error={!!errors.longitude}
          helperText={errors.longitude}
          size="small"
          inputProps={{ step: 0.0001 }}
        />
        <TextField
          fullWidth
          label="Высота (м)"
          type="number"
          value={altitude}
          onChange={(e) => setAltitude(e.target.value)}
          error={!!errors.altitude}
          helperText={errors.altitude}
          size="small"
        />
        <TextField
          fullWidth
          label="Мин. угол возвышения (°)"
          type="number"
          value={minElevation}
          onChange={(e) => setMinElevation(e.target.value)}
          error={!!errors.minElevation}
          helperText={errors.minElevation}
          size="small"
        />
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Добавить станцию
          </Button>
        </Box>
      </Box>

      <List>
        {stations.map((station) => (
          <ListItem
            key={station.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => removeStation(station.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={station.name}
              secondary={`Lat: ${station.latitude.toFixed(4)}°, Lng: ${station.longitude.toFixed(4)}°, Alt: ${station.altitude}м, Min El: ${station.minElevation}°`}
            />
          </ListItem>
        ))}
        {stations.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Добавьте наземные станции для наблюдения
          </Typography>
        )}
      </List>
    </Paper>
  );
};

