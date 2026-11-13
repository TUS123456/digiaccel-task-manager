/**
 * Date and Week utilities for Digiaccel Task Manager
 * Enforces Monday-Sunday weekly grouping according to assignment specification.
 */

// Format date to YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get the Monday of the week for a given date
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // In JS getDay() returns 0 for Sunday, 1 for Monday ... 6 for Saturday
  // Monday is day 1, so difference from Monday is:
  // If Sunday (0), Monday was 6 days ago (-6)
  // If Monday (1), 0
  // If Tuesday (2), -1, etc.
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get the Sunday of the week for a given date
export function getSundayOfWeek(date: Date): Date {
  const monday = getMondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

// Generate the 7 days of the week (Monday through Sunday)
export function getDaysOfWeek(referenceDate: Date): Array<{
  date: Date;
  dateKey: string;
  dayName: string; // "Mon", "Tue"
  dayNumber: string; // "09", "12"
  isToday: boolean;
}> {
  const monday = getMondayOfWeek(referenceDate);
  const todayKey = formatDateKey(new Date());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const key = formatDateKey(current);
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = String(current.getDate()).padStart(2, "0");
    days.push({
      date: current,
      dateKey: key,
      dayName,
      dayNumber,
      isToday: key === todayKey,
    });
  }
  return days;
}

// Format date for UI display like in Figma: "Friday 14, January"
export function formatFigmaDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "long" });
    return `${weekday} ${dayNum}, ${monthName}`;
  } catch {
    return dateStr;
  }
}

// Format week label e.g. "Nov 09 - Nov 15, 2026"
export function formatWeekLabel(mondayStr: string, sundayStr: string): string {
  try {
    const [y1, m1, d1] = mondayStr.split("-").map(Number);
    const [y2, m2, d2] = sundayStr.split("-").map(Number);
    const mon = new Date(y1, m1 - 1, d1);
    const sun = new Date(y2, m2 - 1, d2);

    const monStr = mon.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    const sunStr = sun.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return `${monStr} – ${sunStr}`;
  } catch {
    return `${mondayStr} to ${sundayStr}`;
  }
}


export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}