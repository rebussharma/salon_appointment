import { CheckCircle as CheckIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography
} from '@mui/material';

interface CancelSuccessProps {
  open: boolean;
  onClose: () => void;
  confirmationNumber: string;
}

export default function CancelSuccess({
  open,
  onClose,
  confirmationNumber
}: CancelSuccessProps) {
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
        <CheckIcon sx={{ 
          fontSize: 64, 
          color: '#34D399',
          mb: 2
        }} />
        
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: '#111827',
          mb: 1
        }}>
          Appointment Cancelled
        </Typography>
        
        <Typography sx={{ 
          color: '#6B7280',
          mb: 4
        }}>
          Your appointment has been successfully cancelled.
        </Typography>

        {/* <Box sx={{ 
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          p: 3,
          mb: 3
        }}>
          <Typography sx={{ color: '#4B5563' }}>
            Confirmation Number: {confirmationNumber}
          </Typography>
        </Box> */}

        <Typography variant="body2" sx={{ color: '#4B5563' }}>
          You can book a new appointment anytime through our booking system.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#2b2b2b' }
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
