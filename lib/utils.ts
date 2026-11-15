import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time24: string): string {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function getDoseCategory(time24: string): { label: string; icon: string; order: number } {
  if (!time24) return { label: "Daily", icon: "Sun", order: 1 };
  const h = parseInt(time24.split(":")[0], 10);
  if (h >= 5 && h < 11) return { label: "Morning", icon: "Sunrise", order: 1 };
  if (h >= 11 && h < 16) return { label: "Midday / Lunch", icon: "Sun", order: 2 };
  if (h >= 16 && h < 20) return { label: "Evening / Dinner", icon: "Sunset", order: 3 };
  return { label: "Bedtime / Night", icon: "Moon", order: 4 };
}
