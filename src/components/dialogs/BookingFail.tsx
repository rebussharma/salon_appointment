import {
  Email as EmailIcon,
  Error as ErrorIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  styled,
  Typography
} from '@mui/material';

const DetailText = styled(Typography)({
  fontSize: '0.95rem',
  color: '#374151'
});

interface BookingFailProps {
  open: boolean;
  setView: (view: string) => void;
  error?: string;
  clientInfo: {
    name: string;
    emailId?: string;
    phone?: string;
  };
}

export default function BookingFail({ 
  open, 
  setView, 
  error,
  clientInfo 
}: BookingFailProps) {
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
          Booking Failed
        </Typography>
        
        <Typography sx={{ 
          color: '#6B7280',
          mb: 4
        }}>
          We're sorry, but we couldn't complete your booking at this time.
        </Typography>

        <Box sx={{ 
          backgroundColor: '#FEF2F2',
          borderRadius: '8px',
          p: 3,
          mb: 3
        }}>
          <Typography sx={{ 
            color: '#B91C1C',
            mb: 2
          }}>
            {error || 'An unexpected error occurred. Please try again later.'}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            alignItems: 'flex-start',
            mt: 2
          }}>
            <Typography sx={{ fontWeight: 500, color: '#111827' }}>
              For immediate assistance:
            </Typography>
            {clientInfo.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                <DetailText>Call us at: (555) 123-4567</DetailText>
              </Box>
            )}
            {clientInfo.emailId && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                <DetailText>Email us at: support@example.com</DetailText>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            You can:
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • Try booking again in a few minutes
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • Contact our support team for assistance
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            • Try selecting different time slots or services
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={() => setView('main')} 
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#2b2b2b' }
          }}
        >
          Return to Main Menu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
