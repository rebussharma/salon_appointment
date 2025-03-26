import { Error as ErrorIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';

interface CancelFailProps {
  open: boolean;
  onClose: () => void;
  onTryAgain: () => void;  // New prop for handling try again action
  cancellationErrorSource: { errorSource?: string; view?: string };
  confirmationNumber: string;
}

export default function CancelFail({
  open,
  onClose,
  onTryAgain,
  cancellationErrorSource,
  confirmationNumber
}: CancelFailProps) {
  const isUpdate = cancellationErrorSource?.view 
  ? 
  cancellationErrorSource.view.includes('update') 
  : 
  false;
  const actionType = isUpdate ? "Update" : "Cancel";
  
  const getErrorMessage = () => {

    if (cancellationErrorSource.errorSource?.includes("getAppointmentByConfirmationCode")) {
      return {
        title: "Invalid Confirmation Number",
        message: "We couldn't find an appointment with this confirmation number. Please verify and try again.",
        details: "If you believe this is an error, please contact our support team."
      };
    } else if (cancellationErrorSource.errorSource?.includes("pushCancelData")) {
      return {
        title: `${cancellationErrorSource.view?.includes('update')? "Update" :  "Cancellation"} Failed`,
        message: `Your appointment was found but we were unable ${actionType.toLowerCase()} it.`,
        details: "Please try again or contact our support team for immediate assistance."
      };
    } else {
      return {
        title: "System Error",
        message: "Something went wrong while processing your request.",
        details: "This might be temporary. Please try again in a few minutes or contact support."
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px' }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <ErrorIcon sx={{ 
          fontSize: 64, 
          color: '#EF4444',
          mb: 2
        }} />
        
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: '#111827',
          mb: 1
        }}>
          {errorInfo.title}
        </Typography>
        
        <Typography sx={{ 
          color: '#6B7280',
          mb: 4
        }}>
          {errorInfo.message}
        </Typography>

        <Box sx={{ 
          backgroundColor: '#FEF2F2',
          borderRadius: '8px',
          p: 3,
          mb: 3
        }}>
          <Typography sx={{ color: '#B91C1C', mb: 2 }}>
            Failed to {actionType.toLowerCase()} appointment: {confirmationNumber}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            {errorInfo.details}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            You can:
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • Double-check your confirmation number and try again
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • Contact our support team at (555) 123-4567
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            • Email us at support@example.com
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
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
          onClick={onTryAgain} 
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#2b2b2b' }
          }}
        >
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );
}