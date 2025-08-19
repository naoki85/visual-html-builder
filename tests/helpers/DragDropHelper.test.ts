import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DragDropHelper,
  type DragDropOptions,
  type DragDropCallbacks,
} from '@helpers/DragDropHelper';

describe('DragDropHelper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create container and draggable elements for testing
    container = document.createElement('div');
    container.className = 'preview-area';

    // Create 3 test elements
    for (let i = 1; i <= 3; i++) {
      const element = document.createElement('div');
      element.className = 'preview-element';
      element.setAttribute('data-element-id', i.toString());
      element.textContent = `Element ${i}`;
      element.style.height = '50px';
      element.style.margin = '10px 0';
      container.appendChild(element);
    }

    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('getDefaultOptions', () => {
    it('should return default options', () => {
      const options = DragDropHelper.getDefaultOptions();

      expect(options.containerSelector).toBe('.preview-area');
      expect(options.draggableSelector).toBe('.preview-element');
      expect(options.draggedClass).toBe('dragging');
      expect(options.elementIdAttribute).toBe('data-element-id');
    });

    it('should return a new object (different reference)', () => {
      const options1 = DragDropHelper.getDefaultOptions();
      const options2 = DragDropHelper.getDefaultOptions();

      expect(options1).not.toBe(options2);
    });
  });

  describe('getDragAfterElement', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect
      const elements = container.querySelectorAll('.preview-element');
      elements.forEach((element, index) => {
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
          top: index * 70, // 50px height + 20px margin
          height: 50,
          bottom: index * 70 + 50,
          left: 0,
          right: 100,
          width: 100,
          x: 0,
          y: index * 70,
          toJSON: () => ({}),
        } as DOMRect);
      });
    });

    it('should return first element when dropping above first element', () => {
      const result = DragDropHelper.getDragAfterElement(container, 10);
      const elements = container.querySelectorAll('.preview-element');
      expect(result).toBe(elements[0]);
    });

    it('should return second element when dropping between first and second elements', () => {
      const result = DragDropHelper.getDragAfterElement(container, 60);
      const elements = container.querySelectorAll('.preview-element');
      expect(result).toBe(elements[1]);
    });

    it('should return third element when dropping between second and third elements', () => {
      const result = DragDropHelper.getDragAfterElement(container, 130);
      const elements = container.querySelectorAll('.preview-element');
      expect(result).toBe(elements[2]);
    });

    it('should return null when dropping below last element', () => {
      const result = DragDropHelper.getDragAfterElement(container, 200);
      expect(result).toBeNull();
    });

    it('should exclude dragging elements', () => {
      const elements = container.querySelectorAll('.preview-element');
      elements[1].classList.add('dragging');

      const result = DragDropHelper.getDragAfterElement(container, 60);
      expect(result).toBe(elements[2]); // Calculated excluding dragging element
    });

    it('should use custom options', () => {
      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-element',
        draggedClass: 'custom-dragging',
      };

      // Add custom element
      const customElement = document.createElement('div');
      customElement.className = 'custom-element';
      vi.spyOn(customElement, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        height: 50,
        bottom: 50,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
      container.appendChild(customElement);

      const result = DragDropHelper.getDragAfterElement(container, -10, customOptions); // Position above the element
      expect(result).toBe(customElement);
    });
  });

  describe('handleDrop', () => {
    let mockCallbacks: DragDropCallbacks;

    beforeEach(() => {
      mockCallbacks = {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDrop: vi.fn(),
        updatePreview: vi.fn(),
      };
    });

    it('should return element order', () => {
      const result = DragDropHelper.handleDrop(container, mockCallbacks);

      expect(result).toEqual([1, 2, 3]); // data-element-id values as numbers
    });

    it('should call onDrop callback', () => {
      const result = DragDropHelper.handleDrop(container, mockCallbacks);

      expect(mockCallbacks.onDrop).toHaveBeenCalledWith(result);
    });

    it('should call updatePreview callback', () => {
      DragDropHelper.handleDrop(container, mockCallbacks);

      expect(mockCallbacks.updatePreview).toHaveBeenCalled();
    });

    it('should work with custom options', () => {
      // Create elements with custom attributes
      const customContainer = document.createElement('div');
      const element1 = document.createElement('div');
      element1.className = 'custom-item';
      element1.setAttribute('data-custom-id', 'A');
      const element2 = document.createElement('div');
      element2.className = 'custom-item';
      element2.setAttribute('data-custom-id', 'B');

      customContainer.appendChild(element1);
      customContainer.appendChild(element2);
      document.body.appendChild(customContainer);

      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-item',
        elementIdAttribute: 'data-custom-id',
      };

      const result = DragDropHelper.handleDrop(customContainer, mockCallbacks, customOptions);

      expect(result).toEqual([NaN, NaN]); // parseInt converts 'A' and 'B' to NaN

      customContainer.remove();
    });

    it('should not throw errors when callbacks are undefined', () => {
      const emptyCallbacks: DragDropCallbacks = {};

      expect(() => {
        DragDropHelper.handleDrop(container, emptyCallbacks);
      }).not.toThrow();
    });
  });

  describe('setupDragAndDrop', () => {
    let mockCallbacks: DragDropCallbacks;

    beforeEach(() => {
      mockCallbacks = {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDrop: vi.fn(),
        updatePreview: vi.fn(),
      };
    });

    it('should set draggable attribute on draggable elements', () => {
      DragDropHelper.setupDragAndDrop(container, mockCallbacks);

      const elements = container.querySelectorAll('.preview-element');
      elements.forEach(element => {
        expect(element.getAttribute('draggable')).toBe('true');
      });
    });

    it('should set up drag event listeners', () => {
      const element = container.querySelector('.preview-element') as HTMLElement;
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      DragDropHelper.setupDragAndDrop(container, mockCallbacks);

      expect(addEventListenerSpy).toHaveBeenCalledWith('dragstart', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragend', expect.any(Function));
    });

    it('should set up drop event listeners on container', () => {
      const addEventListenerSpy = vi.spyOn(container, 'addEventListener');

      DragDropHelper.setupDragAndDrop(container, mockCallbacks);

      expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));
    });

    it('should work with custom options', () => {
      // Create custom element
      const customElement = document.createElement('div');
      customElement.className = 'custom-draggable';
      container.appendChild(customElement);

      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-draggable',
      };

      DragDropHelper.setupDragAndDrop(container, mockCallbacks, customOptions);

      expect(customElement.getAttribute('draggable')).toBe('true');
    });

    afterEach(() => {
      // Clean up event listeners
      const elements = container.querySelectorAll('.preview-element');
      elements.forEach(element => {
        element.removeAttribute('draggable');
      });
    });
  });
});
