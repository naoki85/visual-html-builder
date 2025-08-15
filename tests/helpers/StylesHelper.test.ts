import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StylesHelper } from '@helpers/StylesHelper';

describe('StylesHelper', () => {
  afterEach(() => {
    // 各テスト後にスタイルをクリーンアップ
    const styleElement = document.getElementById(StylesHelper.getStyleId());
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('getStyleId', () => {
    it('スタイルIDを返す', () => {
      const styleId = StylesHelper.getStyleId();
      expect(styleId).toBe('html-gui-editor-styles');
    });
  });

  describe('isStylesInjected', () => {
    it('スタイルが注入されていない場合はfalseを返す', () => {
      expect(StylesHelper.isStylesInjected()).toBe(false);
    });

    it('スタイルが注入されている場合はtrueを返す', () => {
      // スタイル要素を手動で作成
      const style = document.createElement('style');
      style.id = StylesHelper.getStyleId();
      document.head.appendChild(style);

      expect(StylesHelper.isStylesInjected()).toBe(true);
    });
  });

  describe('getEditorStyles', () => {
    it('エディターのCSSスタイルを返す', () => {
      const styles = StylesHelper.getEditorStyles();
      
      expect(styles).toContain('.html-gui-editor');
      expect(styles).toContain('display: grid');
      expect(styles).toContain('.editor-sidebar');
      expect(styles).toContain('.element-buttons');
    });

    it('CSS変数を使用したスタイルを含む', () => {
      const styles = StylesHelper.getEditorStyles();
      
      expect(styles).toContain('var(--editor-border-color, #ddd)');
      expect(styles).toContain('var(--sidebar-bg, #f8f9fa)');
      expect(styles).toContain('var(--text-color, #333)');
    });

    it('文字列として返される', () => {
      const styles = StylesHelper.getEditorStyles();
      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
    });
  });

  describe('injectEditorStyles', () => {
    it('エディターのスタイルを注入する', () => {
      StylesHelper.injectEditorStyles();

      const styleElement = document.getElementById(StylesHelper.getStyleId());
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('既にスタイルが存在する場合は重複注入しない', () => {
      StylesHelper.injectEditorStyles();
      StylesHelper.injectEditorStyles();

      const styleElements = document.querySelectorAll(`#${StylesHelper.getStyleId()}`);
      expect(styleElements.length).toBe(1);
    });

    it('注入後はisStylesInjectedがtrueを返す', () => {
      expect(StylesHelper.isStylesInjected()).toBe(false);
      
      StylesHelper.injectEditorStyles();
      
      expect(StylesHelper.isStylesInjected()).toBe(true);
    });
  });

  describe('removeEditorStyles', () => {
    it('エディターのスタイルを削除する', () => {
      StylesHelper.injectEditorStyles();
      expect(StylesHelper.isStylesInjected()).toBe(true);

      StylesHelper.removeEditorStyles();
      
      expect(StylesHelper.isStylesInjected()).toBe(false);
      expect(document.getElementById(StylesHelper.getStyleId())).toBeNull();
    });

    it('スタイルが存在しない場合もエラーにならない', () => {
      expect(() => {
        StylesHelper.removeEditorStyles();
      }).not.toThrow();
    });
  });

  describe('getIframeStyles', () => {
    it('iframe用のスタイルを返す', () => {
      const styles = StylesHelper.getIframeStyles();
      
      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
      // iframe特有のスタイルが含まれていることを確認
      expect(styles).toContain('body');
    });
  });

  describe('injectCustomStyles', () => {
    it('カスタムCSSを注入する', () => {
      const customCSS = '.custom-class { color: red; }';
      StylesHelper.injectCustomStyles(customCSS, 'custom-test-styles');

      const styleElement = document.getElementById('custom-test-styles');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toContain(customCSS);
    });

    it('IDが指定されない場合はデフォルトIDを使用', () => {
      const customCSS = '.test { color: blue; }';
      StylesHelper.injectCustomStyles(customCSS);

      // デフォルトID（実装によって異なるがテスト可能）
      const styleElements = document.head.querySelectorAll('style');
      const hasCustomStyles = Array.from(styleElements).some(style => 
        style.textContent?.includes(customCSS)
      );
      expect(hasCustomStyles).toBe(true);
    });

    afterEach(() => {
      // カスタムスタイルもクリーンアップ
      const customStyle = document.getElementById('custom-test-styles');
      if (customStyle) {
        customStyle.remove();
      }
      
      // デフォルトIDのカスタムスタイルもクリーンアップ
      const styleElements = document.head.querySelectorAll('style');
      styleElements.forEach(style => {
        if (style.textContent?.includes('.test { color: blue; }')) {
          style.remove();
        }
      });
    });
  });
});