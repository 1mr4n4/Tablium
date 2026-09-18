import { ClassSession, TimetableConfig } from '../types';

export const defaultTimetable: TimetableConfig = {
  id: 'default',
  name: 'Mon Emploi du Temps',
  activeGroup: undefined,
  timeSlots: [
    { startTime: '08:30', endTime: '10:15' },
    { startTime: '10:30', endTime: '12:15' },
    { startTime: '14:00', endTime: '15:45' },
    { startTime: '16:00', endTime: '17:45' },
  ],
  sessions: [],
};
