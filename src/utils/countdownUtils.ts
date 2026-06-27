/**
 * countdownUtils.ts
 * ─────────────────────────────────────────────
 * Pure utility functions for finding the next exam
 * and computing the remaining time. Both functions
 * accept an optional `now` parameter so they can be
 * unit-tested with a fixed reference time.
 */

import type {Exam} from '../data/examSchedule';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Countdown {
  /** Full days remaining */
  days: number;
  /** Remaining hours after subtracting whole days (0–23) */
  hours: number;
  /** Remaining minutes after subtracting whole hours (0–59) */
  minutes: number;
  /** Total remaining minutes (convenience field for comparisons) */
  totalMinutes: number;
  /** Whether the exam is in the past */
  isPast: boolean;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Returns the first exam whose start time is strictly in the future,
 * sorted ascending by date.  Returns `null` when no upcoming exams remain.
 *
 * @param exams  - Array of Exam objects (order does not matter)
 * @param now    - Reference time; defaults to `new Date()`
 */
export function getNextExam(exams: Exam[], now: Date = new Date()): Exam | null {
  const upcoming = exams
    .filter(exam => new Date(exam.date).getTime() > now.getTime())
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

  return upcoming[0] ?? null;
}

/**
 * Calculates the exact time remaining until an exam starts.
 *
 * @param exam  - The target exam
 * @param now   - Reference time; defaults to `new Date()`
 */
export function getCountdown(exam: Exam, now: Date = new Date()): Countdown {
  const examMs = new Date(exam.date).getTime();
  const nowMs = now.getTime();
  const diffMs = examMs - nowMs;

  if (diffMs <= 0) {
    return {days: 0, hours: 0, minutes: 0, totalMinutes: 0, isPast: true};
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {days, hours, minutes, totalMinutes, isPast: false};
}

/**
 * Convenience: returns a formatted label like "11d 06h 43m".
 */
export function formatCountdown(countdown: Countdown): string {
  if (countdown.isPast) {
    return 'Exam started';
  }
  const d = String(countdown.days).padStart(2, '0');
  const h = String(countdown.hours).padStart(2, '0');
  const m = String(countdown.minutes).padStart(2, '0');
  return `${d}d  ${h}h  ${m}m`;
}
