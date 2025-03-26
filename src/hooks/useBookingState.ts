// src/hooks/useBookingState.ts
import { useCallback, useMemo, useState } from 'react';
import { ClientInfo, SubService } from '../utils/types';
import { calculateDuration, calculateTotal } from '../utils/utils';

interface BookingState {
  selectedServices: SubService[];
  selectedArtist: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedTimeEnd: string | null;
  clientInfo: ClientInfo;
  isLoading: boolean;
  error: string | null;
}

interface UseBookingStateReturn extends BookingState {
  totalPrice: number;
  totalDuration: number;
  isBookingComplete: boolean;
  setServices: (services: SubService[]) => void;
  setArtist: (artist: string) => void;
  setDateTime: (date: Date, time: string, endTime: string) => void;
  setClientInfo: (info: Partial<ClientInfo>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
}

const initialClientInfo: ClientInfo = {
  name: '',
  emailId: '',
  phone: '',
  message: '',
  bookingDeviceType: undefined
};

export const useBookingState = (initialState?: Partial<BookingState>): UseBookingStateReturn => {
  const [state, setState] = useState<BookingState>({
    selectedServices: initialState?.selectedServices || [],
    selectedArtist: initialState?.selectedArtist || null,
    selectedDate: initialState?.selectedDate || null,
    selectedTime: initialState?.selectedTime || null,
    selectedTimeEnd: initialState?.selectedTimeEnd || null,
    clientInfo: initialState?.clientInfo || initialClientInfo,
    isLoading: initialState?.isLoading || false,
    error: initialState?.error || null
  });

  // Memoized calculations
  const totalPrice = useMemo(() => 
    calculateTotal(state.selectedServices), 
    [state.selectedServices]
  );

  const totalDuration = useMemo(() => 
    calculateDuration(state.selectedServices), 
    [state.selectedServices]
  );

  // Check if booking is complete
  const isBookingComplete = useMemo(() => {
    const { selectedServices, selectedArtist, selectedDate, selectedTime, clientInfo } = state;
    return (
      selectedServices.length > 0 &&
      !!selectedArtist &&
      !!selectedDate &&
      !!selectedTime &&
      !!clientInfo.name &&
      (!!clientInfo.emailId || !!clientInfo.phone)
    );
  }, [state]);

  // Action handlers
  const setServices = useCallback((services: SubService[]) => {
    setState(prev => ({
      ...prev,
      selectedServices: services,
      // Reset subsequent selections if services change
      selectedArtist: prev.selectedServices !== services ? null : prev.selectedArtist,
      selectedDate: prev.selectedServices !== services ? null : prev.selectedDate,
      selectedTime: prev.selectedServices !== services ? null : prev.selectedTime,
      selectedTimeEnd: prev.selectedServices !== services ? null : prev.selectedTimeEnd
    }));
  }, []);

  const setArtist = useCallback((artist: string) => {
    setState(prev => ({
      ...prev,
      selectedArtist: artist,
      // Reset date and time when artist changes
      selectedDate: prev.selectedArtist !== artist ? null : prev.selectedDate,
      selectedTime: prev.selectedArtist !== artist ? null : prev.selectedTime,
      selectedTimeEnd: prev.selectedArtist !== artist ? null : prev.selectedTimeEnd
    }));
  }, []);

  const setDateTime = useCallback((date: Date, time: string, endTime: string) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: time,
      selectedTimeEnd: endTime
    }));
  }, []);

  const setClientInfo = useCallback((info: Partial<ClientInfo>) => {
    setState(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...info }
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      selectedServices: [],
      selectedArtist: null,
      selectedDate: null,
      selectedTime: null,
      selectedTimeEnd: null,
      clientInfo: initialClientInfo,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    totalPrice,
    totalDuration,
    isBookingComplete,
    setServices,
    setArtist,
    setDateTime,
    setClientInfo,
    setLoading,
    setError,
    resetBooking
  };
};