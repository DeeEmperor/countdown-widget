/**
 * examSchedule.ts
 * ─────────────────────────────────────────────
 * Single source of truth for the exam timetable.
 * Dates are stored in ISO-8601 local format so
 * `new Date(exam.date)` works without timezone math.
 */

export interface Exam {
  /** Unique stable identifier */
  id: string;
  /** Display name shown on the widget, e.g. "COS 202" */
  courseCode: string;
  /**
   * ISO-8601 datetime string in local time, e.g. "2026-07-01T16:30:00".
   * Used as the sort key and for countdown calculation.
   */
  date: string;
  /** Examination hall or room label */
  venue: string;
  /** Human-readable time range, e.g. "4:30 PM – 5:30 PM" */
  timeString: string;
}

export const EXAM_SCHEDULE: Exam[] = [
  {
    id: '1',
    courseCode: 'COS 202',
    date: '2026-07-01T16:30:00',
    venue: 'CBT',
    timeString: '4:30 PM – 5:30 PM',
  },
  {
    id: '2',
    courseCode: 'GNS 212',
    date: '2026-07-07T12:00:00',
    venue: 'CBT',
    timeString: '12:00 PM – 1:00 PM',
  },
  {
    id: '3',
    courseCode: 'UIL IFT 202',
    date: '2026-07-10T11:00:00',
    venue: 'LR 1–5',
    timeString: '11:00 AM – 2:00 PM',
  },
  {
    id: '4',
    courseCode: 'IFT 212',
    date: '2026-07-14T12:00:00',
    venue: 'CBT',
    timeString: '12:00 PM – 1:00 PM',
  },
  {
    id: '5',
    courseCode: 'UIL IFT 206',
    date: '2026-07-15T11:00:00',
    venue: 'LR 1–5',
    timeString: '11:00 AM',
  },
  {
    id: '6',
    courseCode: 'INS 202',
    date: '2026-07-21T11:00:00',
    venue: 'CISLT',
    timeString: '11:00 AM',
  },
  {
    id: '7',
    courseCode: 'UIL IFT 204',
    date: '2026-07-22T11:00:00',
    venue: 'LR 1–5',
    timeString: '11:00 AM',
  },
];
