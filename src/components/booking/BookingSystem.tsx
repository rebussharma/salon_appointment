import { ArrowBack as ArrowBackIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, IconButton } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

// Import new hooks instead of individual API functions
import { useAPI } from '../../hooks/useApi';
import { useBookingState } from '../../hooks/useBookingState';

// Utilities and types
import { mainServices, peopleData, subServices } from '../../utils/Constants';
import { ClientInfo, ServiceStructure, SubService } from '../../utils/types';
import { getDeviceType } from '../../utils/utils';

// Components
import BookingConfirmation from '../dialogs/BookingConfirmation';
import BookingFail from '../dialogs/BookingFail';
import BookingSuccess from '../dialogs/BookingSuccess';
import ArtistSelection from './ArtistSelection';
import BookingSummary from './BookingSummary';
import ClientInfoForm from './ClientInfoForm';
import DateTimeSelection from './DatetimeSelection';
import NavigationGuard from './NavigatioGuard';
import ServiceSelection from './ServiceSelection';

// Error boundary and loading state
import { ErrorBoundary } from '../common/ErrorBoundary';
import { OverlayLoadingState } from '../common/LoadingState';
import CaptchaComponent from '../../services/Captcha';

type ViewType = 'main' | 'new' | 'update' | 'cancel';

export const ValidationError = () => (
  <Box 
    sx={{ 
      position: 'absolute',
      right: -8,
      top: -8,
      color: '#d32f2f',
      backgroundColor: 'white',
      borderRadius: '50%',
      padding: '4px'
    }}
  >
    <WarningIcon color="error" />
  </Box>
);

interface BookingSystemProps {
  setView: (view: ViewType) => void;
  isUpdating: boolean;
  onCancel?: () => void;
  confirmationNumber?: string|null;
  setConfirmationNumber: (code: string) => void;
  prefillData?: any;
}

