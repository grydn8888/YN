import { Question, RoundRecord } from '../types';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEYS = {
  QUESTIONS: 'yes_no_oracle_questions_v1',
  HISTORY: 'yes_no_oracle_history_v1',
  STATS: 'yes_no_oracle_stats_v1',
  SOUND_MUTED: 'yes_no_oracle_sound_muted',
};

export interface GameStats {
  totalRounds: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
}

export function loadStoredQuestions(): Question[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load questions from storage', err);
  }
  return INITIAL_QUESTIONS;
}

export function saveStoredQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to storage', err);
  }
}

export function loadStoredHistory(): RoundRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.slice(-12); // User explicitly specified last 12 rounds
      }
    }
  } catch (err) {
    console.error('Failed to load history from storage', err);
  }
  return [];
}

export function saveStoredHistory(history: RoundRecord[]): void {
  try {
    // Keep max 12 rounds
    const trimmed = history.slice(-12);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save history to storage', err);
  }
}

export function loadStoredStats(): GameStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load stats', err);
  }
  return { totalRounds: 0, totalWins: 0, currentStreak: 0, bestStreak: 0 };
}

export function saveStoredStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats', err);
  }
}

export function loadSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
  } catch {
    return false;
  }
}

export function saveSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
  } catch (err) {
    console.error('Failed to save sound preference', err);
  }
}
