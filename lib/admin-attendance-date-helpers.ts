/** Local calendar `yyyy-MM-dd` (not UTC midnight shift). */
export function localIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayIsoLocal(): string {
  return localIsoDate(new Date());
}

export function yesterdayIsoLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localIsoDate(d);
}

/** Most recent Sunday before today; if today is Sunday, returns the previous Sunday. */
export function lastSundayIsoLocal(): string {
  const d = new Date();
  const day = d.getDay();
  const toSubtract = day === 0 ? 7 : day;
  d.setDate(d.getDate() - toSubtract);
  return localIsoDate(d);
}
