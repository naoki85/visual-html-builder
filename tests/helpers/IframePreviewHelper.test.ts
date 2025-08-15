import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IframePreviewHelper } from '@helpers/IframePreviewHelper';

describe('IframePreviewHelper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('getDefaultOptions', () => {
    it('should return default options', () => {
      const options = IframePreviewHelper.getDefaultOptions();

      expect(options.enableDragDrop).toBe(true);
      expect(options.enableElementSelection).toBe(true);
      expect(options.customStyles).toBe('');
      expect(options.sandboxPermissions).toEqual(['allow-scripts', 'allow-same-origin']);
    });
  });

  describe('createIframePreview', () => {
    it('should create iframe element', () => {
      const iframe = IframePreviewHelper.createIframePreview(container);

      expect(iframe.tagName).toBe('IFRAME');
      expect(iframe.className).toBe('preview-iframe');
      expect(iframe.style.width).toBe('100%');
      expect(iframe.style.height).toBe('100%');
      expect(iframe.style.border).toBe('');
      expect(container.contains(iframe)).toBe(true);
    });

    it('should create iframe with custom options', () => {
      const options = {
        sandboxPermissions: ['allow-same-origin'],
        customStyles: 'body { background: red; }',
      };

      const iframe = IframePreviewHelper.createIframePreview(container, options);

      expect(iframe.getAttribute('sandbox')).toBe('allow-same-origin');
      expect(iframe.getAttribute('sandbox')).not.toContain('allow-scripts');
    });

    it('should remove existing iframe before creating new one', () => {
      const iframe1 = IframePreviewHelper.createIframePreview(container);
      const iframe2 = IframePreviewHelper.createIframePreview(container);

      expect(container.querySelectorAll('iframe.preview-iframe')).toHaveLength(1);
      expect(container.contains(iframe1)).toBe(false);
      expect(container.contains(iframe2)).toBe(true);
    });
  });

  describe('updateIframeContent', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframePreview(container);

      // Mock iframe contentDocument
      const mockPreviewContent = {
        innerHTML: '',
      };
      const mockDocument = {
        querySelector: vi.fn().mockReturnValue(mockPreviewContent),
      };

      Object.defineProperty(iframe, 'contentDocument', {
        value: mockDocument,
        writable: true,
      });
    });

    it('should update iframe HTML content', () => {
      const htmlContent = '<h1>Test Content</h1>';

      IframePreviewHelper.updateIframeContent(iframe, htmlContent);

      const doc = iframe.contentDocument as any;
      expect(doc.querySelector).toHaveBeenCalledWith('.preview-content');
    });

    it('should handle null contentDocument without errors', () => {
      Object.defineProperty(iframe, 'contentDocument', {
        value: null,
        writable: true,
      });

      expect(() => {
        IframePreviewHelper.updateIframeContent(iframe, '<div>test</div>');
      }).not.toThrow();
    });
  });

  describe('getIframeBaseStyles', () => {
    it('should return base styles for iframe', () => {
      const styles = IframePreviewHelper.getIframeBaseStyles();

      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles).toContain('body');
      expect(styles).toContain('margin: 0');
    });

    it('should include basic reset styles', () => {
      const styles = IframePreviewHelper.getIframeBaseStyles();

      expect(styles).toContain('box-sizing: border-box');
      expect(styles).toContain('.preview-element');
      expect(styles).toContain('.preview-content');
    });
  });

  describe('injectIframeStyles', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframePreview(container);

      const mockHead = {
        appendChild: vi.fn(),
      };
      const mockDocument = {
        getElementById: vi.fn().mockReturnValue(null),
        createElement: vi.fn().mockReturnValue({
          id: '',
          textContent: '',
        }),
        head: mockHead,
        getElementsByTagName: vi.fn().mockReturnValue([mockHead]),
      };

      Object.defineProperty(iframe, 'contentDocument', {
        value: mockDocument,
        writable: true,
      });
    });

    it('should inject styles into iframe', () => {
      const customStyles = 'body { background: red; }';

      IframePreviewHelper.injectIframeStyles(iframe, customStyles);

      const doc = iframe.contentDocument as any;
      expect(doc.createElement).toHaveBeenCalledWith('style');
      expect(doc.head.appendChild).toHaveBeenCalled();
    });

    it('should handle null contentDocument without errors', () => {
      Object.defineProperty(iframe, 'contentDocument', {
        value: null,
        writable: true,
      });

      expect(() => {
        IframePreviewHelper.injectIframeStyles(iframe, 'body { color: red; }');
      }).not.toThrow();
    });

    it('should remove existing styles before adding new ones', () => {
      const existingStyle = { remove: vi.fn() };
      const doc = iframe.contentDocument as any;
      doc.getElementById.mockReturnValue(existingStyle);

      IframePreviewHelper.injectIframeStyles(iframe, 'body { color: blue; }', 'test-style');

      expect(existingStyle.remove).toHaveBeenCalled();
    });
  });

  describe('getIframeDocument', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframePreview(container);
    });

    it('should return iframe document', () => {
      const mockDocument = { body: {} };
      Object.defineProperty(iframe, 'contentDocument', {
        value: mockDocument,
        writable: true,
      });

      const doc = IframePreviewHelper.getIframeDocument(iframe);

      expect(doc).toBe(mockDocument);
    });

    it('should return null when contentDocument is null', () => {
      // Create a mock iframe with null contentDocument
      const mockIframe = {
        contentDocument: null,
        contentWindow: null,
      } as HTMLIFrameElement;

      const doc = IframePreviewHelper.getIframeDocument(mockIframe);

      expect(doc).toBeNull();
    });
  });

  describe('removeElementFromIframe', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframePreview(container);
    });

    it('should remove element from iframe', () => {
      const mockElement = { remove: vi.fn() };
      const mockDocument = {
        querySelector: vi.fn().mockReturnValue(mockElement),
      };

      vi.spyOn(IframePreviewHelper, 'getIframeDocument').mockReturnValue(mockDocument as any);

      IframePreviewHelper.removeElementFromIframe(iframe, 123);

      expect(mockDocument.querySelector).toHaveBeenCalledWith('[data-element-id="123"]');
      expect(mockElement.remove).toHaveBeenCalled();
    });

    it('should handle null document without errors', () => {
      vi.spyOn(IframePreviewHelper, 'getIframeDocument').mockReturnValue(null);

      expect(() => {
        IframePreviewHelper.removeElementFromIframe(iframe, 123);
      }).not.toThrow();
    });

    it('should handle missing element without errors', () => {
      const mockDocument = {
        querySelector: vi.fn().mockReturnValue(null),
      };

      vi.spyOn(IframePreviewHelper, 'getIframeDocument').mockReturnValue(mockDocument as any);

      expect(() => {
        IframePreviewHelper.removeElementFromIframe(iframe, 999);
      }).not.toThrow();
    });
  });
});
