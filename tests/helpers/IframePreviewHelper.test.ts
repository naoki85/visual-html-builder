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

  describe('createIframe', () => {
    it('iframe要素を作成する', () => {
      const iframe = IframePreviewHelper.createIframe();
      
      expect(iframe.tagName).toBe('IFRAME');
      expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
      expect(iframe.style.width).toBe('100%');
      expect(iframe.style.height).toBe('100%');
      expect(iframe.style.border).toBe('none');
    });

    it('カスタムオプションでiframeを作成する', () => {
      const options = {
        sandbox: 'allow-same-origin',
        width: '500px',
        height: '300px'
      };
      
      const iframe = IframePreviewHelper.createIframe(options);
      
      expect(iframe.getAttribute('sandbox')).toBe('allow-same-origin');
      expect(iframe.style.width).toBe('500px');
      expect(iframe.style.height).toBe('300px');
    });
  });

  describe('updateIframeContent', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframe();
      container.appendChild(iframe);
      
      // iframeのcontentDocumentをモック
      const mockDocument = {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
        head: {
          appendChild: vi.fn()
        },
        body: {
          innerHTML: ''
        }
      };
      
      Object.defineProperty(iframe, 'contentDocument', {
        value: mockDocument,
        writable: true
      });
    });

    it('iframeにHTMLコンテンツを書き込む', () => {
      const htmlContent = '<h1>Test Content</h1>';
      
      IframePreviewHelper.updateIframeContent(iframe, htmlContent);
      
      const doc = iframe.contentDocument as any;
      expect(doc.open).toHaveBeenCalled();
      expect(doc.write).toHaveBeenCalledWith(expect.stringContaining(htmlContent));
      expect(doc.close).toHaveBeenCalled();
    });

    it('カスタムスタイルを含むHTMLを書き込む', () => {
      const htmlContent = '<p>Styled content</p>';
      const customStyles = 'body { font-family: Arial; }';
      
      IframePreviewHelper.updateIframeContent(iframe, htmlContent, customStyles);
      
      const doc = iframe.contentDocument as any;
      expect(doc.write).toHaveBeenCalledWith(expect.stringContaining(customStyles));
    });

    it('contentDocumentがnullの場合はエラーにならない', () => {
      Object.defineProperty(iframe, 'contentDocument', {
        value: null,
        writable: true
      });
      
      expect(() => {
        IframePreviewHelper.updateIframeContent(iframe, '<div>test</div>');
      }).not.toThrow();
    });
  });

  describe('setupCommunication', () => {
    let iframe: HTMLIFrameElement;
    let mockCallbacks: any;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframe();
      container.appendChild(iframe);
      
      mockCallbacks = {
        onElementClick: vi.fn(),
        onElementSelect: vi.fn()
      };
    });

    it('メッセージイベントリスナーを設定する', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      IframePreviewHelper.setupCommunication(iframe, mockCallbacks);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('iframe読み込み完了時の処理を設定する', () => {
      const addEventListenerSpy = vi.spyOn(iframe, 'addEventListener');
      
      IframePreviewHelper.setupCommunication(iframe, mockCallbacks);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    });

    afterEach(() => {
      // イベントリスナーをクリーンアップ
      window.removeEventListener('message', expect.any(Function));
    });
  });

  describe('injectIframeScripts', () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = IframePreviewHelper.createIframe();
      
      const mockDocument = {
        createElement: vi.fn().mockReturnValue({
          textContent: '',
          setAttribute: vi.fn()
        }),
        head: {
          appendChild: vi.fn()
        }
      };
      
      Object.defineProperty(iframe, 'contentDocument', {
        value: mockDocument,
        writable: true
      });
    });

    it('iframe内にスクリプトを注入する', () => {
      IframePreviewHelper.injectIframeScripts(iframe);
      
      const doc = iframe.contentDocument as any;
      expect(doc.createElement).toHaveBeenCalledWith('script');
      expect(doc.head.appendChild).toHaveBeenCalled();
    });

    it('contentDocumentがnullの場合はエラーにならない', () => {
      Object.defineProperty(iframe, 'contentDocument', {
        value: null,
        writable: true
      });
      
      expect(() => {
        IframePreviewHelper.injectIframeScripts(iframe);
      }).not.toThrow();
    });
  });

  describe('getIframeStyles', () => {
    it('iframe用のスタイルを返す', () => {
      const styles = IframePreviewHelper.getIframeStyles();
      
      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles).toContain('body');
      expect(styles).toContain('margin');
    });

    it('基本的なリセットスタイルを含む', () => {
      const styles = IframePreviewHelper.getIframeStyles();
      
      expect(styles).toContain('margin: 0');
      expect(styles).toContain('padding: 0');
    });
  });

  describe('destroyIframe', () => {
    it('iframeを削除する', () => {
      const iframe = IframePreviewHelper.createIframe();
      container.appendChild(iframe);
      
      expect(container.contains(iframe)).toBe(true);
      
      IframePreviewHelper.destroyIframe(iframe);
      
      expect(container.contains(iframe)).toBe(false);
    });

    it('削除済みのiframeでもエラーにならない', () => {
      const iframe = IframePreviewHelper.createIframe();
      iframe.remove(); // 先に削除
      
      expect(() => {
        IframePreviewHelper.destroyIframe(iframe);
      }).not.toThrow();
    });
  });
});