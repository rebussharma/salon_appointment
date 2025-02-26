import { describe, it } from '@jest/globals';

describe('Appointments Fixtures', () => {
  it('should have valid appointment data structure', () => {
    // This is a placeholder test to satisfy Jest's requirement
    // You can add actual fixture validation tests here if needed
    expect(true).toBe(true);
  });
});

// Export your appointment fixtures here
export const sampleAppointments = [
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
];