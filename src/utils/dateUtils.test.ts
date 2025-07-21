import { 
  isValidDateFormat, 
  parseDate, 
  formatDate, 
  formatDateShort, 
  calculateAge, 
  getYearFromDate 
} from './dateUtils';

describe('Date Utils', () => {
  describe('isValidDateFormat', () => {
    it('should return true for valid YYYY-MM-DD format', () => {
      expect(isValidDateFormat('2023-01-15')).toBe(true);
      expect(isValidDateFormat('1990-12-31')).toBe(true);
      expect(isValidDateFormat('2000-02-29')).toBe(true); // Leap year
    });

    it('should return false for invalid formats', () => {
      expect(isValidDateFormat('2023/01/15')).toBe(false);
      expect(isValidDateFormat('01-15-2023')).toBe(false);
      expect(isValidDateFormat('2023-1-15')).toBe(false);
      expect(isValidDateFormat('2023-01-1')).toBe(false);
      expect(isValidDateFormat('2023-13-01')).toBe(false); // Invalid month
      expect(isValidDateFormat('2023-01-32')).toBe(false); // Invalid day
      expect(isValidDateFormat('1800-01-01')).toBe(false); // Year too early
      expect(isValidDateFormat('2200-01-01')).toBe(false); // Year too late
    });

    it('should return false for null/undefined/empty values', () => {
      expect(isValidDateFormat(null)).toBe(false);
      expect(isValidDateFormat(undefined)).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('should return valid Date object for valid date string', () => {
      const date = parseDate('2023-01-15');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2023);
      expect(date?.getMonth()).toBe(0); // January is 0-indexed
      expect(date?.getDate()).toBe(15);
    });

    it('should return null for invalid date strings', () => {
      expect(parseDate('invalid-date')).toBeNull();
      expect(parseDate('2023-13-01')).toBeNull();
      expect(parseDate('2023-01-32')).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
      expect(formatDate('1990-12-31')).toBe('Dec 31, 1990');
    });

    it('should return "Invalid date" for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid date');
      expect(formatDate('2023-13-01')).toBe('Invalid date');
      expect(formatDate(null)).toBe('Invalid date');
      expect(formatDate(undefined)).toBe('Invalid date');
    });

    it('should accept custom formatting options', () => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      expect(formatDate('2023-01-15', options)).toBe('January 15, 2023');
    });
  });

  describe('formatDateShort', () => {
    it('should format valid dates in short format', () => {
      expect(formatDateShort('2023-01-15')).toBe('1/15/2023');
    });

    it('should return "Invalid date" for invalid dates', () => {
      expect(formatDateShort('invalid-date')).toBe('Invalid date');
      expect(formatDateShort(null)).toBe('Invalid date');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 25;
      const birthDate = `${birthYear}-01-15`;
      
      const age = calculateAge(birthDate);
      expect(age).toBe(25);
    });

    it('should return null for invalid dates', () => {
      expect(calculateAge('invalid-date')).toBeNull();
      expect(calculateAge('2023-13-01')).toBeNull();
      expect(calculateAge(null)).toBeNull();
      expect(calculateAge(undefined)).toBeNull();
    });
  });

  describe('getYearFromDate', () => {
    it('should extract year from valid date', () => {
      expect(getYearFromDate('2023-01-15')).toBe(2023);
      expect(getYearFromDate('1990-12-31')).toBe(1990);
    });

    it('should return null for invalid dates', () => {
      expect(getYearFromDate('invalid-date')).toBeNull();
      expect(getYearFromDate('2023-13-01')).toBeNull();
      expect(getYearFromDate(null)).toBeNull();
      expect(getYearFromDate(undefined)).toBeNull();
    });
  });
});