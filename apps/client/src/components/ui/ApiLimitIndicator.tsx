import { Box, Tooltip, Chip } from '@mui/material';
import { useAppStore } from '../../stores';
import { APP_CONFIG } from '../../constants';

export const ApiLimitIndicator = () => {
  const apiTransactionsCount = useAppStore((state) => state.apiTransactionsCount);
  const apiTransactionsTimestamp = useAppStore((state) => state.apiTransactionsTimestamp);

  if (apiTransactionsCount === 0 || apiTransactionsTimestamp === 0) {
    return null;
  }

  const percentage = (apiTransactionsCount / APP_CONFIG.API_REQUESTS_PER_HOUR) * 100;
  const isWarning = percentage > 70;
  const isDanger = percentage > 90;

  const color = isDanger ? 'error' : isWarning ? 'warning' : 'success';
  
  const timeAgo = apiTransactionsTimestamp 
    ? Math.floor((Date.now() - apiTransactionsTimestamp) / 1000 / 60)
    : 0;

  const tooltipText = `Использовано ${apiTransactionsCount} из ${APP_CONFIG.API_REQUESTS_PER_HOUR} запросов в час. ${
    timeAgo > 0 ? `Обновлено ${timeAgo} мин. назад.` : 'Только что обновлено.'
  }`;

  return (
    <Tooltip title={tooltipText} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`${apiTransactionsCount}/${APP_CONFIG.API_REQUESTS_PER_HOUR}`}
          color={color}
          size="medium"
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            minWidth: 100,
            '& .MuiChip-label': {
              px: 2,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

