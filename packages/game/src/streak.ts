const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Calculates the consecutive calendar-day streak including the new completion.
 * Multiple completions on the same day count as one day.
 */
export function calculateCurrentStreak(
  previousCompletionDates: Date[],
  completedAt: Date
): number {
  return calculateStreakAsOf([...previousCompletionDates, completedAt], completedAt);
}

export function calculateStreakAsOf(
  completionDates: Date[],
  referenceDate: Date
): number {
  const completedDays = new Set(completionDates.map(dayKey));
  const currentDay = dayKey(referenceDate);
  const latestDay = completedDays.has(currentDay)
    ? currentDay
    : completedDays.has(currentDay - DAY_MS)
      ? currentDay - DAY_MS
      : null;

  if (latestDay === null) return 0;

  let streak = 1;
  let day = latestDay - DAY_MS;

  while (completedDays.has(day)) {
    streak += 1;
    day -= DAY_MS;
  }

  return streak;
}
