/**
 * examStorage.ts
 * ─────────────────────────────────────────────
 * Persistence layer for user-managed exam data.
 * Uses AsyncStorage to save/load exams locally on device.
 *
 * On first launch the hardcoded EXAM_SCHEDULE is seeded into storage.
 * After that the user fully manages their own list.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {EXAM_SCHEDULE, type Exam} from './examSchedule';

const STORAGE_KEY = '@countdown_exams';
const SEEDED_KEY = '@countdown_seeded';

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns the user's saved exams.
 * On first launch, seeds from EXAM_SCHEDULE and persists.
 */
export async function getExams(): Promise<Exam[]> {
  try {
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      // First launch — seed defaults
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(EXAM_SCHEDULE));
      await AsyncStorage.setItem(SEEDED_KEY, 'true');
      return [...EXAM_SCHEDULE];
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Exam[];
  } catch {
    return [...EXAM_SCHEDULE];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Overwrites the full exam list.
 */
export async function saveExams(exams: Exam[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
}

/**
 * Appends one exam and persists.
 */
export async function addExam(exam: Exam): Promise<Exam[]> {
  const exams = await getExams();
  exams.push(exam);
  await saveExams(exams);
  return exams;
}

/**
 * Removes an exam by ID and persists. Returns updated list.
 */
export async function deleteExam(id: string): Promise<Exam[]> {
  const exams = await getExams();
  const updated = exams.filter(e => e.id !== id);
  await saveExams(updated);
  return updated;
}

/**
 * Updates an exam by ID and persists. Returns updated list.
 */
export async function updateExam(updated: Exam): Promise<Exam[]> {
  const exams = await getExams();
  const idx = exams.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    exams[idx] = updated;
  }
  await saveExams(exams);
  return exams;
}

/**
 * Generates a unique ID for new exams.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
