// src/hooks/useAPI.ts
import { useCallback } from 'react';
import { useBooking } from '../context/BookingContext';
import api from '../services/api';

export const useAPI = () => {
  const {
    state: { selectedServices, selectedArtist, selectedDate, selectedTime, selectedTimeEnd, clientInfo },
    setLoading,
    setError,
    setConfirmation,
    resetBooking
  } = useBooking();

  const createBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime || !selectedArtist) {
      throw new Error('Missing required booking information');
    }

    setLoading(true);
    setError(null);

    try {
      const selectedDateTime = `${selectedDate.toISOString().split('T')[0]}T${selectedTime}`;
      const selectedDateTimeEnd = `${selectedDate.toISOString().split('T')[0]}T${selectedTimeEnd}`;
      const appointmentDuration = selectedServices.reduce((total, service) => total + service.duration, 0);

      const result = await api.appointments.create(
        selectedServices,
        selectedArtist,
        selectedDateTime,
        selectedDateTimeEnd,
        appointmentDuration,
        clientInfo
      );

      if (result.success && result.data) {
        setConfirmation(result.data.confirmationCode.toString());
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedServices, selectedArtist, selectedDate, selectedTime, selectedTimeEnd, clientInfo]);

  const updateBooking = useCallback(async (
    id: number,
    confirmationCode: string
  ) => {
    if (!selectedDate || !selectedTime || !selectedArtist) {
      throw new Error('Missing required booking information');
    }

    setLoading(true);
    setError(null);

    try {
      const selectedDateTime = `${selectedDate.toISOString().split('T')[0]}T${selectedTime}`;
      const selectedDateTimeEnd = `${selectedDate.toISOString().split('T')[0]}T${selectedTimeEnd}`;
      const appointmentDuration = selectedServices.reduce((total, service) => total + service.duration, 0);

      const result = await api.appointments.update(
        id,
        selectedServices,
        selectedArtist,
        selectedDateTime,
        selectedDateTimeEnd,
        appointmentDuration,
        clientInfo,
        confirmationCode
      );

      if (result.success && result.data) {
        setConfirmation(result.data.confirmationCode.toString());
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update booking');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedServices, selectedArtist, selectedDate, selectedTime, selectedTimeEnd, clientInfo]);

  const cancelBooking = useCallback(async (id: number, confirmationCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const appointmentResult = await api.appointments.getByConfirmation(confirmationCode);
      
      if (!appointmentResult.success || !appointmentResult.data) {
        throw new Error(appointmentResult.error || 'Appointment not found');
      }
      
      const result = await api.appointments.cancel(id);
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppointmentByCode = useCallback(async (confirmationCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.appointments.getByConfirmation(confirmationCode);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Appointment not found');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createBooking,
    updateBooking,
    cancelBooking,
    getAppointmentByCode
  };
}