// src/context/BookingContext.tsx
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { ClientInfo, SubService } from '../utils/types';

interface BookingState {
  selectedServices: SubService[];
  selectedArtist: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedTimeEnd: string | null;
  clientInfo: ClientInfo;
  isLoading: boolean;
  error: string | null;
  confirmationNumber: string | null;
}

type BookingAction =
  | { type: 'SET_SERVICES'; payload: SubService[] }
  | { type: 'SET_ARTIST'; payload: string }
  | { type: 'SET_DATE_TIME'; payload: { date: Date; time: string; endTime: string } }
  | { type: 'SET_CLIENT_INFO'; payload: Partial<ClientInfo> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIRMATION'; payload: string }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  selectedServices: [],
  selectedArtist: null,
  selectedDate: null,
  selectedTime: null,
  selectedTimeEnd: null,
  clientInfo: {
    name: '',
    emailId: '',
    phone: '',
    message: '',
    bookingDeviceType: {}
  },
  isLoading: false,
  error: null,
  confirmationNumber: null
};

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_SERVICES':
      return {
        ...state,
        selectedServices: action.payload,
        // Reset dependent selections
        selectedArtist: null,
        selectedDate: null,
        selectedTime: null,
        selectedTimeEnd: null
      };
    case 'SET_ARTIST':
      return {
        ...state,
        selectedArtist: action.payload,
        selectedDate: null,
        selectedTime: null,
        selectedTimeEnd: null
      };
    case 'SET_DATE_TIME':
      return {
        ...state,
        selectedDate: action.payload.date,
        selectedTime: action.payload.time,
        selectedTimeEnd: action.payload.endTime
      };
    case 'SET_CLIENT_INFO':
      return {
        ...state,
        clientInfo: { ...state.clientInfo, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_CONFIRMATION':
      return {
        ...state,
        confirmationNumber: action.payload
      };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | null>(null);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }

  const { state, dispatch } = context;

  const actions = {
    setServices: useCallback((services: SubService[]) => {
      dispatch({ type: 'SET_SERVICES', payload: services });
    }, []),

    setArtist: useCallback((artist: string) => {
      dispatch({ type: 'SET_ARTIST', payload: artist });
    }, []),

    setDateTime: useCallback((date: Date, time: string, endTime: string) => {
      dispatch({
        type: 'SET_DATE_TIME',
        payload: { date, time, endTime }
      });
    }, []),

    setClientInfo: useCallback((info: Partial<ClientInfo>) => {
      dispatch({ type: 'SET_CLIENT_INFO', payload: info });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setConfirmation: useCallback((confirmationNumber: string) => {
      dispatch({ type: 'SET_CONFIRMATION', payload: confirmationNumber });
    }, []),

    resetBooking: useCallback(() => {
      dispatch({ type: 'RESET_BOOKING' });
    }, [])
  };

  return { state, ...actions };
};