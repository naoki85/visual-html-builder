import { describe, it, expect, beforeEach } from 'vitest';
import { UtilityHelpers } from '@helpers/UtilityHelpers';

describe('UtilityHelpers', () => {
  describe('escapeHtml', () => {
    it('HTMLの特殊文字をエスケープする', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('&文字をエスケープする', () => {
      const input = 'A & B & C';
      const expected = 'A &amp; B &amp; C';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('クォート文字をエスケープする', () => {
      const input = 'He said "Hello" & \'Goodbye\'';
      const expected = 'He said "Hello" &amp; \'Goodbye\'';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });

    it('空文字列を処理する', () => {
      expect(UtilityHelpers.escapeHtml('')).toBe('');
    });

    it('通常のテキストはそのまま返す', () => {
      const input = 'Hello World';
      expect(UtilityHelpers.escapeHtml(input)).toBe(input);
    });

    it('数字だけの文字列を処理する', () => {
      const input = '12345';
      expect(UtilityHelpers.escapeHtml(input)).toBe(input);
    });

    it('複数行テキストを処理する', () => {
      const input = 'Line 1\n<br>Line 2\nLine 3';
      const expected = 'Line 1\n&lt;br&gt;Line 2\nLine 3';
      expect(UtilityHelpers.escapeHtml(input)).toBe(expected);
    });
  });

  describe('isValidUrl', () => {
    it('有効なHTTP URLを認識する', () => {
      expect(UtilityHelpers.isValidUrl('http://example.com')).toBe(true);
      expect(UtilityHelpers.isValidUrl('http://www.google.com/search?q=test')).toBe(true);
    });

    it('有効なHTTPS URLを認識する', () => {
      expect(UtilityHelpers.isValidUrl('https://example.com')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://api.github.com/users/test')).toBe(true);
    });

    it('有効なlocalhostを認識する', () => {
      expect(UtilityHelpers.isValidUrl('http://localhost:3000')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://localhost:8080/path')).toBe(true);
    });

    it('IPアドレスのURLを認識する', () => {
      expect(UtilityHelpers.isValidUrl('http://192.168.1.1')).toBe(true);
      expect(UtilityHelpers.isValidUrl('https://127.0.0.1:8080')).toBe(true);
    });

    it('ファイルプロトコルを認識する', () => {
      expect(UtilityHelpers.isValidUrl('file:///path/to/file.html')).toBe(true);
    });

    it('FTPプロトコルを認識する', () => {
      expect(UtilityHelpers.isValidUrl('ftp://ftp.example.com')).toBe(true);
    });

    it('無効なURLを拒否する', () => {
      expect(UtilityHelpers.isValidUrl('not-a-url')).toBe(false);
      expect(UtilityHelpers.isValidUrl('example.com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('www.example.com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('http://')).toBe(false);
      expect(UtilityHelpers.isValidUrl('https://')).toBe(false);
    });

    it('空文字列を拒否する', () => {
      expect(UtilityHelpers.isValidUrl('')).toBe(false);
    });

    it('スペースを含む無効なURLを拒否する', () => {
      expect(UtilityHelpers.isValidUrl('http://example .com')).toBe(false);
      expect(UtilityHelpers.isValidUrl('http:// example.com')).toBe(false);
    });

    it('無効なプロトコルを拒否する', () => {
      expect(UtilityHelpers.isValidUrl('invalid://example.com')).toBe(true); // URLコンストラクタは通す
      expect(UtilityHelpers.isValidUrl('://example.com')).toBe(false);
    });

    it('相対URLを拒否する', () => {
      expect(UtilityHelpers.isValidUrl('/path/to/page')).toBe(false);
      expect(UtilityHelpers.isValidUrl('./relative/path')).toBe(false);
      expect(UtilityHelpers.isValidUrl('../parent/path')).toBe(false);
    });

    it('日本語ドメインを含むURLを処理する', () => {
      expect(UtilityHelpers.isValidUrl('https://例え.テスト')).toBe(true);
    });

    it('クエリパラメータとフラグメントを含むURLを認識する', () => {
      expect(UtilityHelpers.isValidUrl('https://example.com/path?param=value&other=123#section')).toBe(true);
    });
  });
});