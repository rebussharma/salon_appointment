import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#6b7280',
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: '8px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#9ca3af',
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        }
      }
    }
  },
});