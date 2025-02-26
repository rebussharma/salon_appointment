import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { getLastPossibleBookingTime, hasAvailableTimeSlots, isWithinStoreHours } from '../../utils/dateTimeSelection.utils';
import { Artist, DateTimeSelectionProps, WorkDay } from '../../utils/types';
import { generateTimeSlots } from '../../utils/utils';
import { ValidationError } from './BookingSystem';

type DisplayMode = 'initial' | 'expanded' | 'all';

const storeOpenTime = "09:00";
const storeCloseTime = "21:00";

const DateTimeSelection: FC<DateTimeSelectionProps> = ({
  selectedArtist,
  selectedDate,
  selectedTime,
  displayMonth,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  isExpanded,
  hasError,
  errorStyle,
  appointmentDuration
}) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('initial');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | null>(null);

  const isDateFullyBooked = (artist: Artist, date: Date): boolean => {
    if (!artist?.dateTimeDto?.length) return false;

    const dateString = date.toISOString().slice(0, 10);
    const dayAppointments = artist.dateTimeDto
      .filter(appt => appt.appointmentDateTimeStart.startsWith(dateString))
      .sort((a, b) => 
        new Date(a.appointmentDateTimeStart).getTime() - new Date(b.appointmentDateTimeStart).getTime()
      );

    if (!dayAppointments.length) return false;

    const breakTime = 10; // 10 minutes break
    const totalRequiredTime = appointmentDuration + breakTime;

    // If appointment duration is 0, only need break time
    if (appointmentDuration === 0) {
      // Check if any gap is >= break time
      const hasValidGap = dayAppointments.some((appt, index) => {
        if (index === 0) {
          // Check morning gap
          const firstStart = appt.appointmentDateTimeStart.slice(11, 16);
          const morningGap = (
            new Date(`1970-01-01T${firstStart}`).getTime() -
            new Date(`1970-01-01T${storeOpenTime}`).getTime()
          ) / (1000 * 60);
          if (morningGap >= breakTime) return true;
        }
        
        if (index < dayAppointments.length - 1) {
          // Check gap between appointments
          const currentEnd = appt.appointmentDateTimeEnd.slice(11, 16);
          const nextStart = dayAppointments[index + 1].appointmentDateTimeStart.slice(11, 16);
          const gapDuration = (
            new Date(`1970-01-01T${nextStart}`).getTime() -
            new Date(`1970-01-01T${currentEnd}`).getTime()
          ) / (1000 * 60);
          if (gapDuration >= breakTime) return true;
        } else {
          // Check evening gap
          const lastEnd = appt.appointmentDateTimeEnd.slice(11, 16);
          const eveningGap = (
            new Date(`1970-01-01T${storeCloseTime}`).getTime() -
            new Date(`1970-01-01T${lastEnd}`).getTime()
          ) / (1000 * 60);
          if (eveningGap >= breakTime) return true;
        }
        return false;
      });
      
      return !hasValidGap;
    }

    // For regular appointments, check if any gap can fit the appointment duration plus break
    const hasValidGap = dayAppointments.some((appt, index) => {
      if (index === 0) {
        // Check morning gap
        const firstStart = appt.appointmentDateTimeStart.slice(11, 16);
        const morningGap = (
          new Date(`1970-01-01T${firstStart}`).getTime() -
          new Date(`1970-01-01T${storeOpenTime}`).getTime()
        ) / (1000 * 60);
        
        // Verify the appointment wouldn't run past closing time + 1 hour
        const potentialStartTime = storeOpenTime;
        const startTimeDate = new Date(`1970-01-01T${potentialStartTime}`);
        startTimeDate.setMinutes(startTimeDate.getMinutes() + appointmentDuration);
        const endTimeStr = startTimeDate.toTimeString().slice(0, 5);
        
        if (morningGap >= totalRequiredTime && 
            endTimeStr <= "22:00") { // closing time (21:00) + 1 hour
          return true;
        }
      }
      
      if (index < dayAppointments.length - 1) {
        // Check gap between appointments
        const currentEnd = appt.appointmentDateTimeEnd.slice(11, 16);
        const nextStart = dayAppointments[index + 1].appointmentDateTimeStart.slice(11, 16);
        const gapDuration = (
          new Date(`1970-01-01T${nextStart}`).getTime() -
          new Date(`1970-01-01T${currentEnd}`).getTime()
        ) / (1000 * 60);
        
        // Verify the appointment wouldn't run past closing time + 1 hour
        const potentialStartTime = currentEnd;
        const startTimeDate = new Date(`1970-01-01T${potentialStartTime}`);
        startTimeDate.setMinutes(startTimeDate.getMinutes() + appointmentDuration);
        const endTimeStr = startTimeDate.toTimeString().slice(0, 5);
        
        if (gapDuration >= totalRequiredTime && 
            endTimeStr <= "22:00") {
          return true;
        }
      } else {
        // Check evening gap
        const lastEnd = appt.appointmentDateTimeEnd.slice(11, 16);
        const potentialStartTime = lastEnd;
        const startTimeDate = new Date(`1970-01-01T${potentialStartTime}`);
        startTimeDate.setMinutes(startTimeDate.getMinutes() + appointmentDuration);
        const endTimeStr = startTimeDate.toTimeString().slice(0, 5);
        
        if (endTimeStr <= "22:00") { // Must end by closing time + 1 hour
          const eveningGap = (
            new Date(`1970-01-01T${getLastPossibleBookingTime(appointmentDuration)}`).getTime() -
            new Date(`1970-01-01T${lastEnd}`).getTime()
          ) / (1000 * 60);
          if (eveningGap >= totalRequiredTime) return true;
        }
      }
      return false;
    });

    return !hasValidGap;
  };

  const isDateAvailable = (date: Date): boolean => {
    if (!selectedArtist) return false;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return false;
    }
    
    if (date.getTime() === today.getTime() && now.getHours() >= 19) {
      return false;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }) as WorkDay;

    // Check work days
    if (!selectedArtist.workday.includes('Alldays')) {
      if (selectedArtist.workday.includes('Weekdays') && ['Saturday', 'Sunday'].includes(dayOfWeek)) {
        return false;
      }
      if (selectedArtist.workday.includes('Weekends') && !['Saturday', 'Sunday'].includes(dayOfWeek)) {
        return false;
      }
      if (!selectedArtist.workday.includes('Weekdays') && 
          !selectedArtist.workday.includes('Weekends') && 
          !selectedArtist.workday.includes(dayOfWeek)) {
        return false;
      }
    }

    return hasAvailableTimeSlots(date, selectedArtist, appointmentDuration);
  };

  const findNextAvailableDate = (startDate: Date): Date | null => {
    if (!selectedArtist) return null;

    const maxDaysToCheck = 60;
    let currentDate = new Date(startDate);
    let daysChecked = 0;

    while (daysChecked < maxDaysToCheck) {
      if (isDateAvailable(currentDate)) {
        const nextAvailable = getNextAvailableTimeForDate(selectedArtist, currentDate);
        if (nextAvailable) {
          return new Date(nextAvailable);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }

    return null;
  };

  const getNextAvailableTimeForDate = (artist: Artist, date: Date): string | null => {
    const dateString = date.toISOString().slice(0, 10);
    const dayAppointments = artist.dateTimeDto
      .filter(appt => appt.appointmentDateTimeStart.startsWith(dateString))
      .sort((a, b) => 
        new Date(a.appointmentDateTimeStart).getTime() - new Date(b.appointmentDateTimeStart).getTime()
      );

    if (!dayAppointments.length) {
      return `${dateString}T${storeOpenTime}`;
    }

    const breakTime = 10;
    const totalRequiredTime = appointmentDuration + breakTime;

    // Check morning availability
    const firstAppt = dayAppointments[0];
    const firstStart = firstAppt.appointmentDateTimeStart.slice(11, 16);
    if (firstStart > storeOpenTime) {
      const morningGap = (
        new Date(`1970-01-01T${firstStart}`).getTime() - 
        new Date(`1970-01-01T${storeOpenTime}`).getTime()
      ) / (1000 * 60);
      if (morningGap >= totalRequiredTime) {
        return `${dateString}T${storeOpenTime}`;
      }
    }

    // Check gaps between appointments
    for (let i = 0; i < dayAppointments.length - 1; i++) {
      const currentEnd = dayAppointments[i].appointmentDateTimeEnd.slice(11, 16);
      const nextStart = dayAppointments[i + 1].appointmentDateTimeStart.slice(11, 16);
      const gapDuration = (
        new Date(`1970-01-01T${nextStart}`).getTime() - 
        new Date(`1970-01-01T${currentEnd}`).getTime()
      ) / (1000 * 60);

      if (gapDuration >= totalRequiredTime && 
          isWithinStoreHours(currentEnd) && 
          isWithinStoreHours(nextStart)) {
        return `${dateString}T${currentEnd}`;
      }
    }

    // Check evening availability
    const lastAppt = dayAppointments[dayAppointments.length - 1];
    const lastEnd = lastAppt.appointmentDateTimeEnd.slice(11, 16);
    if (lastEnd < storeCloseTime) {
      const eveningGap = (
        new Date(`1970-01-01T${storeCloseTime}`).getTime() - 
        new Date(`1970-01-01T${lastEnd}`).getTime()
      ) / (1000 * 60);
      if (eveningGap >= totalRequiredTime) {
        return `${dateString}T${lastEnd}`;
      }
    }

    return null;
  };

  // Effect to find and set next available date when artist changes
  useEffect(() => {
    if (selectedArtist) {
      const now = new Date();
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      // If today is fully booked or it's past 7 PM,
      // start checking from tomorrow
      if (isDateFullyBooked(selectedArtist, startDate) || now.getHours() >= 19) {
        startDate.setDate(startDate.getDate() + 1);
      }

      const nextDate = findNextAvailableDate(startDate);
      
      if (nextDate) {
        setNextAvailableDate(nextDate);
        onMonthChange(nextDate); // Update calendar to show the month containing the next available date
        onDateSelect(nextDate); // Auto-select the next available date
      }
    }
  }, [selectedArtist, appointmentDuration]);

  const renderCalendar = () => {
    const startOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    const startDay = startOfMonth.getDay();
    const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();

    return (
      <Grid container spacing={isMobile ? 0.5 : 1}>
        {Array(startDay).fill(null).map((_, i) => (
          <Grid item xs={12/7} key={`empty-${i}`}>
            <Box sx={{ height: isMobile ? '32px' : '40px' }} />
          </Grid>
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), i + 1);
          const isAvailable = isDateAvailable(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          
          return (
            <Grid item xs={12/7} key={date.toISOString()}>
              <Button
                fullWidth
                disabled={!isAvailable}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => onDateSelect(date)}
                sx={{
                  height: isMobile ? '32px' : '40px',
                  minWidth: isMobile ? '32px' : '40px',
                  p: 0,
                  backgroundColor: isSelected ? '#000000' : 'transparent',
                  color: isSelected ? '#ffffff' : isAvailable ? '#000000' : '#ccc',
                  borderColor: isSelected ? '#000000' : '#ccc'
                }}
              >
                {i + 1}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const getVisibleSlots = (allSlots: any[]) => {
    const initialLimit = isMobile ? 5 : 10;
    const expandedLimit = initialLimit + 12; // 6 more rows (2 slots per row)

    switch (displayMode) {
      case 'initial':
        return allSlots.slice(0, initialLimit);
      case 'expanded':
        return allSlots.slice(0, expandedLimit);
      case 'all':
        return allSlots;
      default:
        return allSlots.slice(0, initialLimit);
    }
  };

  const handleShowMoreClick = (totalSlots: number) => {
    const initialLimit = isMobile ? 5 : 10;
    const expandedLimit = initialLimit + 12;

    if (displayMode === 'initial') {
      // If expanded view would show all slots, go straight to 'all'
      if (totalSlots <= expandedLimit) {
        setDisplayMode('all');
      } else {
        setDisplayMode('expanded');
      }
    } else if (displayMode === 'expanded') {
      setDisplayMode('all');
    }
  };

  const renderTimeSlots = () => {
    if (!selectedDate) return null;

    const allTimeSlots = generateTimeSlots(selectedArtist, selectedDate, appointmentDuration);
    const visibleSlots = getVisibleSlots(allTimeSlots);
    const initialLimit = isMobile ? 5 : 10;
    const expandedLimit = initialLimit + 12;

    const hasMoreSlots = allTimeSlots.length > visibleSlots.length;
    const showExpandButton = displayMode === 'initial' && allTimeSlots.length > initialLimit;
    const showAllButton = displayMode === 'expanded' && allTimeSlots.length > expandedLimit;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Available Times
        </Typography>
        <Grid container spacing={1}>
          {visibleSlots.map(({ time, endTime, isAvailable }) => (
            <Grid item xs={6} key={time}>
              <Button
                fullWidth
                variant={selectedTime === time ? "contained" : "outlined"}
                disabled={!isAvailable}
                onClick={() => onTimeSelect(time, endTime)}
                sx={{
                  backgroundColor: selectedTime === time ? '#000000' : 'transparent',
                  color: selectedTime === time ? '#ffffff' : '#000000',
                  borderColor: '#000000',
                  justifyContent: 'space-between',
                  padding: 1,
                  '&:hover': {
                    backgroundColor: selectedTime === time ? '#2b2b2b' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <span>{time}</span>
                <Typography variant="caption" color="textSecondary">
                  → {endTime}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          {(showExpandButton || showAllButton) && (
            <Button
              onClick={() => handleShowMoreClick(allTimeSlots.length)}
              variant="text"
              sx={{
                color: '#000000',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {showExpandButton ? 'Show More' : 'Show All'}
            </Button>
          )}
          {displayMode !== 'initial' && !hasMoreSlots && (
            <Button
              onClick={() => setDisplayMode('initial')}
              variant="text"
              sx={{
                color: '#000000',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Show Less
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  // Get current date with time set to midnight for date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card id="date-time-selection" sx={errorStyle}>
      {hasError && <ValidationError />}
      <CardHeader title="Select Date & Time" />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton 
            onClick={() => {
              const newDate = new Date(displayMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              onMonthChange(newDate);
            }}
            disabled={displayMonth.getMonth() === new Date().getMonth() && 
                     displayMonth.getFullYear() === new Date().getFullYear()}
          >
            <ChevronLeft />
          </IconButton>
          <Typography>
            {displayMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton 
            onClick={() => {
              const newDate = new Date(displayMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              onMonthChange(newDate);
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <Grid item xs={12/7} key={day}>
              <Typography align="center" variant="caption">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {renderCalendar()}
        {renderTimeSlots()}
      </CardContent>
    </Card>
  );
};

export default DateTimeSelection;