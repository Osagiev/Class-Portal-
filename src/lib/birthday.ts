/** Formats a Date as "MM-DD" to compare against stored birthday strings. */
export function todayAsMonthDay(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/**
 * Full local date string (YYYY-MM-DD), used as the dedupe key for a day's
 * birthday posts. Built from local date parts rather than
 * date.toISOString() (which is UTC-based and can roll over to the wrong
 * calendar day near midnight in timezones ahead of UTC, like Lagos).
 */
export function todayAsISODate(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isToday(monthDay: string | undefined): boolean {
  if (!monthDay) return false;
  return monthDay === todayAsMonthDay();
}
