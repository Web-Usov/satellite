import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Box, Container, Typography, AppBar, Toolbar } from '@mui/material';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import {
  SatelliteInput,
  StationInput,
  CalculateButton,
  StationSchedule,
} from './components';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <SatelliteAltIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Satellite Pass Predictor
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
            gap: 3,
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>
            <SatelliteInput />
            <StationInput />
            <CalculateButton />
          </Box>

          <Box>
            <StationSchedule />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
