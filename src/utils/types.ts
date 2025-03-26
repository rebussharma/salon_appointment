export interface SubService {
  id: number;
  mainServiceId: number;
  name: string;
  price: number;
  duration: number;
}

export interface MainService{
  id: number;
  name: string;
}

export interface ServiceStructure {
  [key: string]: SubService[];  // Using your existing SubService interface
}

export type WorkDay = ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Alldays' | 'Weekdays' | 'Weekends');

export interface DateTimeDto {
  appointmentDateTime: string;
  appointmentDateTimeStart: string;
  appointmentDateTimeEnd: string;
}

export interface Artist {
  id: string;
  name: string;
  workday: string[];
  serviceProvided: string[];
  dateTimeDto: DateTimeDto[];
}

export interface ClientInfo {
  name: string;
  emailId: string;
  phone: string;
  message: string;
  bookingDeviceType?: {}
}

export interface AppointmetnDetails{
  appointmentDateTime: DateTimeDto;
  serviceType: string;
  artist: string;
  status: string;
  confirmationNumer: string;
  appointmentDuration: number
}

export interface AppointmentData{
  data_insertion_date: string
  confirmationCode: number
  appointmentDateTime: string
  appointmentDuration: number
  serviceType: SubService[]
  artist: string
  clientName: string
  clientEmail: string
  clietnPhone: number
  appointmentNotes: string
  appointmentStatus : string
  id: number
}

export type emailProps = {
  clientDetails: ClientInfo,
  appointmentDetails:AppointmetnDetails
}

export interface DateTimeSelectionProps {
  selectedArtist: Artist | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  displayMonth: Date;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string, endTime: string) => void;
  onMonthChange: (date: Date) => void;
  isExpanded: boolean;  // Add this prop
  hasError?: boolean;  // Add this
  errorStyle?: React.CSSProperties;  // Add this
  appointmentDuration: number;
}

declare global{
  interface Window {
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };
  }
}
// Need to add this line after declare global
export { };

