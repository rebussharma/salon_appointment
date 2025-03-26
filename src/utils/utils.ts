import { browserName, browserVersion, isMobile, isTablet, mobileModel, mobileVendor, osName, osVersion } from "react-device-detect";
import api from '../services/api';
import { mainServices, peopleData } from "./Constants";
import { Artist, DateTimeDto, ServiceStructure, SubService } from "./types";

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}hr${hours > 1 ? 's' : ''} ${remainingMinutes} mins`;
};

function parseTimeString(time: string): { hours: number; minutes: number; period: string } {
  const timeRegex = /^(\d{1,2})(:\d{2})?\s?(am|pm)$/i;
  const match = time.match(timeRegex);

  if (!match) {
      throw new Error('Invalid time format. Expected something like "9am" or "1:15pm".');
  }

  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2].slice(1), 10) : 0;
  const period = match[3].toLowerCase();

  return { hours, minutes, period };
}

// Function to convert 12-hour time to 24-hour time
function convertTo24HourTime(hours: number, period: string): number {
  if (period === 'pm' && hours < 12) {
      return hours + 12;
  }
  if (period === 'am' && hours === 12) {
      return 0;
  }
  return hours;
}

// Function to format the 24-hour time into "HH:mm"
function format24HourTime(hours: number, minutes: number): string {
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

export function combineDateAndTime(date: Date | null, time: string): string {
  if (!date) {
    throw new Error('Date is required');
  }

  const normalizedTime = time.replace(/([ap]m)/i, ' $1');
  const { hours, minutes, period } = parseTimeString(normalizedTime);
  const hours24 = convertTo24HourTime(hours, period);
  
  return `${date.toISOString().slice(0, 10)}T${format24HourTime(hours24, minutes)}`;
}

export const calculateTotal = (selectedServices:SubService[]) => 
  selectedServices.reduce((total, service) => total + service.price, 0);

export const calculateDuration = (selectedServices:SubService[]) => 
  selectedServices.reduce((total, service) => total + service.duration, 0);

export const formatDateWithDay = (date: Date) => {
  return date.toLocaleDateString('default', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export function getDeviceType () {
  const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
  const os = `${osName} ${osVersion}`;
  const browser = `${browserName} ${browserVersion}`;
  const deviceModel = mobileModel ? `${mobileVendor} ${mobileModel}` : 'Unknown'

  const deviceInfo = {
    deviceType,
    os,
    browser,
    deviceModel,
  };

  return deviceInfo || null;
}

// In utils.ts

/**
 * Groups services by their main service category
 * @param services List of sub-services to group
 * @returns Object with main service names as keys and arrays of sub-services as values
 */
export const groupServicesByCategory = (services: SubService[]): ServiceStructure => {
  return services.reduce((acc: ServiceStructure, service: SubService) => {
    // Find the corresponding main service name
    const mainService = mainServices.find(ms => ms.id === service.mainServiceId)?.name || '';
    
    if (!acc[mainService]) {
      acc[mainService] = [];
    }
    
    acc[mainService].push(service);
    return acc;
  }, {});
};

export const updateBookedTimes = async (): Promise<Artist[]> => {
  // Create a copy of the peopleData array to avoid mutating the original data
  const updatedPeopleData = [...peopleData];

  try {
    // Fetch the appointments from the API
    const appointmentsResponse = await api.appointments.getUpcomingConfirmedAppointmentNameAndDateTime();

    // Check if the response was successful and contains data
    if (appointmentsResponse.success && appointmentsResponse.data) {
      // Now use the data property which contains the array
      appointmentsResponse.data.forEach((appointment: any) => {
        const artist = updatedPeopleData.find((person) => person.name === appointment.artist);
        if (artist) {
          // Create a new appointment entry following the exact structure
          const newAppointment: DateTimeDto = {
            appointmentDateTime: appointment.appointmentDateTime,
            appointmentDateTimeStart: appointment.appointmentDateTime,
            appointmentDateTimeEnd: appointment.appointmentDateTimeEnd
          };

          // Initialize dateTimeDto array if it doesn't exist
          if (!artist.dateTimeDto) {
            artist.dateTimeDto = [];
          }

          // Check if this appointment already exists using all three fields
          const exists = artist.dateTimeDto.some(
            (dto) => 
              dto.appointmentDateTime === newAppointment.appointmentDateTime &&
              dto.appointmentDateTimeStart === newAppointment.appointmentDateTimeStart &&
              dto.appointmentDateTimeEnd === newAppointment.appointmentDateTimeEnd
          );

          // Add the appointment if it doesn't exist
          if (!exists) {
            artist.dateTimeDto.push(newAppointment);
          }
        }
      });
    }
  } catch (error) {
    console.error("Error updating booked times:", error);
  }

  return updatedPeopleData;
};

export const formatTime = (hours: number, minutes: number = 0): string => {
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 || 12;
  const displayMinute = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
  return `${displayHour}${displayMinute}${period}`;
};

export const generateTimeSlots = (  
  selectedArtist: Artist | null, 
  selectedDate: Date, 
  appointmentDuration: number,
): { time: string, endTime: string, isAvailable: boolean }[] => {
  const slots: { time: string; endTime: string; isAvailable: boolean }[] = [];
  
  if (!selectedDate || !selectedArtist) return slots;

  // Get current time plus 2 hours for minimum booking time
  const minBookingTime = new Date();
  minBookingTime.setHours(minBookingTime.getHours() + 2);

  // Create arrays of appointment times for the selected date
  const appointments = selectedArtist.dateTimeDto
    .filter((appt:any) => {
      const apptDate = new Date(appt.appointmentDateTimeStart);
      return selectedDate.toDateString() === apptDate.toDateString();
    })
    .map((appt:any) => {
      const start = new Date(appt.appointmentDateTimeStart);
      const end = new Date(appt.appointmentDateTimeEnd);
      return {
        start,
        end,
        breakEnd: new Date(end.getTime() + 10 * 60000) // Add 10 minutes break
      };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Function to check if a time slot is available
  const isTimeAvailable = (slotTime: Date, slotEndTime: Date): boolean => {
    // Check if slot is before minimum booking time
    if (slotTime < minBookingTime) return false;

    // Check against all appointments
    return !appointments.some(appt => {
      // Slot starts during appointment or break period
      if (slotTime >= appt.start && slotTime < appt.breakEnd) return true;
      
      // Slot ends during appointment or break period
      if (slotEndTime > appt.start && slotEndTime <= appt.breakEnd) return true;
      
      // Appointment starts during slot
      if (appt.start >= slotTime && appt.start < slotEndTime) return true;

      return false;
    });
  };

  // Determine time slot interval based on appointment duration
  const timeInterval = appointmentDuration <= 30 ? 30 : 60; // 30 min slots for short appointments, 1 hour for longer

  // Generate time slots
  let currentTime = new Date(selectedDate);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(21, 0, 0, 0); // End at 9 PM

  while (currentTime < endOfDay) {
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + appointmentDuration);

    const timeString = formatTime(currentTime.getHours(), currentTime.getMinutes());
    const endTimeString = formatTime(slotEndTime.getHours(), slotEndTime.getMinutes());

    slots.push({
      time: timeString,
      endTime: endTimeString,
      isAvailable: isTimeAvailable(currentTime, slotEndTime)
    });

    // Increment by timeInterval
    currentTime.setMinutes(currentTime.getMinutes() + timeInterval);
  }

  return slots;
};