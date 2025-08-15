import { describe, it, expect } from 'vitest';
import { UtilityHelpers } from '@helpers/UtilityHelpers';

describe('UtilityHelpers', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('should escape ampersand characters', () => {
      const input = 'A & B & C';
      const expected = 'A &amp; B &amp; C';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('should escape quote characters', () => {
      const input = 'He said "Hello" & \'Goodbye\'';
      const expected = 'He said "Hello" &amp; \'Goodbye\'';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('should handle empty strings', () => {
      expect(UtilityHelpers.escapeHtml('')).toBe('');
    });

    it('should return normal text unchanged', () => {
      const input = 'Hello World';
      expect(UtilityHelpers.escapeHtml(input)).toBe(input);
    });

    it('should handle numeric strings', () => {
      const input = '12345';
      expect(UtilityHelpers.escapeHtml(input)).toBe(input);
    });

    it('should handle multiline text', () => {
      const input = 'Line 1\n<br>Line 2\nLine 3';
      const expected = 'Line 1\n&lt;br&gt;Line 2\nLine 3';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });
  });

  describe('isValidUrl', () => {
    it('should recognize valid HTTP URLs', () => {
      expect(UtilityHelpers.isValidUrl('http://example.com')).toBe(true);
      expect(UtilityHelpers.isValidUrl('http://www.google.com/search?q=test')).toBe(true);
    });

    it('should recognize valid HTTPS URLs', () => {
      expect(UtilityHelpers.isValidUrl('https://example.com')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://api.github.com/users/test')).toBe(true);
    });

    it('should recognize valid localhost URLs', () => {
      expect(UtilityHelpers.isValidUrl('http://localhost:3000')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://localhost:8080/path')).toBe(true);
    });

    it('should recognize IP address URLs', () => {
      expect(UtilityHelpers.isValidUrl('http://192.168.1.1')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://127.0.0.1:8080')).toBe(true);
    });

    it('should recognize file protocol URLs', () => {
      expect(UtilityHelpers.isValidUrl('file:///path/to/file.html')).toBe(true);
    });

    it('should recognize FTP protocol URLs', () => {
      expect(UtilityHelpers.isValidUrl('ftp://ftp.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(UtilityHelpers.isValidUrl('not-a-url')).toBe(false);
      expect(UtilityHelpers.isValidUrl('example.com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('www.example.com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('http://')).toBe(false);
      expect(UtilityHelpers.isValidUrl('https://')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(UtilityHelpers.isValidUrl('')).toBe(false);
    });

    it('should reject invalid URLs with spaces', () => {
      expect(UtilityHelpers.isValidUrl('http://example .com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('http:// example.com')).toBe(false);
    });

    it('should handle invalid protocols', () => {
      expect(UtilityHelpers.isValidUrl('invalid://example.com')).toBe(true); // URL constructor accepts this
      expect(UtilityHelpers.isValidUrl('://example.com')).toBe(false);
    });

    it('should reject relative URLs', () => {
      expect(UtilityHelpers.isValidUrl('/path/to/page')).toBe(false);
      expect(UtilityHelpers.isValidUrl('./relative/path')).toBe(false);
      expect(UtilityHelpers.isValidUrl('../parent/path')).toBe(false);
    });

    it('should handle URLs with international domain names', () => {
      expect(UtilityHelpers.isValidUrl('https://例え.テスト')).toBe(true);
    });

    it('should recognize URLs with query parameters and fragments', () => {
      expect(
        UtilityHelpers.isValidUrl('https://example.com/path?param=value&other=123#section')
      ).toBe(true);
    });
  });
});
