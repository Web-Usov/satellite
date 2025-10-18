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
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useAppStore } from '../../stores';
import { validateTLEPair } from '../../services/utils';
import type { UserTLE } from '../../types';

export const TLEInput = () => {
  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const userTLEs = useAppStore((state) => state.userTLEs);
  const addUserTLE = useAppStore((state) => state.addUserTLE);
  const updateUserTLE = useAppStore((state) => state.updateUserTLE);
  const removeUserTLE = useAppStore((state) => state.removeUserTLE);

  const handleAdd = () => {
    if (!name.trim()) {
      setError('Введите название спутника');
      return;
    }

    if (!line1.trim() || !line2.trim()) {
      setError('Введите обе строки TLE');
      return;
    }

    const validation = validateTLEPair(line1, line2);
    if (!validation.isValid) {
      setError(validation.error || 'Неверный формат TLE');
      return;
    }

    const preparedLine1 = validation.preparedLine1 || line1.trim();
    const preparedLine2 = validation.preparedLine2 || line2.trim();

    if (editingId) {
      updateUserTLE(editingId, {
        name: name.trim(),
        line1: preparedLine1,
        line2: preparedLine2,
      });
      setEditingId(null);
    } else {
      const newTLE: UserTLE = {
        id: `tle-${Date.now()}`,
        name: name.trim(),
        line1: preparedLine1,
        line2: preparedLine2,
        createdAt: Date.now(),
      };
      addUserTLE(newTLE);
    }

    setName('');
    setLine1('');
    setLine2('');
    setError('');
  };

  const handleEdit = (tle: UserTLE) => {
    setName(tle.name);
    setLine1(tle.line1);
    setLine2(tle.line2);
    setEditingId(tle.id);
    setError('');
  };

  const handleCancelEdit = () => {
    setName('');
    setLine1('');
    setLine2('');
    setEditingId(null);
    setError('');
  };

  const handleRemove = (id: string) => {
    removeUserTLE(id);
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        TLE данные
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Введите TLE вручную для оффлайн расчетов
      </Typography>

      <Box>
        <TextField
          label="Название спутника"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
          error={!!error && !name.trim()}
        />

        <TextField
          label="TLE Строка 1"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 1.5 }}
          error={!!error && !line1.trim()}
          placeholder="1 25544U 98067A   ..."
          slotProps={{
            htmlInput: {
              style: { fontFamily: 'monospace', fontSize: '0.85rem' }
            }
          }}
        />

        <TextField
          label="TLE Строка 2"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 1.5 }}
          error={!!error && !line2.trim()}
          placeholder="2 25544  51.6461 339.9003 ..."
          slotProps={{
            htmlInput: {
              style: { fontFamily: 'monospace', fontSize: '0.85rem' }
            }
          }}
        />

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        </Collapse>

        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={editingId ? <EditIcon /> : <AddIcon />}
            onClick={handleAdd}
            fullWidth
          >
            {editingId ? 'Обновить' : 'Добавить'}
          </Button>
          {editingId && (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Отмена
            </Button>
          )}
        </Box>
      </Box>

      {userTLEs.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Добавленные TLE ({userTLEs.length}):
          </Typography>
          <List dense>
            {userTLEs.map((tle) => (
              <ListItem
                key={tle.id}
                sx={{
                  bgcolor: editingId === tle.id ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                  mb: 0.5,
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleEdit(tle)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemove(tle.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={tle.name}
                  secondary={
                    <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      {tle.line1.substring(0, 20)}...
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

