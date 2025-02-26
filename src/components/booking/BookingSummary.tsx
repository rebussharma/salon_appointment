import {
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography
} from '@mui/material';
import { ServiceStructure, SubService } from '../../utils/types'; // Add this import
import { calculateDuration, calculateTotal, formatDateWithDay, formatDuration } from '../../utils/utils';


interface BookingSummaryProps {
  selectedServices: SubService[];
  services: ServiceStructure;
  selectedArtist: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
}

export default function BookingSummary({
  selectedServices,
  services,
  selectedArtist,
  selectedDate,
  selectedTime
}: BookingSummaryProps) {
  return (
    <Card>
      <CardHeader title="Booking Summary" sx={{ textAlign:'center' }}/>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedServices.map(service => (
            <Box key={service.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>{service.name}</Typography>
              <Typography>${service.price}</Typography>
            </Box>
          ))}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClockIcon color="action" />
              <Typography>Duration</Typography>
            </Box>
            <Typography>{formatDuration(calculateDuration(selectedServices))}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="action" />
              <Typography>Total</Typography>
            </Box>
            <Typography>${calculateTotal(selectedServices)}</Typography>
          </Box>

          {selectedArtist && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" />
                <Typography>Artist</Typography>
              </Box>
              <Typography>{selectedArtist}</Typography>
            </Box>
          )}

          {selectedDate && selectedTime && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="action" />
                <Typography>Time</Typography>
              </Box>
              <Typography>
                {formatDateWithDay(selectedDate)} at {selectedTime}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}