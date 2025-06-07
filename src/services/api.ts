// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { AppointmentData, ClientInfo, DateTimeDto, SubService } from '../utils/types';

// Base API configuration
const API_BASE_URL = '/api'; // Cloudfare worker is deployed as proxy which takes care of rest URL
const UPCOMING_APPT_URL = 'appointments/confirmed/upcoming/';
const auth_token = process.env.REACT_APP_API_BEARER_TOKEN

// Enhanced axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
});

// Define error and response interfaces
export interface ApiError {
  message: string;
  statusCode?: number;
  source?: string;
  originalError?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorSource?: string;
}

// Error handling utility function
const handleApiError = (error: any, source = 'api'): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      statusCode: axiosError.response?.status,
      source,
      originalError: error
    };
  }
  
  return {
    message: error?.message || 'An unexpected error occurred',
    source,
    originalError: error
  };
};

// API service with all endpoints
const api = {
  appointments: {
    /**
     * Create a new appointment
     */
    create: async (
      selectedServices: SubService[],
      selectedArtist: string,
      appointmentDateTime: DateTimeDto,
      appointmentDuration: number,
      clientInfo: ClientInfo,
      captchaToken: any
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const dataToPost = {
          appointmentDateTimeDetails: appointmentDateTime,
          appointmentDuration: appointmentDuration,
          serviceType: selectedServices,
          artist: selectedArtist,
          appointmentStatus: "confirmed",
          clientName: clientInfo.name,
          clientEmail: clientInfo.emailId,
          clientPhone: clientInfo.phone,
          appointmentNotes: clientInfo.message,
          bookingDeviceType: clientInfo.bookingDeviceType,
          captchaToken: captchaToken
        };
        console.log("data to post", dataToPost);        
        const response = await apiClient.post('/appointments', dataToPost);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = handleApiError(error, 'create_appointment');
        return {
          success: false,
          error: apiError.message
        };
      }
    },

    /**
     * Update an existing appointment
     */
    update: async (
      id: number,
      selectedServices: SubService[],
      selectedArtist: string,
      appointmentDateTime: DateTimeDto,
      appointmentDuration: number,
      clientInfo: ClientInfo,
      confirmationCode: string | null | undefined
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const dataToPost = {
          appointmentDateTimeDetails: appointmentDateTime,
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

        const response = await apiClient.put(`/appointments/${id}`, dataToPost);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = handleApiError(error, 'update_appointment');
        return {
          success: false,
          error: apiError.message
        };
      }
    },

    /**
     * Cancel an appointment
     */
    cancel: async (
      data: AppointmentData
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const updatedData = { ...data, appointmentStatus: "cancelled" };
        const response = await apiClient.put(`/appointments/${data.id}`, updatedData);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = handleApiError(error, 'pushCancelData');
        return {
          success: false,
          error: apiError.message,
          errorSource: 'pushCancelData'
        };
      }
    },

    /**
     * Get an appointment by confirmation code
     */
    getByConfirmationCode: async (
      confirmationNumber: string,
      view?: string
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const response = await apiClient.get(`${UPCOMING_APPT_URL}${confirmationNumber}`);
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
        };
      } catch (error) {
        const apiError = handleApiError(error, 'getAppointmentByConfirmationCode');
        return {
          success: false,
          error: apiError.message,
          errorSource: 'getAppointmentByConfirmationCode'
        };
      }
    },

    /**
     * Get all upcoming confirmed appointments
     */
    getUpcomingConfirmedAppointments: async (): Promise<ApiResponse<AppointmentData[]>> => {
      try {
        const response = await apiClient.get(UPCOMING_APPT_URL);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = handleApiError(error, 'getUpcomingConfirmedAppointment');
        return {
          success: false,
          error: apiError.message
        };
      }
    },

    /**
     * Get name and datetime of upcoming confirmed appointments
     */
    getUpcomingConfirmedAppointmentNameAndDateTime: async (): Promise<ApiResponse<any[]>> => {
      try {
        const response = await apiClient.get(`${UPCOMING_APPT_URL}artist-date-time`);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = handleApiError(error, 'getUpcomingConfirmedAppointmentNameAndDateTime');
        return {
          success: false,
          error: apiError.message
        };
      }
    },

    /**
     * Handle full appointment cancellation flow
     */
    handleAppointmentCancellation: async (
      confirmationNumber: string
    ): Promise<{ success: boolean; errorSource?: string }> => {
      try {
        // Get appointment details
        const appointmentResult = await api.appointments.getByConfirmationCode(confirmationNumber);
        
        if (!appointmentResult.success || !appointmentResult.data) {
          return {
            success: false,
            errorSource: 'getAppointmentByConfirmationCode'
          };
        }

        // Cancel the appointment
        const cancelResult = await api.appointments.cancel(appointmentResult.data);
        
        if (!cancelResult.success) {
          return {
            success: false,
            errorSource: 'pushCancelData'
          };
        }

        // Currently email sending is commented out in the original code
        // If needed, email handling can be added here

        return { success: true };
      } catch (error) {
        const apiError = handleApiError(error, 'handleAppointmentCancellation');
        return {
          success: false,
          errorSource: apiError.source
        };
      }
    }
  }
};

export default api;