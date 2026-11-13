export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is day 1, Sunday is day 0
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getSundayOfWeek(date: Date): Date {
  const monday = getMondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export function formatWeekLabel(mondayStr: string, sundayStr: string): string {
  try {
    const [y1, m1, d1] = mondayStr.split('-').map(Number);
    const [y2, m2, d2] = sundayStr.split('-').map(Number);
    const mon = new Date(y1, m1 - 1, d1);
    const sun = new Date(y2, m2 - 1, d2);
    const monStr = mon.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const sunStr = sun.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    return `${monStr} – ${sunStr}`;
  } catch {
    return `${mondayStr} to ${sundayStr}`;
  }
}