export default function BookingSystem({ 
  setView, 
  isUpdating, 
  onCancel, 
  confirmationNumber,
  setConfirmationNumber,
  prefillData 
}: BookingSystemProps) {
  // Use the new useBookingState and useAPI hooks
  const {
    selectedServices, setServices,
    selectedArtist, setArtist,
    selectedDate, selectedTime, selectedTimeEnd,
    clientInfo, setClientInfo,
    totalDuration,
    setDateTime,
    isBookingComplete,
    resetBooking
  } = useBookingState();

  const {
    isLoading,
    error,
    createBooking,
    updateBooking,
    clearError
  } = useAPI();
  
  // Local UI state
  const [captchaSuccess, setCaptchaSuccess] = useState<any | null>(null);
  const [captchaTimeStamp, setCaptchaTimeStamp] = useState<any | null>(null);
  const [widgetId, setWidgetId] = useState<any | null>(null);

  const [failureOpen, setFailureOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string>('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [validationErrors, setValidationErrors] = useState<{
    services: boolean;
    artist: boolean;
    datetime: boolean;
    clientInfo: boolean;
  }>({
    services: false,
    artist: false,
    datetime: false,
    clientInfo: false
  });

  // Initialize state from prefillData if updating
  useEffect(() => {
    if (isUpdating && prefillData) {
      // Handle services
      if (prefillData.serviceType) {
        const services = parseServiceString(prefillData.serviceType);
        setServices(services);
      }

      // Handle artist
      if (prefillData.artist) {
        setArtist(prefillData.artist);
      }

      // Handle date and time
      if (prefillData.appointmentDateTime) {
        const date = new Date(prefillData.appointmentDateTime);
        
        // Format time string
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12; // Convert to 12-hour format
        
        const timeStr = `${hours}${minutes > 0 ? `:${minutes}` : ''}${ampm}`;
        
        // Calculate end time based on duration
        const endDate = new Date(date);
        endDate.setMinutes(date.getMinutes() + prefillData.appointmentDuration);
        
        // Format end time
        let endHours = endDate.getHours();
        const endMinutes = endDate.getMinutes();
        const endAmpm = endHours >= 12 ? 'pm' : 'am';
        endHours = endHours % 12 || 12;
        
        const endTimeStr = `${endHours}${endMinutes > 0 ? `:${endMinutes}` : ''}${endAmpm}`;
        
        setDateTime(date, timeStr, endTimeStr);
      }

      // Handle client info
      if (prefillData.clientName) {
        setClientInfo({
          name: prefillData.clientName,
          emailId: prefillData.clientEmail,
          phone: prefillData.clientPhone,
          message: prefillData.appointmentNotes || '',
          bookingDeviceType: prefillData.bookingDeviceType
        });
      }
    }
  }, [isUpdating, prefillData, setServices, setArtist, setDateTime, setClientInfo]);

  // Function to check all required fields
  const validateBookingFields = () => {
    const errors = {
      services: selectedServices.length === 0,
      artist: !selectedArtist,
      datetime: !selectedDate || !selectedTime,
      clientInfo: !clientInfo.name || (!clientInfo.emailId && !clientInfo.phone)
    };
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };
  
  // Function to scroll to first error
  const scrollToError = () => {
    const errorSections = Object.entries(validationErrors)
      .filter(([_, hasError]) => hasError)
      .map(([section]) => section);
  
    if (errorSections.length > 0) {
      const firstErrorSection = document.getElementById(errorSections[0]);
      if (firstErrorSection) {
        firstErrorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Add vibration if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
      }
    }
  };

  // Group services by category
  const groupServicesByCategory = (services: SubService[]): ServiceStructure => {
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

  // Parse service string from API
  const parseServiceString = (serviceType: any): SubService[] => {
    // If serviceType is already an array of SubService objects
    if (Array.isArray(serviceType) && serviceType.length > 0 && 'id' in serviceType[0]) {
      return serviceType;
    }
    
    // If it's a string like "(3) Threading-Eyebrow Facial-Anti-Aging Lashes-Volume Set"
    if (typeof serviceType === 'string') {
      // Remove the count prefix and split into individual service strings
      const servicesStr = serviceType.replace(/^\(\d+\)\s*/, '').split(' ');
      
      // Map each service string to its corresponding SubService object
      return servicesStr.reduce((acc: SubService[], serviceStr) => {
        const [mainServiceName, ...subServiceParts] = serviceStr.split('-');
        const subServiceName = subServiceParts.join('-'); // Rejoin in case service name has hyphens
        
        // Find the corresponding SubService object
        const matchingService = subServices.find(service => {
          const mainService = mainServices.find(ms => ms.id === service.mainServiceId);
          return mainService?.name === mainServiceName && service.name === subServiceName;
        });
        
        if (matchingService) {
          acc.push(matchingService);
        }
        
        return acc;
      }, []);
    }
    
    return [];
  };
  
  // Expanded sections state for UI
  const [expandedSections, setExpandedSections] = useState({
    services: true,  // Always start with services expanded
    artist: isUpdating,  // Expand if updating
    datetime: isUpdating,
    clientInfo: isUpdating
  });
  
  // Filter available artists based on selected services
  const availableArtists = useMemo(() => {
    return peopleData.filter(person => {
      const requiredServiceNames = selectedServices.map(service => {
        const mainService = mainServices.find(ms => ms.id === service.mainServiceId);
        return mainService?.name || '';
      });
      
      const uniqueRequiredServices = Array.from(new Set(requiredServiceNames));
      
      return uniqueRequiredServices.every(serviceName => 
        person.serviceProvided.includes(serviceName as string) ||
        person.serviceProvided.includes('all')
      );
    });
  }, [selectedServices]);

  // Handle service selection
  const handleServiceSelect = (services: SubService[]) => {    
    setServices(services);
    // Reset validation errors
    setValidationErrors(prev => ({ ...prev, services: false }));
  };

  // Handle artist selection
  const handleArtistSelect = (artist: string) => {
    setArtist(artist);
    // Reset validation errors
    setValidationErrors(prev => ({ ...prev, artist: false }));
  };

  const isTokenValid = () => {
    return captchaSuccess && Date.now() - captchaTimeStamp < 120_000;
  };

  // Handle booking button click
  const handleBookingClick = () => {
    if (!isTokenValid){
      if (widgetId && window.turnstile) {
        window.turnstile.execute(widgetId); // Re-trigger CAPTCHA
        return;
      } else {
        alert("CAPTCHA not ready");
        return;
      }
    }
    if (validateBookingFields()) {
      setConfirmationOpen(true);
    } else {
      scrollToError();
    }
  
  };

  // Style for elements with validation errors
  const getErrorStyle = (hasError: boolean) => ({
    border: hasError ? '1px solid #d32f2f' : undefined,
    boxShadow: hasError ? '0 0 0 1px #d32f2f' : undefined,
    position: 'relative' as const
  });  

  // Handle confirmation and booking submission
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedTimeEnd || !selectedArtist) {
      return;
    }
    
    // Set device type
    const updatedClientInfo = {
      ...clientInfo,
      bookingDeviceType: getDeviceType()
    };
    setClientInfo(updatedClientInfo);
    
    try {
      let result;
      
      if (isUpdating && prefillData?.id) {
        // Update existing booking
        result = await updateBooking(
          prefillData.id,
          selectedServices,
          selectedArtist,
          selectedDate,
          selectedTime,
          selectedTimeEnd,
          updatedClientInfo,
          confirmationNumber || ''
        );
      } else {        
        // Create new booking
        result = await createBooking(
          selectedServices,
          selectedArtist,
          selectedDate,
          selectedTime,
          selectedTimeEnd,
          updatedClientInfo,
          captchaSuccess
        );
      }
      
      if (result) {
        setConfirmationOpen(false);
        setSuccessOpen(true);
        setConfirmationNumber(result.confirmationCode.toString());
      } else {
        setBookingError(error || 'Failed to process booking');
        setConfirmationOpen(false);
        setFailureOpen(true);
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setConfirmationOpen(false);
      setFailureOpen(true);
    }
  };

  // Handle time selection
  const handleSelectedTime = (time: string, endTime: string) => {
    if (selectedDate) {
      setDateTime(selectedDate, time, endTime);
      // Reset validation errors
      setValidationErrors(prev => ({ ...prev, datetime: false }));
    }
  };
  
  // Handle client info changes
  const handleClientInfoChange = (info: Partial<ClientInfo>) => {
    setClientInfo({ ...clientInfo, ...info });
    // Reset validation errors for client info
    if (info.name || info.emailId || info.phone) {
      setValidationErrors(prev => ({ ...prev, clientInfo: false }));
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ maxWidth: 768, mx: 'auto', p: 2, position: 'relative' }}>
        <NavigationGuard />

        {/* Loading overlay */}
        {isLoading && <OverlayLoadingState message={isUpdating ? "Updating appointment..." : "Creating appointment..."} />}

        {/* Back button */}
        <IconButton 
          onClick={onCancel}
          sx={{ 
            position: 'absolute',
            left: 16,
            top: 16,
            zIndex: 1, 
            backgroundColor: '#d7d3d3',
            '&:hover': {
              backgroundColor: '#f3f4f6'
            }
          }}
        >
          <ArrowBackIcon/>
        </IconButton>
        
        {/* Services Selection */}
        <Box sx={{ mb: 2 }}>
          <ServiceSelection 
            services={groupServicesByCategory(subServices)}
            selectedServices={selectedServices}
            onServiceSelect={handleServiceSelect}
            isExpanded={true}
            hasError={validationErrors.services}
            errorStyle={getErrorStyle(validationErrors.services)}
          />
        </Box>

        {(expandedSections.services || selectedServices.length > 0) && (
          <>
            {/* Artist Selection */}
            <Box sx={{ mb: 2 }}>
              <ArtistSelection
                availableArtists={availableArtists}
                selectedArtist={selectedArtist || ''}
                onPersonSelect={handleArtistSelect}
                isExpanded={expandedSections.artist}
                hasError={validationErrors.artist}
                errorStyle={getErrorStyle(validationErrors.artist)}
              />
            </Box>

            {(expandedSections.artist || selectedArtist) && (
              <>
                {/* Date & Time Selection */}
                <Box sx={{ mb: 2 }}>
                  <DateTimeSelection
                    selectedArtist={peopleData.find(p => p.name === selectedArtist) || null}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    displayMonth={displayMonth}
                    onDateSelect={(date) => setDateTime(date, selectedTime || '', selectedTimeEnd || '')}
                    onTimeSelect={handleSelectedTime}
                    onMonthChange={setDisplayMonth}
                    isExpanded={expandedSections.datetime}
                    hasError={validationErrors.datetime}
                    errorStyle={getErrorStyle(validationErrors.datetime)}
                    appointmentDuration={totalDuration}
                  />
                </Box>

                {/* User Information */}
                {/* User Information */}
                {(expandedSections.datetime || (selectedDate && selectedTime)) && (
                  <Box sx={{ mb: 2 }}>
                    <ClientInfoForm
                      clientInfo={clientInfo}
                      onClientInfoChange={handleClientInfoChange}
                      validationErrors={{
                        name: validationErrors.clientInfo ? "Name is required" : undefined,
                        emailId: validationErrors.clientInfo ? "Email or phone is required" : undefined,
                        phone: validationErrors.clientInfo ? "Email or phone is required" : undefined
                      }}
                    />
                  </Box>
                )}
              </>
            )}      

            {/* Booking Summary */}
            <Box sx={{ mb: 2 }}>
              <BookingSummary
                selectedServices={selectedServices}
                services={groupServicesByCategory(subServices)}
                selectedArtist={selectedArtist || ''}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </Box>
            
            {/* Cloudfare turnstile to handle captcha*/}
            <CaptchaComponent 
                onSuccess={(token) => setCaptchaSuccess(token)} 
                setCaptchaTimeStamp={(stamp) => setCaptchaTimeStamp(stamp)}
                setWidgetId={(id)=>setWidgetId(id)}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {onCancel && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    borderColor: '#000000',
                    color: '#000000',
                    '&:hover': {
                      borderColor: '#2b2b2b',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Cancel
                </Button>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleBookingClick}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#000000',
                  '&:hover': {
                    backgroundColor: '#2b2b2b'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#cccccc'
                  }
                }}
              >
                {isUpdating ? 'Update Booking' : 'Complete Booking'}
              </Button>
            </Box>

            {/* Validation Errors */}
            {Object.values(validationErrors).some(error => error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>Please complete all required fields</AlertTitle>
                {validationErrors.services && <div>• Select at least one service</div>}
                {validationErrors.artist && <div>• Choose an artist</div>}
                {validationErrors.datetime && <div>• Select date and time</div>}
                {validationErrors.clientInfo && <div>• Complete contact information</div>}
              </Alert>
            )}

            {/* Dialogs */}
            {isBookingComplete && (
              <>
                <BookingConfirmation
                  open={confirmationOpen}
                  onClose={() => setConfirmationOpen(false)}
                  onConfirm={handleConfirm}
                  selectedServices={selectedServices}
                  services={groupServicesByCategory(subServices)}
                  selectedArtist={selectedArtist!}
                  selectedDate={selectedDate!}
                  selectedTime={selectedTime!}
                  clientInfo={clientInfo}
                />

                <BookingSuccess
                  open={successOpen}
                  setView={() => setView('main')}
                  bookingDetails={{
                    confirmationNumber: confirmationNumber,
                    name: clientInfo.name,
                    date: selectedDate!,
                    time: selectedTime!,
                    email: clientInfo.emailId,
                    phone: clientInfo.phone
                  }}
                />

                <BookingFail
                  open={failureOpen}
                  setView={() => setView('main')}
                  error={bookingError}
                  clientInfo={clientInfo}
                />
              </>
            )}
          </>
        )}
      </Box>
    </ErrorBoundary>
  );
}