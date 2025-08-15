import { describe, it, expect, afterEach } from 'vitest';
import { StylesHelper } from '@helpers/StylesHelper';

describe('StylesHelper', () => {
  afterEach(() => {
    // Clean up styles after each test
    const styleElement = document.getElementById(StylesHelper.getStyleId());
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('getStyleId', () => {
    it('should return the style ID', () => {
      const styleId = StylesHelper.getStyleId();
      expect(styleId).toBe('html-gui-editor-styles');
    });
  });

  describe('isStylesInjected', () => {
    it('should return false when styles are not injected', () => {
      expect(StylesHelper.isStylesInjected()).toBe(false);
    });

    it('should return true when styles are injected', () => {
      // Manually create style element
      const style = document.createElement('style');
      style.id = StylesHelper.getStyleId();
      document.head.appendChild(style);

      expect(StylesHelper.isStylesInjected()).toBe(true);
    });
  });

  describe('getEditorStyles', () => {
    it('should return editor CSS styles', () => {
      const styles = StylesHelper.getEditorStyles();

      expect(styles).toContain('.html-gui-editor');
      expect(styles).toContain('display: grid');
      expect(styles).toContain('.editor-sidebar');
      expect(styles).toContain('.element-buttons');
    });

    it('should include styles using CSS variables', () => {
      const styles = StylesHelper.getEditorStyles();

      expect(styles).toContain('var(--editor-border-color, #ddd)');
      expect(styles).toContain('var(--sidebar-bg, #f8f9fa)');
      expect(styles).toContain('var(--text-color, #333)');
    });

    it('should return as a string', () => {
      const styles = StylesHelper.getEditorStyles();
      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
    });
  });

  describe('injectEditorStyles', () => {
    it('should inject editor styles', () => {
      StylesHelper.injectEditorStyles();

      const styleElement = document.getElementById(StylesHelper.getStyleId());
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('should not inject duplicate styles when styles already exist', () => {
      StylesHelper.injectEditorStyles();
      StylesHelper.injectEditorStyles();

      const styleElements = document.querySelectorAll(`#${StylesHelper.getStyleId()}`);
      expect(styleElements.length).toBe(1);
    });

    it('should make isStylesInjected return true after injection', () => {
      expect(StylesHelper.isStylesInjected()).toBe(false);

      StylesHelper.injectEditorStyles();

      expect(StylesHelper.isStylesInjected()).toBe(true);
    });
  });

  describe('removeEditorStyles', () => {
    it('should remove editor styles', () => {
      StylesHelper.injectEditorStyles();
      expect(StylesHelper.isStylesInjected()).toBe(true);

      StylesHelper.removeEditorStyles();

      expect(StylesHelper.isStylesInjected()).toBe(false);
      expect(document.getElementById(StylesHelper.getStyleId())).toBeNull();
    });

    it('should not throw error when styles do not exist', () => {
      expect(() => {
        StylesHelper.removeEditorStyles();
      }).not.toThrow();
    });
  });

  describe('injectCustomStyles', () => {
    it('should inject custom CSS', () => {
      const customCSS = '.custom-class { color: red; }';
      StylesHelper.injectCustomStyles(customCSS, 'custom-test-styles');

      const styleElement = document.getElementById('custom-test-styles');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toContain(customCSS);
    });

    it('should use default ID when ID is not specified', () => {
      const customCSS = '.test { color: blue; }';
      StylesHelper.injectCustomStyles(customCSS);

      // Default ID (testable though implementation may vary)
      const styleElements = document.head.querySelectorAll('style');
      const hasCustomStyles = Array.from(styleElements).some(style =>
        style.textContent?.includes(customCSS)
      );
      expect(hasCustomStyles).toBe(true);
    });

    afterEach(() => {
      // Clean up custom styles as well
      const customStyle = document.getElementById('custom-test-styles');
      if (customStyle) {
        customStyle.remove();
      }

      // Clean up custom styles with default ID as well
      const styleElements = document.head.querySelectorAll('style');
      styleElements.forEach(style => {
        if (style.textContent?.includes('.test { color: blue; }')) {
          style.remove();
        }
      });
    });
  });
});
