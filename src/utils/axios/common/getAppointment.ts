import axios from 'axios';
import { AppointmentData } from '../../types';

const UPCOMING_APPT_URL = "http://localhost:8080/api/appointments/confirmed/upcoming/"
export interface DataDetails {
  success: boolean;
  errorSource?: string;
  data?: AppointmentData
}

export const getAppointmentByConfirmationCode = async (confirmationNumber: string, view?: string): Promise<DataDetails> => {
  try {
    const response = await axios.get(UPCOMING_APPT_URL+confirmationNumber)        
    // Assuming the API returns appointment data in the required format
    return {
      success: true,
      data: {
            data_insertion_date: response.data.data_insertion_date,  
            confirmationCode: response.data.confirmationCode,  
            appointmentDateTime: response.data.appointmentDateTime,
            appointmentDuration: response.data.appointmentDuration,  
            serviceType: response.data.serviceType,  
            artist: response.data.artist,  
            clientName: response.data.clientName,  
            clientEmail: response.data.clientEmail,  
            clietnPhone: response.data.clietnPhone,  
            appointmentNotes: response.data.appointmentNotes,  
            appointmentStatus: response.data.appointmentStatus,  
            id: response.data.id
        }
    }
  } catch (error: any) {
    console.error("Error fetching appointment:", error);
    return {
      success: false,
      errorSource: 'getAppointmentByConfirmationCode',
    };
  }
};

export const getUpcomingConfirmedAppointment = async () => {
  try {
    const response = await fetch(UPCOMING_APPT_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch appointment data");
    }
    const data = await response.json();
    console.log("data", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching appointment data:", error);
    throw error;
  }
};

export const getUpcomingConfirmedAppointmentNameAndDateTime = async () => {
  try {
    const response = await fetch(UPCOMING_APPT_URL+"artist-date-time", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch appointment data");
    }
    const data = await response.json();
    console.log("data", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching appointment data:", error);
    throw error;
  }
};