import {
  ArrowForward as ArrowIcon,
  CalendarMonth as CalendarIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

import '../../styles/MainBook.css';
// Import the new API hooks instead of direct functions
import { useAPI } from '../../hooks/useApi';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
}

interface MainBookProps {
  onNewBooking: () => void;
  onUpdateBooking: (confirmationNumber: string, appointmentData?: any) => void;
  onCancellationResult: (success: boolean, errorSource?: string, view?: string, confirmationNumber?: string) => void;
  showConfirmationDialog: boolean;
  onCloseConfirmationDialog: () => void;
  retryAction?: 'update' | 'cancel';  // New prop to handle retry action type
}

export default function MainBook({ 
  onNewBooking, 
  onUpdateBooking, 
  onCancellationResult,
  showConfirmationDialog,
  onCloseConfirmationDialog,
  retryAction
}: MainBookProps) {
  // State for the dialog and confirmation number
  const [confirmationDialog, setConfirmationDialog] = useState<'update' | 'cancel' | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Use our new API hook
  const { 
    isLoading, 
    error, 
    errorSource,
    getAppointmentByCode,
    cancelBooking,
    clearError 
  } = useAPI();

  // Set confirmation dialog type when retrying
  useEffect(() => {
    if (showConfirmationDialog && retryAction) {
      setConfirmationDialog(retryAction);
      clearError(); // Clear any previous errors
    }
  }, [showConfirmationDialog, retryAction, clearError]);

  const handleSubmit = async () => {
    try {
      // Use either the local state or retry action type
      const currentAction = confirmationDialog || retryAction;
      
      if (currentAction === 'update') {
        // Use the new API hook method instead of direct function call
        const appointmentData = await getAppointmentByCode(confirmationNumber, 'view');
        
        if (appointmentData) {
          onUpdateBooking(confirmationNumber, appointmentData);
        } else {
          // Convert null to undefined to match expected types
          const errorSourceValue = errorSource || undefined;
          onCancellationResult(false, errorSourceValue, 'update', confirmationNumber);
        }
      } else if (currentAction === 'cancel') {
        // Use the new API hook method for cancellation
        const success = await cancelBooking(confirmationNumber);
        // Convert null to undefined to match expected types
        const errorSourceValue = errorSource || undefined;
        onCancellationResult(success, errorSourceValue, 'cancel', confirmationNumber);
      }
      
      handleClose();
    } catch (error: any) {
      console.error("Error in handling submission:", error.message);
      const currentAction = confirmationDialog || retryAction;
      onCancellationResult(false, "handleSubmit", currentAction || 'cancel', confirmationNumber);
    }
  };

  const handleClose = () => {
    setConfirmationDialog(null);
    setConfirmationNumber('');
    clearError(); // Clear any errors when closing
    onCloseConfirmationDialog();
  };

  const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    title,
    description,
    onClick,
    color = '#000000',
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        cursor: 'pointer',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        boxShadow: 'inset 5em 1em black',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'inset -5em -1em black',
          borderColor: color,
          '& .icon-box': {
            backgroundColor: color,
            color: 'white',
          },
          '& .arrow': {
            color: color,
            transform: 'translateX(4px)',
          }
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          className="icon-box"
          sx={{
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            p: 1.5,
            color: '#6b7280',
            transition: 'all 0.2s ease',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="p" sx={{ mb: 0.5, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ArrowIcon 
          className="arrow"
          sx={{ 
            color: '#d1d5db',
            transition: 'all 0.2s ease'
          }} 
        />
      </Box>
    </Paper>
  );

  return (
    <ErrorBoundary>
      <Box sx={{ 
        maxWidth: '600px', 
        mx: 'auto', 
        p: 3,
        pt: 4,
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ 
            mb: 5,
            fontWeight: 700,
            color: '#111827'
          }}
        >
          Manage Your Appointments
        </Typography>

        <ActionButton
          icon={<CalendarIcon />}
          title="Book New Appointment"
          description="Schedule a new appointment with our available artists"
          onClick={onNewBooking}
          color="#000000"
        />

        <ActionButton
          icon={<EditIcon />}
          title="Update/Reschedule Appointment"
          description="Modify or reschedule your existing appointment"
          onClick={() => setConfirmationDialog('update')}
          color="#000000"
        />

        <ActionButton
          icon={<CancelIcon />}
          title="Cancel Appointment"
          description="Cancel an existing appointment"
          onClick={() => setConfirmationDialog('cancel')}
          color="#dc2626"
        />

        <Dialog 
          open={!!confirmationDialog || showConfirmationDialog} 
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle sx={{ pt: 3, px: 3 }}>
            <Typography variant="h6" component='p' sx={{ fontWeight: 600 }}>
              {(confirmationDialog || retryAction) === 'update' ? 'Update Appointment' : 'Cancel Appointment'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography sx={{ mb: 2, color: '#6b7280' }}>
              Please enter your booking confirmation number
            </Typography>
            <TextField
              fullWidth
              label="Confirmation Number"
              type='number'
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              autoFocus
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              disabled={isLoading}
              sx={{
                borderColor: '#000000',
                color: '#000000',
                '&:hover': {
                  borderColor: '#2b2b2b',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={!confirmationNumber || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                backgroundColor: '#000000',
                '&:hover': { backgroundColor: '#2b2b2b' }
              }}
            >
              {isLoading 
                ? 'Processing...' 
                : (confirmationDialog || retryAction) === 'update' 
                  ? 'Update'
                  : 'Submit'
              }
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
}