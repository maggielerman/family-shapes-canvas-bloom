import { parsePartialDate, formatPartialDate, isValidPartialDate, getDatePlaceholder } from './dateUtils';

describe('Date Utils', () => {
  describe('parsePartialDate', () => {
    it('should parse full YYYY-MM-DD format', () => {
      expect(parsePartialDate('1990-05-15')).toBe('1990-05-15');
    });

    it('should parse MM/YYYY format', () => {
      expect(parsePartialDate('05/1990')).toBe('1990-05-01');
    });

    it('should parse MM/DD/YYYY format', () => {
      expect(parsePartialDate('05/15/1990')).toBe('1990-05-15');
    });

    it('should parse YYYY format (just year)', () => {
      expect(parsePartialDate('1990')).toBe('1990-01-01');
    });

    it('should parse MM/YY format with 20xx assumption for years < 50', () => {
      expect(parsePartialDate('05/90')).toBe('1990-05-01');
    });

    it('should parse MM/YY format with 20xx assumption for years >= 50', () => {
      expect(parsePartialDate('05/25')).toBe('2025-05-01');
    });

    it('should handle single digit months and days', () => {
      expect(parsePartialDate('5/15/1990')).toBe('1990-05-15');
    });

    it('should return null for invalid formats', () => {
      expect(parsePartialDate('invalid')).toBeNull();
      expect(parsePartialDate('1990/05/15')).toBeNull();
      expect(parsePartialDate('05-15-1990')).toBeNull();
    });

    it('should handle empty strings', () => {
      expect(parsePartialDate('')).toBeNull();
      expect(parsePartialDate('   ')).toBeNull();
    });
  });

  describe('formatPartialDate', () => {
    it('should format year-only dates', () => {
      expect(formatPartialDate('1990-01-01')).toBe('1990');
    });

    it('should format month/year dates', () => {
      expect(formatPartialDate('1990-05-01')).toBe('May 1990');
    });

    it('should format full dates', () => {
      expect(formatPartialDate('1990-05-15')).toBe('May 15, 1990');
    });

    it('should handle invalid dates gracefully', () => {
      expect(formatPartialDate('invalid')).toBe('invalid');
    });

    it('should handle null/empty dates', () => {
      expect(formatPartialDate(null)).toBe('');
      expect(formatPartialDate('')).toBe('');
    });
  });

  describe('isValidPartialDate', () => {
    it('should validate correct formats', () => {
      expect(isValidPartialDate('1990')).toBe(true);
      expect(isValidPartialDate('05/1990')).toBe(true);
      expect(isValidPartialDate('05/15/1990')).toBe(true);
      expect(isValidPartialDate('1990-05-15')).toBe(true);
    });

    it('should validate empty strings', () => {
      expect(isValidPartialDate('')).toBe(true);
      expect(isValidPartialDate('   ')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidPartialDate('invalid')).toBe(false);
      expect(isValidPartialDate('1990/05/15')).toBe(false);
    });
  });

  describe('getDatePlaceholder', () => {
    it('should return helpful placeholder text', () => {
      expect(getDatePlaceholder()).toBe('e.g., 1990, 05/1990, 05/15/1990, or 1990-05-15');
    });
  });
}); 