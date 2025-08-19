/**
 * Iframe preview helper for HTML GUI Editor
 * Manages preview functionality isolated from parent page styles
 */

export interface PreviewCallbacks {
  onElementClick?: (elementId: number) => void;
  onElementDragStart?: (elementId: number) => void;
  onElementDragEnd?: () => void;
  onDrop?: (newOrder: number[]) => void;
}

export interface IframePreviewOptions {
  enableDragDrop?: boolean;
  enableElementSelection?: boolean;
  customStyles?: string;
  sandboxPermissions?: string[];
}

export const IframePreviewHelper = {
  /**
   * Get default options
   */
  getDefaultOptions(): Required<IframePreviewOptions> {
    return {
      enableDragDrop: true,
      enableElementSelection: true,
      customStyles: '',
      sandboxPermissions: ['allow-scripts', 'allow-same-origin'],
    };
  },

  /**
   * Create iframe preview
   * @param container Container to place the iframe
   * @param options Option settings
   */
  createIframePreview(
    container: HTMLElement,
    options: Partial<IframePreviewOptions> = {}
  ): HTMLIFrameElement {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    // Remove existing iframe if present
    const existingIframe = container.querySelector('iframe.preview-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'preview-iframe';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'white';

    // Sandbox settings
    if (finalOptions.sandboxPermissions.length > 0) {
      iframe.setAttribute('sandbox', finalOptions.sandboxPermissions.join(' '));
    }

    container.appendChild(iframe);

    // Basic HTML setup
    this.initializeIframeDocument(iframe, finalOptions);

    return iframe;
  },

  /**
   * Initialize iframe document
   * @param iframe Target iframe
   * @param options Option settings
   */
  initializeIframeDocument(
    iframe: HTMLIFrameElement,
    options: Required<IframePreviewOptions>
  ): void {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    const baseHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          ${this.getIframeBaseStyles()}
          ${options.customStyles}
        </style>
      </head>
      <body>
        <div class="preview-content"></div>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(baseHTML);
    iframeDoc.close();
  },

  /**
   * Get base styles for iframe
   */
  getIframeBaseStyles(): string {
    return `
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }

      .preview-content {
        min-height: 100%;
      }

      .preview-element {
        margin-bottom: 15px;
        border: 2px solid transparent;
        border-radius: 4px;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
        padding: 5px;
      }

      .preview-element:hover {
        border-color: #007bff;
        background: rgba(0, 123, 255, 0.02);
      }

      .preview-element.selected {
        border-color: #007bff;
        background: rgba(0, 123, 255, 0.05);
      }

      .preview-element.dragging {
        opacity: 0.7;
        transform: scale(0.98);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .element-controls {
        display: none;
        position: absolute;
        top: -35px;
        right: 0;
        background: #007bff;
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        align-items: center;
        gap: 8px;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .preview-element:hover .element-controls,
      .preview-element.selected .element-controls {
        display: flex;
      }

      .delete-element {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 2px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: background 0.2s;
      }

      .delete-element:hover {
        background: rgba(255,255,255,0.3);
      }

      .element-content {
        pointer-events: none;
        user-select: none;
      }

      .empty-state {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 40px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        margin: 20px;
      }

      /* Standard HTML elements styling */
      h1, h2, h3, h4, h5, h6 {
        margin: 0 0 10px 0;
      }

      p {
        margin: 0 0 10px 0;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      ul, ol {
        margin: 0 0 10px 0;
        padding-left: 20px;
      }

      li {
        margin-bottom: 5px;
      }
    `;
  },

  /**
   * Update iframe content
   * @param iframe Target iframe
   * @param html HTML to display
   */
  updateIframeContent(iframe: HTMLIFrameElement, html: string): void {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    const previewContent = iframeDoc.querySelector('.preview-content');
    if (previewContent) {
      previewContent.innerHTML = html;
    }
  },

  /**
   * Set up iframe event listeners
   * @param iframe Target iframe
   * @param callbacks Callback functions
   * @param options Option settings
   */
  setupIframeEventListeners(
    iframe: HTMLIFrameElement,
    callbacks: PreviewCallbacks,
    options: Partial<IframePreviewOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Element click event
    if (finalOptions.enableElementSelection && callbacks.onElementClick) {
      iframeDoc.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        
        // Handle delete button click
        if (target.classList.contains('delete-element')) {
          e.preventDefault();
          e.stopPropagation();
          const elementId = parseInt(target.getAttribute('data-element-id') || '0');
          // Send message to parent window
          window.parent.postMessage({
            type: 'deleteElement',
            elementId: elementId
          }, '*');
          return;
        }

        // Handle element selection
        const elementDiv = target.closest('.preview-element');
        if (elementDiv) {
          e.preventDefault();
          e.stopPropagation();
          const elementId = parseInt(elementDiv.getAttribute('data-element-id') || '0');
          if (callbacks.onElementClick) {
            callbacks.onElementClick(elementId);
          }
        }
      });
    }

    // Drag & drop events
    if (finalOptions.enableDragDrop) {
      this.setupIframeDragDrop(iframe, callbacks);
    }
  },

  /**
   * Set up drag & drop within iframe
   * @param iframe Target iframe
   * @param callbacks Callback functions
   */
  setupIframeDragDrop(iframe: HTMLIFrameElement, callbacks: PreviewCallbacks): void {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Drag start
    iframeDoc.addEventListener('dragstart', e => {
      const target = e.target as HTMLElement;
      const previewElement = target.closest('.preview-element') as HTMLElement;

      if (previewElement) {
        previewElement.classList.add('dragging');
        const elementId = parseInt(previewElement.getAttribute('data-element-id') || '0');

        if (callbacks.onElementDragStart) {
          callbacks.onElementDragStart(elementId);
        }

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', previewElement.outerHTML);
        }
      }
    });

    // Drag end
    iframeDoc.addEventListener('dragend', e => {
      const target = e.target as HTMLElement;
      const previewElement = target.closest('.preview-element');

      if (previewElement) {
        previewElement.classList.remove('dragging');

        if (callbacks.onElementDragEnd) {
          callbacks.onElementDragEnd();
        }
      }
    });

    // Drag over
    iframeDoc.addEventListener('dragover', e => {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      const previewContent = iframeDoc.querySelector('.preview-content') as HTMLElement;
      if (previewContent) {
        const afterElement = this.getDragAfterElementInIframe(previewContent, e.clientY);
        const draggedEl = previewContent.querySelector('.dragging');

        if (draggedEl) {
          if (afterElement == null) {
            previewContent.appendChild(draggedEl);
          } else {
            previewContent.insertBefore(draggedEl, afterElement);
          }
        }
      }
    });

    // Drop
    iframeDoc.addEventListener('drop', e => {
      e.preventDefault();

      if (callbacks.onDrop) {
        const previewContent = iframeDoc.querySelector('.preview-content');
        if (previewContent) {
          const previewElements = [...previewContent.querySelectorAll('.preview-element')];
          const newOrder = previewElements.map(el => {
            const elementId = el.getAttribute('data-element-id');
            return parseInt(elementId || '0');
          });
          callbacks.onDrop(newOrder);
        }
      }
    });
  },

  /**
   * Get element position after drag within iframe
   * @param container Container element
   * @param y Y coordinate
   */
  getDragAfterElementInIframe(container: HTMLElement, y: number): Element | null {
    const draggableElements = [...container.querySelectorAll('.preview-element:not(.dragging)')];

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
   * Inject custom styles into iframe
   * @param iframe Target iframe
   * @param styles CSS to add
   * @param styleId Style element ID
   */
  injectIframeStyles(
    iframe: HTMLIFrameElement,
    styles: string,
    styleId: string = 'custom-styles'
  ): void {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Remove existing custom styles
    const existingStyle = iframeDoc.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new styles
    const style = iframeDoc.createElement('style');
    style.id = styleId;
    style.textContent = styles;

    const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
    head.appendChild(style);
  },

  /**
   * Get iframe document
   * @param iframe Target iframe
   */
  getIframeDocument(iframe: HTMLIFrameElement): Document | null {
    return iframe.contentDocument || iframe.contentWindow?.document || null;
  },

  /**
   * Remove element from iframe
   * @param iframe Target iframe
   * @param elementId Element ID to remove
   */
  removeElementFromIframe(iframe: HTMLIFrameElement, elementId: number): void {
    const iframeDoc = this.getIframeDocument(iframe);
    if (!iframeDoc) return;

    const element = iframeDoc.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      element.remove();
    }
  },
};
