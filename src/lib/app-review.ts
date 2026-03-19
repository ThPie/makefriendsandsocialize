import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';

const REVIEW_STATE_KEY = 'app_review_state';
const MIN_SESSIONS = 5;
const MIN_ACTIONS = 10;
const COOLDOWN_DAYS = 90;

interface ReviewState {
  sessionCount: number;
  actionCount: number;
  lastPromptedAt: string | null;
  hasReviewed: boolean;
}

function getState(): ReviewState {
  try {
    const raw = localStorage.getItem(REVIEW_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sessionCount: 0, actionCount: 0, lastPromptedAt: null, hasReviewed: false };
}

function saveState(state: ReviewState) {
  localStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(state));
}

/**
 * Track a new app session (call on app launch / resume).
 */
export function trackSession() {
  if (!Capacitor.isNativePlatform()) return;
  const state = getState();
  state.sessionCount++;
  saveState(state);
}

/**
 * Track a positive action (RSVP, match accepted, profile completed, etc.).
 */
export function trackPositiveAction() {
  if (!Capacitor.isNativePlatform()) return;
  const state = getState();
  state.actionCount++;
  saveState(state);
}

/**
 * Check if conditions are met and prompt for a review.
 * Call this after positive moments (e.g., successful RSVP, mutual match).
 * 
 * Conditions:
 * - At least MIN_SESSIONS app sessions
 * - At least MIN_ACTIONS positive actions
 * - Not prompted in the last COOLDOWN_DAYS days
 * - User hasn't already reviewed
 */
export async function maybeRequestReview(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const state = getState();

  if (state.hasReviewed) return false;
  if (state.sessionCount < MIN_SESSIONS) return false;
  if (state.actionCount < MIN_ACTIONS) return false;

  if (state.lastPromptedAt) {
    const lastPrompted = new Date(state.lastPromptedAt);
    const daysSince = (Date.now() - lastPrompted.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < COOLDOWN_DAYS) return false;
  }

  try {
    await InAppReview.requestReview();
    state.lastPromptedAt = new Date().toISOString();
    // We can't know if the user actually reviewed, but mark as prompted
    saveState(state);
    return true;
  } catch (error) {
    console.error('App review request failed:', error);
    return false;
  }
}

/**
 * Mark the user as having reviewed (call if you have a "don't ask again" option).
 */
export function markAsReviewed() {
  const state = getState();
  state.hasReviewed = true;
  saveState(state);
}

/**
 * Reset review tracking (for debugging).
 */
export function resetReviewState() {
  localStorage.removeItem(REVIEW_STATE_KEY);
}
