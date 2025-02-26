
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  styled,
  Typography
} from '@mui/material';

import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { ServiceStructure, SubService } from '../../utils/types'; // Add this import
import { formatDateWithDay, formatDuration } from '../../utils/utils';

const SectionTitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '12px'
});

const DetailText = styled(Typography)({
  fontSize: '0.95rem',
  color: '#374151'
});

const LightText = styled(Typography)({
  fontSize: '0.95rem',
  color: '#6B7280'
});

interface BookingConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedServices: SubService[];
  services: ServiceStructure;  // Update this type
  selectedArtist: string;
  selectedDate: Date;
  selectedTime: string;
  clientInfo: {
    name: string;
    emailId: string;
    phone: string;
    message: string;
  };
}

export default function BookingConfirmation({
  open,
  onClose,
  onConfirm,
  selectedServices,
  services,
  selectedArtist,
  selectedDate,
  selectedTime,
  clientInfo
}: BookingConfirmationProps) {
  
  const calculateTotal = () => 
    selectedServices.reduce((total, service) => total + service.price, 0);

  const calculateTotalTime = () => 
    selectedServices.reduce((total, service) => total + service.duration, 0);   

  return (
 <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px' }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        fontSize: '1.3rem',
        fontWeight: 600,
        color: '#111827',
        textAlign:'center'
      }}>
        Confirm Your Booking
      </DialogTitle>
      <DialogContent>
        {/* Services Section */}
        <Box sx={{ mb: 4 }}>
          <SectionTitle>Selected Services</SectionTitle>
          {selectedServices.map(service => (
            <Box key={service.id} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              px: 1
            }}>
              <DetailText>{service.name}</DetailText>
              <DetailText>${service.price}</DetailText>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 600, color: '#111827' }}>Total</Typography>
              <Typography sx={{ fontWeight: 600, color: '#111827' }}>${calculateTotal()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <LightText>Duration</LightText>
              <DetailText>{formatDuration(calculateTotalTime())}</DetailText>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <CalendarIcon color="action" />
              <LightText>Date & Time</LightText>
              <DetailText>{formatDateWithDay(selectedDate)} at {selectedTime}</DetailText>
            </Box>
          </Box>
        </Box>

        {/* User Information Section */}
        <Box>
          <SectionTitle>Your Information</SectionTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1 }}>
            <DetailText>Name: {clientInfo.name}</DetailText>
            {clientInfo.emailId && <DetailText>Email: {clientInfo.emailId}</DetailText>}
            {clientInfo.phone && <DetailText>Phone: {clientInfo.phone}</DetailText>}
            {clientInfo.message && (
              <Box sx={{ mt: 1 }}>
                <LightText sx={{ mb: 0.5 }}>Message to Artist:</LightText>
                <DetailText sx={{ pl: 2 }}>{clientInfo.message}</DetailText>
              </Box>
            )}
          </Box>
        </Box>
        </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              borderColor: '#2b2b2b',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Edit Booking
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#2b2b2b' }
          }}
        >
          Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}