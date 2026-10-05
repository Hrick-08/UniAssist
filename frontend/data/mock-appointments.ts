export interface AppointmentSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DaySchedule {
  date: string; // e.g. "Tuesday, Oct 6"
  dateShort: string; // e.g. "Oct 6"
  slots: AppointmentSlot[];
}

export const MOCK_APPOINTMENT_SCHEDULE: DaySchedule[] = [
  {
    date: "Tuesday, October 6",
    dateShort: "Tue, Oct 6",
    slots: [
      { id: "slot-1", time: "10:30 AM", available: true },
      { id: "slot-2", time: "12:00 PM", available: false },
      { id: "slot-3", time: "2:30 PM", available: true },
      { id: "slot-4", time: "4:00 PM", available: true }
    ]
  },
  {
    date: "Wednesday, October 7",
    dateShort: "Wed, Oct 7",
    slots: [
      { id: "slot-5", time: "10:00 AM", available: true },
      { id: "slot-6", time: "11:30 AM", available: true },
      { id: "slot-7", time: "2:00 PM", available: false },
      { id: "slot-8", time: "3:30 PM", available: true }
    ]
  },
  {
    date: "Thursday, October 8",
    dateShort: "Thu, Oct 8",
    slots: [
      { id: "slot-9", time: "10:30 AM", available: true },
      { id: "slot-10", time: "12:00 PM", available: true },
      { id: "slot-11", time: "2:30 PM", available: true },
      { id: "slot-12", time: "4:00 PM", available: true }
    ]
  },
  {
    date: "Friday, October 9",
    dateShort: "Fri, Oct 9",
    slots: [
      { id: "slot-13", time: "9:30 AM", available: true },
      { id: "slot-14", time: "11:00 AM", available: true },
      { id: "slot-15", time: "1:30 PM", available: false },
      { id: "slot-16", time: "3:00 PM", available: true }
    ]
  }
];
