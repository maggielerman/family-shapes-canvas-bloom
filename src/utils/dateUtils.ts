/**
 * Date utility functions for the application
 */

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date string for short display (e.g., "Jan 15, 1990")
 */
export function formatDateShort(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
}

/**
 * Parse a partial date string and convert it to a standardized format
 * Accepts formats like:
 * - "1990" -> "1990-01-01"
 * - "05/1990" -> "1990-05-01"
 * - "05/15/1990" -> "1990-05-15"
 * - "1990-05-15" -> "1990-05-15" (already in correct format)
 */
export function parsePartialDate(dateString: string): string | null {
  if (!dateString.trim()) return null;
  
  const trimmed = dateString.trim();
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Handle MM/YYYY format
  if (/^\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/');
    const paddedMonth = month.padStart(2, '0');
    return `${year}-${paddedMonth}-01`;
  }
  
  // Handle MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [month, day, year] = trimmed.split('/');
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  }
  
  // Handle YYYY format (just year)
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }
  
  // Handle MM/YY format (assume 20xx for years < 50, 19xx for years >= 50)
  if (/^\d{1,2}\/\d{2}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/');
    const paddedMonth = month.padStart(2, '0');
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    return `${fullYear}-${paddedMonth}-01`;
  }
  
  return null;
}

/**
 * Format a date for display, handling partial dates
 */
export function formatPartialDate(dateString: string | null): string {
  if (!dateString) return '';
  
  const parsed = parsePartialDate(dateString);
  if (!parsed) return dateString; // Return original if can't parse
  
  const [year, month, day] = parsed.split('-');
  
  // If it's just a year (day and month are 01)
  if (month === '01' && day === '01') {
    return year;
  }
  
  // If it's month/year (day is 01)
  if (day === '01') {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${year}`;
  }
  
  // Full date
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthName = monthNames[parseInt(month) - 1];
  return `${monthName} ${day}, ${year}`;
}

/**
 * Validate if a date string is a valid partial date
 */
export function isValidPartialDate(dateString: string): boolean {
  if (!dateString.trim()) return true; // Empty is valid
  return parsePartialDate(dateString) !== null;
}

/**
 * Get a placeholder text for date input
 */
export function getDatePlaceholder(): string {
  return "e.g., 1990, 05/1990, 05/15/1990, or 1990-05-15";
}