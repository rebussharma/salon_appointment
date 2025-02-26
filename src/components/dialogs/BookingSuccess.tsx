import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
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

const InfoRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px'
});

const DetailText = styled(Typography)({
  fontSize: '0.95rem',
  color: '#374151'
});

interface BookingSuccessProps {
  open: boolean;
  setView: (view: string) => void;
  bookingDetails: {
    confirmationNumber: string|null|undefined;  // Added this
    name: string;
    date: Date;
    time: string;
    email?: string;
    phone?: string;
  };
}

export default function BookingSuccess({ open, setView, bookingDetails }: BookingSuccessProps) {

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
          Booking Confirmed!
        </Typography>
        
        <Typography sx={{ 
          color: '#6B7280',
          mb: 4
        }}>
          Thank you for your booking. We've sent a confirmation to your contact information.
        </Typography>

        <Box sx={{ 
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          p: 3,
          mb: 3
        }}>
          <Typography sx={{ 
            fontWeight: 600, 
            color: '#111827',
            mb: 2
          }}>
            Confirmation Number: {bookingDetails.confirmationNumber}
          </Typography>
          <InfoRow>
            <CalendarIcon sx={{ color: '#6B7280' }} />
            <DetailText>
              {bookingDetails.date.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DetailText>
          </InfoRow>
          
          <InfoRow>
            <TimeIcon sx={{ color: '#6B7280' }} />
            <DetailText>{bookingDetails.time}</DetailText>
          </InfoRow>
          
          <InfoRow>
            <LocationIcon sx={{ color: '#6B7280' }} />
            <DetailText>123 Fake Street, Austin TX 78663</DetailText>
          </InfoRow>

          {(bookingDetails.email || bookingDetails.phone) && (
            <InfoRow>
              <EmailIcon sx={{ color: '#6B7280' }} />
              <DetailText>
                Confirmation sent to: {bookingDetails.email || bookingDetails.phone}
              </DetailText>
            </InfoRow>
          )}
        </Box>

        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography sx={{ fontWeight: 500, mb: 1 }}>Important Information:</Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • Please arrive 5-10 minutes before your appointment time
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            • If you need to cancel or reschedule, please do so at least 24 hours in advance
          </Typography>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            • For any questions, please call us at (555) 123-4567
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={()=>setView('main')} 
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
