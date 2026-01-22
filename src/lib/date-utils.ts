/**
 * Date utilities for parsing dates in local timezone
 * Prevents the UTC midnight interpretation issue with new Date("YYYY-MM-DD")
 */

/**
 * Parse a date string (YYYY-MM-DD) as local timezone
 * Using new Date("2026-02-14") parses as UTC midnight, which shows wrong day in some timezones
 * Using new Date(2026, 1, 14) creates the date in local timezone
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
}

/**
 * Parse a date + optional time string as local timezone
 */
export function parseLocalDateTime(dateStr: string, timeStr?: string | null): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours || 18, minutes || 0, 0, 0);
  } else {
    date.setHours(18, 0, 0, 0); // Default 6 PM
  }
  
  return date;
}
