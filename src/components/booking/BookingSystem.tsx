import { ArrowBack as ArrowBackIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { postBooking } from '../../utils/axios/bookAppointment';
import { updateBooking } from '../../utils/axios/updateAppointment';
import { mainServices, peopleData, subServices } from '../../utils/Constants';
import { Artist, ClientInfo, MainService, ServiceStructure, SubService } from '../../utils/types';
import { combineDateAndTime, getDeviceType } from '../../utils/utils';
import BookingConfirmation from '../dialogs/BookingConfirmation';
import BookingFail from '../dialogs/BookingFail';
import BookingSuccess from '../dialogs/BookingSuccess';
import ArtistSelection from './ArtistSelection';
import BookingSummary from './BookingSummary';
import ClientInfoForm from './ClientInfoForm';
import DateTimeSelection from './DatetimeSelection';
import NavigationGuard from './NavigatioGuard';
import ServiceSelection from './ServiceSelection';

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
  
  
  // Update the selectedServices state initialization
const [selectedServices, setSelectedServices] = useState<SubService[]>(() => {
  if (prefillData?.serviceType) {
    return parseServiceString(prefillData.serviceType);
  }
  return [];
}); 
  
  const [selectedArtist, setselectedArtist] = useState<string>(
    prefillData?.artist || ''
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    prefillData?.appointmentDateTime ? new Date(prefillData.appointmentDateTime) : null
  );

  // Update the selectedTime state initialization
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (prefillData?.appointmentDateTime) {
      const date = new Date(prefillData.appointmentDateTime);
      // Format time to match the expected format (e.g., "2pm" or "11am")
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12; // Convert to 12-hour format
      return `${hours}${ampm}`;
    }
    return '';
  });

  const [selectedTimeEnd, setSelectedTimeEnd] = useState<string>('')
  
  const [clientInfo, setClientInfo] = useState<ClientInfo>(
    prefillData ? 
      {
        name: prefillData.clientName,
        emailId: prefillData.clientEmail,
        phone: prefillData.clientPhone,
        message: prefillData.appointmentNotes
       } 
      : 
      {
        name: '',
        emailId: '',
        phone: '',
        message: ''
      }
  );

  const [expandedSections, setExpandedSections] = useState({
    services: true,  // Always start with services expanded
    artist: isUpdating,  // Expand if updating
    datetime: isUpdating,
    clientInfo: isUpdating
  });

  useEffect(() => {
    if (isUpdating && prefillData) {
      const services = parseServiceString(prefillData.serviceType);
      setSelectedServices(services);
      
      // Ensure all sections are expanded when updating
      setExpandedSections({
        services: true,
        artist: true,
        datetime: true,
        clientInfo: true
      });
    }
  }, [isUpdating, prefillData]);
  
  type FilterStrategy = 'id' | 'name';

  // Generic template function
  const filterArtistsByService = <T extends FilterStrategy>(
    artists: Artist[],
    services: SubService[],
    strategy: T,
    mainServicesList: MainService[]
  ): Artist[] => {
    return artists.filter(person => {
      const requiredServices = services.map(service => {
        // Ensure we're comparing strings
        const mainServiceId = service.mainServiceId.toString();
        const mainService = mainServicesList.find(ms => ms.id.toString() === mainServiceId);
  
        if (strategy === 'id') {
          return mainServiceId;
        } else {
          return mainService?.name || '';
        }
      });
  
      const uniqueRequiredServices = Array.from(new Set(requiredServices));
      
      return uniqueRequiredServices.every(requiredService => {
        if (strategy === 'id') {
          const serviceName = mainServicesList.find(ms => ms.id.toString() === requiredService.toString())?.name;
          return serviceName && (
            person.serviceProvided.includes(serviceName) ||
            person.serviceProvided.includes('all')
          );
        } else {
          return person.serviceProvided.includes(requiredService as string) ||
            person.serviceProvided.includes('all');
        }
      });
    });
  };
  
  const availableArtists = filterArtistsByService(peopleData, selectedServices, 'name', mainServices);

  // Validation
  const isBookingValid = () =>
    selectedServices.length > 0 &&
    selectedArtist &&
    selectedDate &&
    selectedTime &&
    clientInfo.name &&
    (clientInfo.emailId || clientInfo.phone);

    const handleServiceSelect = (services: SubService[]) => {    
      setSelectedServices(services);
      // Reset subsequent selections when services change
      if (!isUpdating) {  // Only reset if not updating
        setselectedArtist('');
        setSelectedDate(null);
        setSelectedTime('');
      }
    };

  // Handle artist selection
  const handleArtistSelect = (artist: string) => {
    setselectedArtist(artist);
    // Reset date and time when artist changes
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleBookingClick = () => {
    if (validateBookingFields()) {
      setConfirmationOpen(true);
    } else {
      scrollToError();
    }
  };

  const getErrorStyle = (hasError: boolean) => ({
    border: hasError ? '1px solid #d32f2f' : undefined,
    boxShadow: hasError ? '0 0 0 1px #d32f2f' : undefined,
    position: 'relative' as const
  });  
  
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);

    const handleConfirm = async () => {    
    let selectedDateTime = combineDateAndTime(selectedDate, selectedTime);
    let selectedDateTimeEnd = combineDateAndTime(selectedDate, selectedTimeEnd)
    clientInfo.bookingDeviceType = getDeviceType();  
      
    const result = isUpdating ?
                    await updateBooking(
                      selectedServices, 
                      selectedArtist, 
                      selectedDateTime, 
                      selectedDateTimeEnd,
                      totalDuration,
                      clientInfo, 
                      prefillData?.id, 
                      confirmationNumber
                    )
                    :
                    await postBooking(
                      selectedServices, 
                      selectedArtist, 
                      selectedDateTime, 
                      selectedDateTimeEnd,
                      totalDuration, 
                      clientInfo
                    )    
    
    if (result.success) {
      setConfirmationOpen(false);
      setSuccessOpen(true);
      if(result.data){        
        setConfirmationNumber(result.data["confirmationCode"].toString())              
      }      
      
    } else {
      setBookingError(result.error || 'Failed to book appointment');
      setConfirmationOpen(false);
      setFailureOpen(true);
    }
  };  

  const handleSelectedTime = (time:string, endTime: string) =>{
    setSelectedTime(time)
    setSelectedTimeEnd(endTime)
  }

  return (
    <Box sx={{ maxWidth: 768, mx: 'auto', p: 2 }}>
          <NavigationGuard></NavigationGuard>

      <IconButton 
        onClick={onCancel}
        sx={{ 
          position: 'absolute',
          left: 16,
          top: 16,
          zIndex:'1', 
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
             selectedArtist={selectedArtist}
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
                 onDateSelect={setSelectedDate}
                 onTimeSelect={handleSelectedTime}
                 onMonthChange={setDisplayMonth}
                 isExpanded={expandedSections.datetime}
                 hasError={validationErrors.datetime}
                 errorStyle={getErrorStyle(validationErrors.datetime)}
                 appointmentDuration={totalDuration}
              />
            </Box>

              {/* User Information */}
              {(expandedSections.datetime || (selectedDate && selectedTime)) && (
                <Box sx={{ mb: 2 }}>
                  <ClientInfoForm
                    clientInfo={clientInfo}
                    onClientInfoChange={setClientInfo}
                    isExpanded={expandedSections.clientInfo}
                    hasError={validationErrors.clientInfo}
                    errorStyle={getErrorStyle(validationErrors.clientInfo)}
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
              selectedArtist={selectedArtist}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </Box>

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

          {Object.values(validationErrors).some(error => error) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Please complete all required fields</AlertTitle>
              {validationErrors.services && <div>• Select at least one service</div>}
              {validationErrors.artist && <div>• Choose an artist</div>}
              {validationErrors.datetime && <div>• Select date and time</div>}
              {validationErrors.clientInfo && <div>• Complete contact information</div>}
            </Alert>
          )}

    {isBookingValid() && (
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
                setView={()=>setView('main')}
                error={bookingError}
                clientInfo={clientInfo}
              />
        </>
      )}
        </>
      )}
    </Box>
  );
}