import { Artist, MainService, SubService } from '../utils/types';

export const mainServices: MainService[] = [
  { id: 100, name: 'Threading' },
  { id: 200, name: 'Facial' },
  { id: 300, name: 'Lashes' }
];

export const subServices: SubService[] = [
  { id: 101, mainServiceId: 100, name: 'Eyebrow', price: 15, duration: 5 },
  { id: 102, mainServiceId: 100, name: 'Upperlip', price: 25, duration: 30 },
  { id: 201, mainServiceId: 200, name: 'Deep-Cleansing', price: 85, duration: 60 },
  { id: 202, mainServiceId: 200, name: 'Anti-Aging', price: 120, duration: 90 },
  { id: 301, mainServiceId: 300, name: 'Classic Set', price: 89, duration: 90 },
  { id: 302, mainServiceId: 300, name: 'Volume Set', price: 129, duration: 120 }
];

export const peopleData: Artist[] = [
  {
    id:'100',
    name: 'Sammy',
    workday: ['Alldays'],
    serviceProvided: ['Threading', 'Tinting', 'Facial', 'Lashes'],
    dateTimeDto: [
      {
        appointmentDateTime: "2025-02-15T09:00",
        appointmentDateTimeStart: "2025-02-15T09:00",
        appointmentDateTimeEnd: "2025-02-15T10:20"
      },
      {
        appointmentDateTime: "2025-02-15T14:00",
        appointmentDateTimeStart: "2025-02-15T14:00",
        appointmentDateTimeEnd: "2025-02-15T14:45"
      },
      {
        appointmentDateTime: "2025-02-15T17:00",
        appointmentDateTimeStart: "2025-02-15T17:00",
        appointmentDateTimeEnd: "2025-02-15T17:30"
      },
      {
        appointmentDateTime: "2025-02-15T10:30",
        appointmentDateTimeStart: "2025-02-15T10:30",
        appointmentDateTimeEnd: "2025-02-15T13:30"
      },
      {
        appointmentDateTime: "2025-02-15T15:00",
        appointmentDateTimeStart: "2025-02-15T15:00",
        appointmentDateTimeEnd: "2025-02-15T16:45"
      } ,
      {
        appointmentDateTime: "2025-02-15T17:40",
        appointmentDateTimeStart: "2025-02-15T17:40",
        appointmentDateTimeEnd: "2025-02-15T21:45"
      }  ,
      {
        appointmentDateTime: "2025-02-14T17:00",
        appointmentDateTimeStart: "2025-02-14T17:00",
        appointmentDateTimeEnd: "2025-02-14T21:00"
      }    ,
      {
        appointmentDateTime: "2025-02-14T14:15",
        appointmentDateTimeStart: "2025-02-14T14:15",
        appointmentDateTimeEnd: "2025-02-14T16:50"
      }  
    ]
  },
  {
    id:'200',
    name: 'Rebus',
    workday: ['Monday', 'Wednesday'],
    serviceProvided: ['Threading', 'Lashes'],
    dateTimeDto:[]
  },
  {
    id:'300',
    name: 'Weekends',
    workday: ['Weekends'],
    serviceProvided: ['Threading', 'Facial'],
    dateTimeDto:[]
  },
  {
    id:'400',
    name: 'Weekdays',
    workday: ['Weekdays'],
    serviceProvided: ['Threading', 'Lashes'],
    dateTimeDto:[]
  },
];

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 21; hour++) {
    const timeString = `${hour % 12 || 12}${hour >= 12 ? 'pm' : 'am'}`;
    slots.push(timeString);
  }
  return slots;
};
