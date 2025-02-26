import axios from 'axios';
import { AppointmentData, ClientInfo, SubService } from '../types';

export const updateBooking = async (
  selectedServices: SubService[],
  selectedArtist: string,
  selectedDateTime: string,
  selectedDateTimeEnd: string,
  appointmentDuration: number,
  clientInfo: ClientInfo,
  id: number,
  confirmationCode: string | null | undefined
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
    bookingDeviceType: clientInfo.bookingDeviceType,
    confirmationCode: confirmationCode
  };

  try {
    const response = await axios.put(`http://localhost:8080/api/appointments/${id}`, dataToPost);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error Updating Appointment", error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to book appointment. Please try again.'
    };
  }
};