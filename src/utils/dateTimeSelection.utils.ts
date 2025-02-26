// src/utils/dateTimeSelection.utils.ts

import { Artist, WorkDay } from './types';

const storeOpenTime = "09:00";
const storeCloseTime = "21:00";

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export const getLastPossibleBookingTime = (appointmentDuration: number): string => {
    const closeTimeMinutes = timeToMinutes(storeCloseTime);
    const lastPossibleMinutes = closeTimeMinutes - appointmentDuration;
    return minutesToTime(lastPossibleMinutes);
};

export const isWithinStoreHours = (time: string): boolean => {
    return time >= storeOpenTime && time <= storeCloseTime;
};

export const isTimeWithinBookingLimits = (time: string, appointmentDuration: number): boolean => {
    const lastBookingTime = getLastPossibleBookingTime(appointmentDuration);
    const timeMinutes = timeToMinutes(time);
    const endTimeMinutes = timeMinutes + appointmentDuration;
    const endTime = minutesToTime(endTimeMinutes);
    
    if (endTime > storeCloseTime) {
        return false;
    }
    
    return time >= storeOpenTime && time <= lastBookingTime;
};

export const isSlotAvailable = (
    time: string, 
    endTime: string, 
    dateString: string, 
    selectedArtist: Artist | null,
    appointmentDuration: number
): boolean => {
    // First check if the time is within booking limits
    if (!isTimeWithinBookingLimits(time, appointmentDuration)) {
        return false;
    }

    // For today's slots, check if time has already passed or is within 2 hours
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(dateString);

    if (dateToCheck.getTime() === today.getTime()) {
        // Convert time strings to minutes since midnight for comparison
        const [timeHours, timeMinutes] = time.split(':').map(Number);
        const slotTimeInMinutes = timeHours * 60 + timeMinutes;
        
        // Calculate current time + 2 hours in minutes
        const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        const bufferTimeInMinutes = twoHoursFromNow.getHours() * 60 + twoHoursFromNow.getMinutes();
        
        // Add 5 minutes padding to ensure proper buffer
        if (slotTimeInMinutes <= (bufferTimeInMinutes + 5)) {
            return false;
        }
    }

    if (!selectedArtist) return false;

    // Check if the appointment would cross closing time
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    if (endHours >= 21 && endMinutes > 0) {
        return false;
    }

    // Check existing appointments
    const dayAppointments = selectedArtist.dateTimeDto
        .filter(appt => appt.appointmentDateTimeStart.startsWith(dateString))
        .sort((a, b) => 
            new Date(a.appointmentDateTimeStart).getTime() - new Date(b.appointmentDateTimeStart).getTime()
        );

    for (const appt of dayAppointments) {
        const apptStart = appt.appointmentDateTimeStart.slice(11, 16);
        const apptEnd = appt.appointmentDateTimeEnd.slice(11, 16);
        
        // Add 10-minute break time after appointments
        const breakEndTime = new Date(`1970-01-01T${apptEnd}`);
        breakEndTime.setMinutes(breakEndTime.getMinutes() + 10);
        const apptEndWithBreak = breakEndTime.toTimeString().slice(0, 5);
        
        // Check for overlaps including break time
        if ((time >= apptStart && time < apptEndWithBreak) || 
            (endTime > apptStart && endTime <= apptEndWithBreak) ||
            (time <= apptStart && endTime >= apptEndWithBreak)) {
            return false;
        }
    }

    return true;
};

export const hasAvailableTimeSlots = (
    date: Date, 
    selectedArtist: Artist | null,
    appointmentDuration: number
): boolean => {
    if (!selectedArtist) return false;

    const dateString = date.toISOString().slice(0, 10);    
    // Determine the starting time based on current time + 2 hours buffer
    let currentTime = storeOpenTime;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If it's today, start from 2 hours from now (rounded up to next 30 min)
    if (date.getTime() === today.getTime()) {
      const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      let minutes = twoHoursFromNow.getMinutes();
      // Round up to next 30 minutes
      if (minutes % 30 !== 0) {
        minutes = Math.ceil(minutes / 30) * 30;
      }
      twoHoursFromNow.setMinutes(minutes);
      currentTime = twoHoursFromNow.toTimeString().slice(0, 5);
    }

    const lastBookingTime = getLastPossibleBookingTime(appointmentDuration);

    while (currentTime <= lastBookingTime) {
      const startDate = new Date(`1970-01-01T${currentTime}`);
      const endDate = new Date(startDate.getTime() + (appointmentDuration * 60000));
      const endTime = endDate.toTimeString().slice(0, 5);

      if (isSlotAvailable(currentTime, endTime, dateString, selectedArtist, appointmentDuration)) {
        return true;
      }

      startDate.setMinutes(startDate.getMinutes() + 30);
      currentTime = startDate.toTimeString().slice(0, 5);
    }

    return false;
};

 export const isDateFullyBooked = (artist: Artist, date: Date, appointmentDuration: number): boolean => {
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

  export const isDateAvailable = (date: Date, selectedArtist: Artist, appointmentDuration: number): boolean => {
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

  export const findNextAvailableDate = (startDate: Date, selectedArtist: Artist, appointmentDuration: number): Date | null => {
    if (!selectedArtist) return null;

    const maxDaysToCheck = 60;
    let currentDate = new Date(startDate);
    let daysChecked = 0;

    while (daysChecked < maxDaysToCheck) {
      if (isDateAvailable(currentDate, selectedArtist, appointmentDuration)) {
        const nextAvailable = getNextAvailableTimeForDate(selectedArtist, currentDate, appointmentDuration);
        if (nextAvailable) {
          return new Date(nextAvailable);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }

    return null;
  };

  export const getNextAvailableTimeForDate = (artist: Artist, date: Date, appointmentDuration: number): string | null => {
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
