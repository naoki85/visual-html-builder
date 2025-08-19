/**
 * Drag & drop helper for HTML GUI Editor
 * Manages element reordering functionality
 */

export interface DragDropCallbacks {
  onDragStart?: (elementId: number) => void;
  onDragEnd?: () => void;
  onDrop?: (newOrder: number[]) => void;
  updatePreview?: () => void;
}

export interface DragDropOptions {
  containerSelector: string;
  draggableSelector: string;
  draggedClass?: string;
  elementIdAttribute?: string;
}

export const DragDropHelper = {
  /**
   * Get default options
   */
  getDefaultOptions(): Required<DragDropOptions> {
    return {
      containerSelector: '.preview-area',
      draggableSelector: '.preview-element',
      draggedClass: 'dragging',
      elementIdAttribute: 'data-element-id',
    };
  },

  /**
   * Get the element after which the dragged element should be inserted
   * @param container Drop area container
   * @param y Mouse Y coordinate
   * @param options Drag & drop options
   */
  getDragAfterElement(
    container: HTMLElement,
    y: number,
    options: Partial<DragDropOptions> = {}
  ): Element | null {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    const draggableElements = [
      ...container.querySelectorAll(
        `${finalOptions.draggableSelector}:not(.${finalOptions.draggedClass})`
      ),
    ];

    return draggableElements.reduce(
      (closest: { offset: number; element?: Element }, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element || null;
  },

  /**
   * Execute drop handling
   * @param container Container element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  handleDrop(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): number[] {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    const previewElements = [...container.querySelectorAll(finalOptions.draggableSelector)];
    const newOrder = previewElements.map(el => {
      const elementId = el.getAttribute(finalOptions.elementIdAttribute);
      return parseInt(elementId || '0');
    });

    // Execute callbacks
    if (callbacks.onDrop) {
      callbacks.onDrop(newOrder);
    }

    if (callbacks.updatePreview) {
      callbacks.updatePreview();
    }

    return newOrder;
  },

  /**
   * Add drag start event listener to element
   * @param element Target element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  addDragStartListener(
    element: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    element.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      target.classList.add(finalOptions.draggedClass);

      const elementId = parseInt(target.getAttribute(finalOptions.elementIdAttribute) || '0');

      if (callbacks.onDragStart) {
        callbacks.onDragStart(elementId);
      }

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    });
  },

  /**
   * Add drag end event listener to element
   * @param element Target element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  addDragEndListener(
    element: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    element.addEventListener('dragend', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove(finalOptions.draggedClass);

      if (callbacks.onDragEnd) {
        callbacks.onDragEnd();
      }
    });
  },

  /**
   * Add drag over event listener to container
   * @param container Container element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  addDragOverListener(
    container: HTMLElement,
    _callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    container.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      const afterElement = this.getDragAfterElement(container, e.clientY, options);
      const draggedEl = container.querySelector(`.${finalOptions.draggedClass}`);

      if (draggedEl) {
        if (afterElement == null) {
          container.appendChild(draggedEl);
        } else {
          container.insertBefore(draggedEl, afterElement);
        }
      }
    });
  },

  /**
   * Add drop event listener to container
   * @param container Container element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  addDropListener(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      this.handleDrop(container, callbacks, options);
    });
  },

  /**
   * Set up drag functionality for multiple elements
   * @param elements Array of draggable elements
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  setupDraggableElements(
    elements: HTMLElement[],
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    elements.forEach(element => {
      element.setAttribute('draggable', 'true');
      this.addDragStartListener(element, callbacks, options);
      this.addDragEndListener(element, callbacks, options);
    });
  },

  /**
   * Set up drop zone
   * @param container Drop zone container
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  setupDropZone(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    this.addDragOverListener(container, callbacks, options);
    this.addDropListener(container, callbacks, options);
  },

  /**
   * Set up complete drag & drop functionality
   * @param container Container element
   * @param callbacks Callback functions
   * @param options Drag & drop options
   */
  setupDragAndDrop(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    // Set up drop zone
    this.setupDropZone(container, callbacks, options);

    // Set up existing draggable elements
    const elements = [
      ...container.querySelectorAll(finalOptions.draggableSelector),
    ] as HTMLElement[];
    this.setupDraggableElements(elements, callbacks, options);
  },

  /**
   * Add CSS for drag & drop visual feedback
   */
  injectDragDropStyles(): void {
    const styleId = 'html-gui-editor-dragdrop-styles';

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .preview-element.dragging {
        opacity: 0.7;
        transform: scale(0.98);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .preview-area.drag-over {
        background: rgba(0, 123, 255, 0.05);
        border: 2px dashed var(--primary-color, #007bff);
      }

      .preview-element.drag-target {
        border-top: 3px solid var(--primary-color, #007bff);
      }

      .preview-element[draggable="true"] {
        cursor: grab;
      }

      .preview-element[draggable="true"]:active {
        cursor: grabbing;
      }
    `;

    document.head.appendChild(style);
  },
};
