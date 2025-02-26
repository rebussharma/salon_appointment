import axios from 'axios';
import { AppointmentData, ClientInfo, SubService } from '../types';

export const postBooking = async (
  selectedServices: SubService[],
  selectedArtist: string,
  selectedDateTime: string,
  selectedDateTimeEnd: string,
  appointmentDuration: number,
  clientInfo: ClientInfo
): Promise<{ success: boolean; data?: AppointmentData, error?: string }> => {  
  const dataToPost = {
    appointmentDateTime: selectedDateTime,
    appointmentDateTimeStart: selectedDateTime,
    appointmentDateTimeEnd: selectedDateTimeEnd,
    appointmentDuration: appointmentDuration,
    serviceType: selectedServices,
    artist: selectedArtist,
    appointmentStatus: "confirmed",
    clientName: clientInfo.name,
    clientEmail: clientInfo.emailId,
    clientPhone: clientInfo.phone,
    appointmentNotes: clientInfo.message,
    bookingDeviceType: clientInfo.bookingDeviceType
  };

  try {
    const response = await axios.post('http://localhost:8080/api/appointments', dataToPost);    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error Booking Appointment", error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to book appointment. Please try again.'
    };
  }
};