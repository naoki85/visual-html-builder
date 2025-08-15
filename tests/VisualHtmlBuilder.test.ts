import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import VisualHtmlBuilder from '@/VisualHtmlBuilder';

describe('VisualHtmlBuilder', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // テスト用のコンテナを作成
    container = document.createElement('div');
    container.id = 'test-editor-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // エディターインスタンスをクリーンアップ
    if ((window as any).htmlEditor) {
      delete (window as any).htmlEditor;
    }
    container.remove();
    
    // 注入されたスタイルもクリーンアップ
    const editorStyles = document.getElementById('html-gui-editor-styles');
    if (editorStyles) {
      editorStyles.remove();
    }
  });

  describe('constructor', () => {
    it('基本的なエディターを初期化する', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      expect(editor.containerId).toBe('test-editor-container');
      expect(editor.container).toBe(container);
      expect(editor.elements).toEqual([]);
      expect(editor.selectedElement).toBeNull();
      expect(editor.elementCounter).toBe(1);
    });

    it('カスタムオプションでエディターを初期化する', () => {
      const options = {
        theme: 'dark',
        enabledElements: ['title', 'text'],
        initialContent: [
          { id: 1, type: 'title', props: { text: 'Test Title', level: 1 } }
        ]
      };
      
      const editor = new VisualHtmlBuilder('test-editor-container', options);
      
      expect(editor.options.theme).toBe('dark');
      expect(editor.options.enabledElements).toEqual(['title', 'text']);
      expect(editor.elements).toHaveLength(1);
      expect(editor.elements[0].type).toBe('title');
    });

    it('存在しないコンテナIDでエラーを投げる', () => {
      expect(() => {
        new VisualHtmlBuilder('non-existent-container');
      }).toThrow('Container element not found');
    });

    it('グローバルなwindow.htmlEditorを設定する', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      expect((window as any).htmlEditor).toBe(editor);
    });

    it('VisualHtmlBuilderクラスをwindowに設定する', () => {
      new VisualHtmlBuilder('test-editor-container');
      
      expect((window as any).VisualHtmlBuilder).toBe(VisualHtmlBuilder);
    });
  });

  describe('setupUI', () => {
    it('エディターUIを構築する', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      // UIが正しく構築されているかチェック
      expect(container.className).toContain('html-gui-editor');
      expect(container.querySelector('.editor-sidebar')).not.toBeNull();
      expect(container.querySelector('.preview-container')).not.toBeNull();
      expect(container.querySelector('.properties-panel')).not.toBeNull();
    });

    it('要素追加ボタンが生成される', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      const buttons = container.querySelectorAll('.element-btn');
      expect(buttons.length).toBeGreaterThan(0);
      
      // デフォルトの要素タイプボタンが存在する
      const titleBtn = Array.from(buttons).find(btn => 
        btn.textContent?.includes('Title')
      );
      expect(titleBtn).not.toBeNull();
    });
  });

  describe('getHTML', () => {
    it('空の場合は空文字列を返す', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      expect(editor.getHTML()).toBe('');
    });

    it('要素がある場合はHTMLを生成する', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
      editor.updateProperty('text', 'Test Title');
      
      const html = editor.getHTML();
      expect(html).toContain('<h1>Test Title</h1>');
    });
  });

  describe('getFullHTML', () => {
    it('完全なHTMLドキュメントを返す', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
      
      const fullHTML = editor.getFullHTML();
      
      expect(fullHTML).toContain('<!DOCTYPE html>');
      expect(fullHTML).toContain('<html');
      expect(fullHTML).toContain('<head>');
      expect(fullHTML).toContain('<body>');
      expect(fullHTML).toContain('</html>');
    });

    it('カスタムテンプレートを使用する', () => {
      const customTemplate = {
        head: { title: 'Custom Page' }
      };
      
      const editor = new VisualHtmlBuilder('test-editor-container', {
        htmlTemplate: customTemplate
      });
      
      const fullHTML = editor.getFullHTML();
      expect(fullHTML).toContain('<title>Custom Page</title>');
    });
  });

  describe('addElement', () => {
    let editor: VisualHtmlBuilder;

    beforeEach(() => {
      editor = new VisualHtmlBuilder('test-editor-container');
    });

    it('新しい要素を追加する', () => {
      const initialCount = editor.elements.length;
      editor.addElement('title');
      
      expect(editor.elements.length).toBe(initialCount + 1);
      expect(editor.elements[editor.elements.length - 1].type).toBe('title');
    });

    it('要素カウンターが増加する', () => {
      const initialCounter = editor.elementCounter;
      editor.addElement('text');
      
      expect(editor.elementCounter).toBe(initialCounter + 1);
    });

    it('存在しない要素タイプでエラーを投げる', () => {
      expect(() => {
        editor.addElement('non-existent-type');
      }).toThrow();
    });

    it('追加後にプレビューが更新される', () => {
      const updatePreviewSpy = vi.spyOn(editor, 'updatePreview');
      editor.addElement('title');
      
      expect(updatePreviewSpy).toHaveBeenCalled();
    });
  });

  describe('removeElement', () => {
    let editor: VisualHtmlBuilder;

    beforeEach(() => {
      editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
      editor.addElement('text');
    });

    it('指定されたIDの要素を削除する', () => {
      const elementToRemove = editor.elements[0];
      const initialCount = editor.elements.length;
      
      editor.removeElement(elementToRemove.id);
      
      expect(editor.elements.length).toBe(initialCount - 1);
      expect(editor.elements.find(el => el.id === elementToRemove.id)).toBeUndefined();
    });

    it('選択された要素を削除した場合は選択を解除する', () => {
      const elementToRemove = editor.elements[0];
      editor.selectElement(elementToRemove.id);
      
      expect(editor.selectedElement).not.toBeNull();
      
      editor.removeElement(elementToRemove.id);
      
      expect(editor.selectedElement).toBeNull();
    });

    it('存在しないIDでは何もしない', () => {
      const initialCount = editor.elements.length;
      
      editor.removeElement(999);
      
      expect(editor.elements.length).toBe(initialCount);
    });
  });

  describe('selectElement', () => {
    let editor: VisualHtmlBuilder;

    beforeEach(() => {
      editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
    });

    it('要素を選択する', () => {
      const element = editor.elements[0];
      editor.selectElement(element.id);
      
      expect(editor.selectedElement).toBe(element);
    });

    it('存在しないIDでは選択しない', () => {
      editor.selectElement(999);
      
      expect(editor.selectedElement).toBeNull();
    });

    it('選択後にプロパティパネルが更新される', () => {
      const updatePropertiesSpy = vi.spyOn(editor, 'updatePropertiesPanel');
      const element = editor.elements[0];
      
      editor.selectElement(element.id);
      
      expect(updatePropertiesSpy).toHaveBeenCalled();
    });
  });

  describe('updateProperty', () => {
    let editor: VisualHtmlBuilder;

    beforeEach(() => {
      editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
      editor.selectElement(editor.elements[0].id);
    });

    it('選択された要素のプロパティを更新する', () => {
      editor.updateProperty('text', 'Updated Title');
      
      expect(editor.selectedElement?.props.text).toBe('Updated Title');
    });

    it('選択された要素がない場合は何もしない', () => {
      editor.selectedElement = null;
      
      expect(() => {
        editor.updateProperty('text', 'Test');
      }).not.toThrow();
    });

    it('更新後にプレビューが更新される', () => {
      const updatePreviewSpy = vi.spyOn(editor, 'updatePreview');
      
      editor.updateProperty('text', 'New Text');
      
      expect(updatePreviewSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('無効な設定でもエラーにならない', () => {
      expect(() => {
        new VisualHtmlBuilder('test-editor-container', {
          enabledElements: ['invalid-type'],
          initialContent: []
        });
      }).not.toThrow();
    });

    it('DOM操作エラーをキャッチする', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      
      // コンテナを削除してDOM操作を失敗させる
      container.remove();
      
      expect(() => {
        editor.updatePreview();
      }).not.toThrow();
    });
  });
});