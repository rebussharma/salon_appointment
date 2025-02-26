import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            textAlign: 'center'
          }}
        >
          <ErrorIcon 
            sx={{ 
              fontSize: 64,
              color: 'error.main',
              mb: 2
            }}
          />
          <Typography variant="h5" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We're sorry, but we encountered an unexpected error.
            Please try refreshing the page or contact support if the issue persists.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderColor: '#000000',
                color: '#000000',
                '&:hover': {
                  borderColor: '#2b2b2b',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Refresh Page
            </Button>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                backgroundColor: '#000000',
                '&:hover': { backgroundColor: '#2b2b2b' }
              }}
            >
              Try Again
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}