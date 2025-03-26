// src/hooks/useAPI.ts
import { useCallback, useState } from 'react';
import api from '../services/api';
import { AppointmentData, ClientInfo, DateTimeDto, SubService } from '../utils/types';

interface UseAPIState {
  isLoading: boolean;
  error: string | null;
  errorSource: string | null;
}

interface UseAPIReturn extends UseAPIState {
  // Booking methods
  createBooking: (
    selectedServices: SubService[],
    selectedArtist: string,
    selectedDate: Date,
    selectedTime: string,
    selectedTimeEnd: string,
    clientInfo: ClientInfo
  ) => Promise<AppointmentData | null>;
  
  updateBooking: (
    id: number,
    selectedServices: SubService[],
    selectedArtist: string,
    selectedDate: Date,
    selectedTime: string,
    selectedTimeEnd: string,
    clientInfo: ClientInfo,
    confirmationCode: string
  ) => Promise<AppointmentData | null>;
  
  cancelBooking: (confirmationNumber: string) => Promise<boolean>;
  
  // Fetch methods
  getAppointmentByCode: (confirmationNumber: string, view?: string) => Promise<AppointmentData | null>;
  getUpcomingAppointments: () => Promise<AppointmentData[] | null>;
  getUpcomingAppointmentTimesForArtists: () => Promise<any[] | null>;
  
  // Reset methods
  clearError: () => void;
  resetState: () => void;
}

/**
 * Hook for managing API calls and related state
 */
export const useAPI = (): UseAPIReturn => {
  // State for loading and errors
  const [state, setState] = useState<UseAPIState>({
    isLoading: false,
    error: null,
    errorSource: null
  });

  // Helper to format datetime for the API
  const formatDateTimeForAPI = (date: Date, timeStr: string): string => {
    // Convert from format like "3pm" to ISO string format
    const isPM = timeStr.toLowerCase().includes('pm');
    const timeValue = timeStr.toLowerCase().replace('am', '').replace('pm', '');
    
    let [hours, minutes] = [0, 0];
    
    // Parse time string which could be in formats like "3pm", "3:30pm", etc.
    if (timeValue.includes(':')) {
      const [hoursStr, minutesStr] = timeValue.split(':');
      hours = parseInt(hoursStr, 10);
      minutes = parseInt(minutesStr, 10);
    } else {
      hours = parseInt(timeValue, 10);
      minutes = 0;
    }
    
    // Adjust for PM
    if (isPM && hours < 12) {
      hours += 12;
    }
    
    // Create a new date with the correct time
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    
    // Return in format YYYY-MM-DDThh:mm
    return `${dateTime.toISOString().split('T')[0]}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Start loading
  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null, errorSource: null }));
  }, []);

  // Set error
  const setError = useCallback((error: string, source: string = 'unknown') => {
    setState(prev => ({ ...prev, isLoading: false, error, errorSource: source }));
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, errorSource: null }));
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setState({ isLoading: false, error: null, errorSource: null });
  }, []);

  // Create a new booking
  const createBooking = useCallback(async (
    selectedServices: SubService[],
    selectedArtist: string,
    selectedDate: Date,
    selectedTime: string,
    selectedTimeEnd: string,
    clientInfo: ClientInfo
  ): Promise<AppointmentData | null> => {
    startLoading();
    
    try {
      const selectedDateTime = formatDateTimeForAPI(selectedDate, selectedTime);
      const selectedDateTimeEnd = formatDateTimeForAPI(selectedDate, selectedTimeEnd);
      const appointmentDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
      const appointmentDateTime: DateTimeDto = {
        appointmentDateTime: selectedDateTime,
        appointmentDateTimeStart: selectedDateTime,
        appointmentDateTimeEnd: selectedDateTimeEnd
      }

      const result = await api.appointments.create(
        selectedServices,
        selectedArtist,
        appointmentDateTime,
        appointmentDuration,
        clientInfo
      );

      if (result.success && result.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.data;
      } else {
        setError(result.error || 'Failed to create booking', 'create_booking');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'create_booking');
      return null;
    }
  }, [startLoading, setError]);

  // Update an existing booking
  const updateBooking = useCallback(async (
    id: number,
    selectedServices: SubService[],
    selectedArtist: string,
    selectedDate: Date,
    selectedTime: string,
    selectedTimeEnd: string,
    clientInfo: ClientInfo,
    confirmationCode: string
  ): Promise<AppointmentData | null> => {
    startLoading();
    
    try {
      const selectedDateTime = formatDateTimeForAPI(selectedDate, selectedTime);
      const selectedDateTimeEnd = formatDateTimeForAPI(selectedDate, selectedTimeEnd);
      const appointmentDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
      const appointmentDateTime: DateTimeDto = {
        appointmentDateTime: selectedDateTime,
        appointmentDateTimeStart: selectedDateTime,
        appointmentDateTimeEnd: selectedDateTimeEnd
      }

      const result = await api.appointments.update(
        id,
        selectedServices,
        selectedArtist,
        appointmentDateTime,
        appointmentDuration,
        clientInfo,
        confirmationCode
      );

      if (result.success && result.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.data;
      } else {
        setError(result.error || 'Failed to update booking', 'update_booking');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'update_booking');
      return null;
    }
  }, [startLoading, setError]);

  // Cancel a booking
  const cancelBooking = useCallback(async (
    confirmationNumber: string
  ): Promise<boolean> => {
    startLoading();
    
    try {
      const result = await api.appointments.handleAppointmentCancellation(confirmationNumber);
      
      if (result.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        return true;
      } else {
        setError('Failed to cancel booking', result.errorSource || 'cancel_booking');
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'cancel_booking');
      return false;
    }
  }, [startLoading, setError]);

  // Get appointment by confirmation code
  const getAppointmentByCode = useCallback(async (
    confirmationNumber: string,
    view?: string
  ): Promise<AppointmentData | null> => {
    startLoading();
    
    try {
      const result = await api.appointments.getByConfirmationCode(confirmationNumber, view);
      
      if (result.success && result.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.data;
      } else {
        setError(result.error || 'Appointment not found', 'get_appointment');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'get_appointment');
      return null;
    }
  }, [startLoading, setError]);

  // Get all upcoming appointments
  const getUpcomingAppointments = useCallback(async (): Promise<AppointmentData[] | null> => {
    startLoading();
    
    try {
      const result = await api.appointments.getUpcomingConfirmedAppointments();
      
      if (result.success && result.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.data;
      } else {
        setError(result.error || 'Failed to get upcoming appointments', 'get_upcoming');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'get_upcoming');
      return null;
    }
  }, [startLoading, setError]);

  // Get upcoming appointment times for artists
  const getUpcomingAppointmentTimesForArtists = useCallback(async (): Promise<any[] | null> => {
    startLoading();
    
    try {
      const result = await api.appointments.getUpcomingConfirmedAppointmentNameAndDateTime();
      
      if (result.success && result.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return result.data;
      } else {
        setError(result.error || 'Failed to get artist appointment times', 'get_artist_times');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg, 'get_artist_times');
      return null;
    }
  }, [startLoading, setError]);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    errorSource: state.errorSource,
    
    // Methods
    createBooking,
    updateBooking,
    cancelBooking,
    getAppointmentByCode,
    getUpcomingAppointments,
    getUpcomingAppointmentTimesForArtists,
    
    // Utilities
    clearError,
    resetState
  };
};

export default useAPI;