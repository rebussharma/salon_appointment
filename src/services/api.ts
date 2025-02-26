// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { AppointmentData, ClientInfo, SubService } from '../utils/types';

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Define proper error response type
interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: any;
}

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorMessage = 
      axiosError.response?.data?.message || 
      axiosError.response?.data?.error || 
      'An error occurred';
    
    throw new ApiError(
      errorMessage,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  throw new ApiError('An unexpected error occurred');
};

const api = {
  appointments: {
    create: async (
      selectedServices: SubService[],
      selectedArtist: string,
      selectedDateTime: string,
      selectedDateTimeEnd: string,
      appointmentDuration: number,
      clientInfo: ClientInfo
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const response = await axios.post(`${API_BASE_URL}/appointments`, {
          appointmentDateTime: selectedDateTime,
          appointmentDateTimeStart: selectedDateTime,
          appointmentDateTimeEnd: selectedDateTimeEnd,
          appointmentDuration,
          serviceType: selectedServices,
          artist: selectedArtist,
          appointmentStatus: "confirmed",
          clientName: clientInfo.name,
          clientEmail: clientInfo.emailId,
          clientPhone: clientInfo.phone,
          appointmentNotes: clientInfo.message,
          bookingDeviceType: clientInfo.bookingDeviceType
        });

        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof ApiError ? error.message : 'Failed to book appointment'
        };
      }
    },

    update: async (
      id: number,
      selectedServices: SubService[],
      selectedArtist: string,
      selectedDateTime: string,
      selectedDateTimeEnd: string,
      appointmentDuration: number,
      clientInfo: ClientInfo,
      confirmationCode: string
    ): Promise<ApiResponse<AppointmentData>> => {
      try {
        const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, {
          appointmentDateTime: selectedDateTime,
          appointmentDateTimeStart: selectedDateTime,
          appointmentDateTimeEnd: selectedDateTimeEnd,
          appointmentDuration,
          serviceType: selectedServices,
          artist: selectedArtist,
          appointmentStatus: "confirmed",
          clientName: clientInfo.name,
          clientEmail: clientInfo.emailId,
          clientPhone: clientInfo.phone,
          appointmentNotes: clientInfo.message,
          bookingDeviceType: clientInfo.bookingDeviceType,
          confirmationCode
        });

        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof ApiError ? error.message : 'Failed to update appointment'
        };
      }
    },

    cancel: async (id: number): Promise<ApiResponse<void>> => {
      try {
        await axios.put(`${API_BASE_URL}/appointments/${id}`, {
          appointmentStatus: "cancelled"
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof ApiError ? error.message : 'Failed to cancel appointment'
        };
      }
    },

    getByConfirmation: async (code: string): Promise<ApiResponse<AppointmentData>> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/appointments/confirmed/upcoming/${code}`);
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof ApiError ? error.message : 'Failed to fetch appointment'
        };
      }
    }
  }
};

export default api;