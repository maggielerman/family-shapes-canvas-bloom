/**
 * Utility functions for safe date parsing and formatting
 */

/**
 * Validates if a date string is in the expected 'YYYY-MM-DD' format
 */
export function isValidDateFormat(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  // Check if the string matches YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Parse the components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validate that the components are valid numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  
  // Validate reasonable ranges
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Create a date object to validate the actual date
  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year &&
                     date.getMonth() === month - 1 &&
                     date.getDate() === day;
  
  return isValidDate;
}

/**
 * Safely parses a date string and returns a Date object or null if invalid
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString || !isValidDateFormat(dateString)) {
    return null;
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Double-check that the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Safely formats a date string for display
 */
export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = parseDate(dateString);
  if (!date) return 'Invalid date';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Safely formats a date string for display (short format)
 */
export function formatDateShort(dateString: string | null | undefined): string {
  const date = parseDate(dateString);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString();
}

/**
 * Calculates age from birth date, handling invalid dates gracefully
 */
export function calculateAge(birthDate: string | null | undefined): number | null {
  const birth = parseDate(birthDate);
  if (!birth) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Gets the year from a date string, handling invalid dates gracefully
 */
export function getYearFromDate(dateString: string | null | undefined): number | null {
  const date = parseDate(dateString);
  if (!date) return null;
  
  return date.getFullYear();
}