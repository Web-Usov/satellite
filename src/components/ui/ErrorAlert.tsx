import { Alert, AlertTitle } from '@mui/material';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const ErrorAlert = ({ title = 'Ошибка', message, onClose }: ErrorAlertProps) => {
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

