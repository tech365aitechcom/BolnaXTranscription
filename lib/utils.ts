import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format UTC timestamp to IST (Indian Standard Time)
 * @param utcTimestamp - UTC timestamp string
 * @param includeSeconds - Whether to include seconds in the output
 * @returns Formatted IST time string
 */
export function formatToIST(utcTimestamp: string, includeSeconds: boolean = false): string {
  try {
    // Add 'Z' to force UTC parsing if not present
    const timestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : utcTimestamp + 'Z';
    const date = new Date(timestamp);

    // Convert to IST by adding 5 hours and 30 minutes
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

    const day = istDate.getUTCDate().toString().padStart(2, '0');
    const month = istDate.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = istDate.getUTCFullYear().toString().slice(-2);

    let hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = istDate.getUTCSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const hoursStr = hours.toString().padStart(2, '0');

    if (includeSeconds) {
      return `${day} ${month}, ${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    }
    return `${day} ${month}, ${year}, ${hoursStr}:${minutes} ${ampm}`;
  } catch (error) {
    return utcTimestamp;
  }
}

/**
 * Format UTC timestamp to IST in 24-hour format (for logs)
 * @param utcTimestamp - UTC timestamp string
 * @returns Formatted IST time string in 24-hour format
 */
export function formatToIST24(utcTimestamp: string): string {
  try {
    // Add 'Z' to force UTC parsing if not present
    const timestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : utcTimestamp + 'Z';
    const date = new Date(timestamp);

    // Convert to IST by adding 5 hours and 30 minutes
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

    const year = istDate.getUTCFullYear();
    const month = (istDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = istDate.getUTCDate().toString().padStart(2, '0');
    const hours = istDate.getUTCHours().toString().padStart(2, '0');
    const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = istDate.getUTCSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return utcTimestamp;
  }
}
