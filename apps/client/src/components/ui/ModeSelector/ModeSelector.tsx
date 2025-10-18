import { ToggleButton, ToggleButtonGroup, Tooltip, Paper, Typography, Box } from '@mui/material';
import { useAppStore } from '../../../stores';
import { CALCULATION_MODES, type CalculationMode } from '../../../types';

export function ModeSelector() {
  const { calculationMode, setCalculationMode } = useAppStore();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newMode: CalculationMode | null) => {
    if (newMode !== null) {
      setCalculationMode(newMode);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Режим расчета
      </Typography>

      <Box>
        <ToggleButtonGroup
          value={calculationMode}
          exclusive
          onChange={handleChange}
          aria-label="text alignment"
          fullWidth={true}
          color="primary"

        >
          {CALCULATION_MODES.map((mode) => (
            <Tooltip
              key={mode.id}
              title={mode.enabled ? mode.description : `${mode.description} (недоступно)`}
              arrow
              placement="top"
            >
              <span style={{ flex: 1, display: 'flex' }}>
                <ToggleButton
                  value={mode.id}
                  aria-label={mode.name}
                  disabled={!mode.enabled}
                  sx={{ width: '100%' }}
                >
                  {mode.name}
                </ToggleButton>
              </span>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

      </Box>
    </Paper>
  );
}

