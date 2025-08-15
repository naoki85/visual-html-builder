import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import VisualHtmlBuilder from '@/VisualHtmlBuilder';

describe('VisualHtmlBuilder', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create test container
    container = document.createElement('div');
    container.id = 'test-editor-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up editor instance
    if ((window as any).htmlEditor) {
      delete (window as any).htmlEditor;
    }
    container.remove();

    // Clean up injected styles
    const editorStyles = document.getElementById('html-gui-editor-styles');
    if (editorStyles) {
      editorStyles.remove();
    }
  });

  describe('constructor', () => {
    it('should initialize basic editor', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');

      expect(editor.containerId).toBe('test-editor-container');
      expect(editor.container).toBe(container);
      expect(editor.elements).toEqual([]);
      expect(editor.selectedElement).toBeNull();
      expect(editor.elementCounter).toBe(0);
    });

    it('should initialize editor with custom options', () => {
      const options = {
        theme: 'dark',
        enabledElements: ['title', 'text'],
        initialContent: [{ id: 1, type: 'title', props: { text: 'Test Title', level: 1 } }],
      };

      const editor = new VisualHtmlBuilder('test-editor-container', options);

      expect(editor.options.theme).toBe('dark');
      expect(editor.options.enabledElements).toEqual(['title', 'text']);
      expect(editor.elements).toHaveLength(1);
      expect(editor.elements[0].type).toBe('title');
    });

    it('should throw error for non-existent container ID', () => {
      expect(() => {
        new VisualHtmlBuilder('non-existent-container');
      }).toThrow('could not find a element: non-existent-container');
    });

    it('should set global window.htmlEditor', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');

      expect((window as any).htmlEditor).toBe(editor);
    });

    it('should set VisualHtmlBuilder class on window', () => {
      new VisualHtmlBuilder('test-editor-container');

      expect((window as any).VisualHtmlBuilder).toBe(VisualHtmlBuilder);
    });
  });

  describe('setupUI', () => {
    it('should build editor UI', () => {
      new VisualHtmlBuilder('test-editor-container');

      // Check if UI is built correctly
      expect(container.querySelector('.html-gui-editor')).not.toBeNull();
      expect(container.querySelector('.editor-sidebar')).not.toBeNull();
      expect(container.querySelector('.preview-area')).not.toBeNull();
      expect(container.querySelector('.editor-properties')).not.toBeNull();
    });

    it('should generate element add buttons', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');

      // Render the buttons first
      editor.render();

      const buttons = container.querySelectorAll('.element-button');
      expect(buttons.length).toBeGreaterThan(0);

      // Default element type buttons exist
      const titleBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Title'));
      expect(titleBtn).not.toBeNull();
    });
  });

  describe('getHTML', () => {
    it('should return empty string when empty', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');

      expect(editor.getHTML()).toBe('');
    });

    it('should generate HTML when elements exist', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
      editor.updateProperty('text', 'Test Title');

      const html = editor.getHTML();
      expect(html).toContain('<h1>Test Title</h1>');
    });
  });

  describe('getFullHTML', () => {
    it('should return complete HTML document', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');

      const fullHTML = editor.getFullHTML();

      expect(fullHTML).toContain('<!DOCTYPE html>');
      expect(fullHTML).toContain('<html');
      expect(fullHTML).toContain('<head>');
      expect(fullHTML).toContain('<body>');
      expect(fullHTML).toContain('</html>');
    });

    it('should use custom template', () => {
      const customTemplate = {
        head: { title: 'Custom Page' },
      };

      const editor = new VisualHtmlBuilder('test-editor-container', {
        htmlTemplate: customTemplate,
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

    it('should add new element', () => {
      const initialCount = editor.elements.length;
      editor.addElement('title');

      expect(editor.elements.length).toBe(initialCount + 1);
      expect(editor.elements[editor.elements.length - 1].type).toBe('title');
    });

    it('should increment element counter', () => {
      const initialCounter = editor.elementCounter;
      editor.addElement('text');

      expect(editor.elementCounter).toBe(initialCounter + 1);
    });

    it('should throw error for non-existent element type', () => {
      expect(() => {
        editor.addElement('non-existent-type');
      }).toThrow();
    });

    it('should update preview after adding', () => {
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

    it('should remove element with specified ID', () => {
      const elementToRemove = editor.elements[0];
      const initialCount = editor.elements.length;

      editor.deleteElement(elementToRemove.id);

      expect(editor.elements.length).toBe(initialCount - 1);
      expect(editor.elements.find(el => el.id === elementToRemove.id)).toBeUndefined();
    });

    it('should deselect when removing selected element', () => {
      const elementToRemove = editor.elements[0];
      editor.selectElement(elementToRemove.id);

      expect(editor.selectedElement).not.toBeNull();

      editor.deleteElement(elementToRemove.id);

      expect(editor.selectedElement).toBeNull();
    });

    it('should do nothing for non-existent ID', () => {
      const initialCount = editor.elements.length;

      editor.deleteElement(999);

      expect(editor.elements.length).toBe(initialCount);
    });
  });

  describe('selectElement', () => {
    let editor: VisualHtmlBuilder;

    beforeEach(() => {
      editor = new VisualHtmlBuilder('test-editor-container');
      editor.addElement('title');
    });

    it('should select element', () => {
      const element = editor.elements[0];
      editor.selectElement(element.id);

      expect(editor.selectedElement).toBe(element);
    });

    it('should not select for non-existent ID', () => {
      editor.selectElement(999);

      expect(editor.selectedElement).toBeNull();
    });

    it('should update properties panel after selection', () => {
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

    it('should update properties of selected element', () => {
      editor.updateProperty('text', 'Updated Title');

      expect(editor.selectedElement?.props.text).toBe('Updated Title');
    });

    it('should do nothing when no element is selected', () => {
      editor.selectedElement = null;

      expect(() => {
        editor.updateProperty('text', 'Test');
      }).not.toThrow();
    });

    it('should update preview after updating', () => {
      const updatePreviewSpy = vi.spyOn(editor, 'updatePreview');

      editor.updateProperty('text', 'New Text');

      expect(updatePreviewSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should not throw error with invalid settings', () => {
      expect(() => {
        new VisualHtmlBuilder('test-editor-container', {
          enabledElements: ['invalid-type'],
          initialContent: [],
        });
      }).not.toThrow();
    });

    it('should catch DOM manipulation errors', () => {
      const editor = new VisualHtmlBuilder('test-editor-container');

      // Remove container to cause DOM manipulation failure
      container.remove();

      expect(() => {
        editor.updatePreview();
      }).not.toThrow();
    });
  });
});
