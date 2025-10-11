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
import { validateNoradId } from '../../services/utils';
import { POPULAR_SATELLITES } from '../../constants';

export const SatelliteInput = () => {
  const [noradId, setNoradId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const satellites = useAppStore((state) => state.satellites);
  const addSatellite = useAppStore((state) => state.addSatellite);
  const removeSatellite = useAppStore((state) => state.removeSatellite);

  const handleAdd = () => {
    const id = Number(noradId);
    
    if (!noradId || !name.trim()) {
      setError('Заполните все поля');
      return;
    }

    if (!validateNoradId(id)) {
      setError('NORAD ID должен быть положительным целым числом');
      return;
    }

    addSatellite({ noradId: id, name: name.trim() });
    setNoradId('');
    setName('');
    setError('');
  };

  const handleQuickAdd = (satellite: { noradId: number; name: string }) => {
    addSatellite(satellite);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Спутники
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Популярные спутники:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {POPULAR_SATELLITES.map((sat) => (
            <Chip
              key={sat.noradId}
              label={sat.name}
              onClick={() => handleQuickAdd(sat)}
              size="small"
              title={sat.description}
            />
          ))}
        </Stack>
      </Box>

      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="NORAD ID"
          type="number"
          value={noradId}
          onChange={(e) => setNoradId(e.target.value)}
          error={!!error}
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
          size="small"
          sx={{ flex: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ minWidth: 100 }}
        >
          Добавить
        </Button>
      </Box>

      <List>
        {satellites.map((satellite) => (
          <ListItem
            key={satellite.noradId}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => removeSatellite(satellite.noradId)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={satellite.name}
              secondary={`NORAD ID: ${satellite.noradId}`}
            />
          </ListItem>
        ))}
        {satellites.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Добавьте спутники для отслеживания
          </Typography>
        )}
      </List>
    </Paper>
  );
};

