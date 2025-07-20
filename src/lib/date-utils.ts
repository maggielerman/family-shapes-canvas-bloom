/**
 * Centralized date formatting utility
 * Ensures consistent date handling across the application and tests
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === '') {
    return 'Unknown';
  }
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date for display with fallback
 */
export const formatDateWithFallback = (dateString: string | null | undefined, fallback = 'Not specified'): string => {
  const formatted = formatDate(dateString);
  return formatted === 'Unknown' ? fallback : formatted;
};

/**
 * Validate if a date string represents a valid date
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString || dateString === '') {
    return false;
  }
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};