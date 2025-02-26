// src/components/common/LoadingState/LoadingState.tsx
import { Box, CircularProgress, Fade, Typography, useTheme } from '@mui/material';
import React from 'react';

interface LoadingStateProps {
  message?: string;
  height?: string | number;
  showDelayed?: boolean;
  size?: number;
  variant?: 'default' | 'overlay' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...',
  height = '200px',
  showDelayed = true,
  size = 40,
  variant = 'default'
}) => {
  const [visible, setVisible] = React.useState(!showDelayed);
  const theme = useTheme();

  React.useEffect(() => {
    if (showDelayed) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 400); // Delay showing the loading state to avoid flashing
      return () => clearTimeout(timer);
    }
  }, [showDelayed]);

  if (variant === 'overlay') {
    return (
      <Fade in={visible} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            zIndex: theme.zIndex.modal - 1,
            borderRadius: 'inherit'
          }}
        >
          <CircularProgress
            size={size}
            sx={{
              color: '#000000'
            }}
          />
          {message && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 2, fontWeight: 500 }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  if (variant === 'inline') {
    return (
      <Fade in={visible} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1
          }}
        >
          <CircularProgress
            size={24}
            sx={{
              color: '#000000'
            }}
          />
          {message && (
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  // Default variant
  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: height,
          gap: 2
        }}
      >
        <CircularProgress
          size={size}
          sx={{
            color: '#000000'
          }}
        />
        {message && (
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

// Specialized loading states
export const BookingLoadingState: React.FC = () => (
  <LoadingState message="Processing your booking..." />
);

export const CalendarLoadingState: React.FC = () => (
  <LoadingState message="Loading available time slots..." />
);

export const ArtistLoadingState: React.FC = () => (
  <LoadingState message="Loading artist availability..." />
);

export const OverlayLoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingState variant="overlay" message={message} />
);

export const InlineLoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingState variant="inline" message={message} showDelayed={false} />
);