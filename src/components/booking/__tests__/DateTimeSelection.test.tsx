import { isSlotAvailable } from "../../../utils/dateTimeSelection.utils";
import { Artist } from "../../../utils/types";

describe('DateTime Selection Tests', () => {
  let sampleArtist: Artist;
  const appointmentDuration = 30;

  beforeAll(() => {
    // Enable Fake Timers
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    sampleArtist = {
      id: '100',
      name: 'Sammy',
      workday: ['Alldays'],
      serviceProvided: ['Threading', 'Facial'],
      dateTimeDto: [
        {
          appointmentDateTime: "2025-02-14T09:00",
          appointmentDateTimeStart: "2025-02-14T09:00",
          appointmentDateTimeEnd: "2025-02-14T10:20"
        },
        {
          appointmentDateTime: "2025-02-14T10:30",
          appointmentDateTimeStart: "2025-02-14T10:30",
          appointmentDateTimeEnd: "2025-02-14T13:30"
        }
      ]
    };
  });

  describe('Edge Cases', () => {
    it('should handle store opening time edge case', () => {
      const dateStr = '2025-02-14';
      // Mock Date.now() for 8 AM
      const mockTime = new Date('2025-02-14T08:00:00').valueOf();
      jest.spyOn(Date, 'now').mockImplementation(() => mockTime);
      
      expect(isSlotAvailable(
        '09:00',
        '09:30',
        dateStr,
        sampleArtist,
        appointmentDuration
      )).toBe(false);
    });
  });

  describe('Booking Time Buffer Tests', () => {
    interface TestTime {
      slot: string;
      expected: boolean;
      description: string;
    }

    // Current time is fixed at 11:55 AM
    const testTimes: TestTime[] = [
      {
        slot: '13:54',
        expected: false,
        description: 'slot within 2-hour buffer'
      },
      {
        slot: '13:55',
        expected: false,
        description: 'slot exactly at 2-hour mark'
      },
      {
        slot: '14:00',
        expected: true,
        description: 'slot after 2-hour buffer'
      }
    ];

    testTimes.forEach(({ slot, expected, description }) => {
      it(`should properly handle ${slot} slot (${description})`, () => {
        // Mock current time to 11:55 AM
        const mockTime = new Date('2025-02-14T11:55:00').valueOf();
        jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

        // Calculate end time
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const endHour = slotHour + Math.floor((slotMinute + appointmentDuration) / 60);
        const endMinute = (slotMinute + appointmentDuration) % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        try {
          const result = isSlotAvailable(
            slot,
            endTime,
            '2025-02-14',
            sampleArtist,
            appointmentDuration
          );

          expect(result).toBe(expected);
        } finally {
          jest.spyOn(Date, 'now').mockRestore();
        }
      });
    });
  });
});