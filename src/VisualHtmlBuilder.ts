import { ElementTypesHelper, type ElementType } from './helpers/ElementTypesHelper';
import { StylesHelper } from './helpers/StylesHelper';
import { NotificationHelper } from './helpers/NotificationHelper';
import { DragDropHelper } from './helpers/DragDropHelper';
import { IframePreviewHelper } from './helpers/IframePreviewHelper';
import { HTMLTemplateHelper, type HTMLTemplate } from './helpers/HTMLTemplateHelper';


interface EditorOptions {
  theme?: string;
  enabledElements?: string[];
  initialContent?: EditorElement[];
  iframePreviewOptions?: {
    enableDragDrop?: boolean;
    enableElementSelection?: boolean;
    customStyles?: string;
  };
  htmlTemplate?: HTMLTemplate;
}

// ElementType interface is now imported from ElementTypesHelper

interface EditorElement {
  id: number;
  type: string;
  props: Record<string, any>;
}

class VisualHtmlBuilder {
  public containerId: string;
  public container: HTMLElement;
  public options: EditorOptions & {
    theme: string;
    enabledElements: string[];
    initialContent: EditorElement[];
  };
  public elements: EditorElement[];
  public selectedElement: EditorElement | null;
  public draggedElement: number | null;
  public elementTypes: Record<string, ElementType>;
  public elementCounter: number;
  public previewIframe: HTMLIFrameElement | null;
  public htmlTemplate: HTMLTemplate;

  constructor(containerId: string, options: EditorOptions = {}) {
    this.containerId = containerId;
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`could not find a element: ${this.containerId}`);
    }

    this.container = container;
    this.options = {
      theme: 'default',
      enabledElements: ['title', 'text', 'image', 'list'],
      initialContent: [],
      ...options,
    };

    this.elements = [];
    this.selectedElement = null;
    this.draggedElement = null;
    this.elementTypes = ElementTypesHelper.getAllElementTypes();
    this.elementCounter = 0;
    this.previewIframe = null;
    this.htmlTemplate = options.htmlTemplate || HTMLTemplateHelper.getDefaultTemplate();

    this.init();
  }

  init() {
    // Setup basic structure and styles without rendering element buttons
    this.setupDOM();

    // Load initial content if provided
    if (this.options.initialContent.length > 0) {
      this.elements = [...this.options.initialContent];
    }


    // Set up postMessage listener for iframe communication
    this.setupPostMessageListener();
  }

  // Element types are now managed by ElementTypesHelper

  setupDOM() {
    this.container.innerHTML = `
      <div class="html-gui-editor">
        <div class="editor-sidebar">
          <h3>Add Elements</h3>
          <div class="element-buttons">
            <!-- Element buttons will be rendered when render() is called -->
          </div>
        </div>
        
        <div class="editor-main">
          <div class="editor-tabs">
            <button class="tab-button active" data-tab="preview">Preview</button>
            <button class="tab-button" data-tab="html">HTML</button>
            <button class="copy-html-button">📋 Copy HTML</button>
          </div>
          
          <div class="tab-content">
            <div class="tab-panel active" data-panel="preview">
              <div class="preview-area" id="preview-${this.containerId}">
                <!-- <div class="empty-state">Click elements from the sidebar to add them here</div> -->
              </div>
            </div>
            <div class="tab-panel" data-panel="html">
              <textarea class="html-output" readonly></textarea>
            </div>
          </div>
        </div>
        
        <div class="editor-properties">
          <h3>Properties</h3>
          <div class="properties-content">
            <div class="no-selection">Select an element to edit its properties</div>
          </div>
        </div>
      </div>
    `;

    // Inject default styles
    StylesHelper.injectEditorStyles();
    DragDropHelper.injectDragDropStyles();

  }

  render() {
    // Update element buttons based on current enabled elements and registered types
    const elementButtonsContainer = this.container.querySelector('.element-buttons');
    if (elementButtonsContainer) {
      elementButtonsContainer.innerHTML = this.options.enabledElements
        .map(
          type => `
        <button class="element-button" data-type="${type}">
          <span class="element-icon">${this.elementTypes[type]?.icon || '?'}</span>
          <span class="element-name">${this.elementTypes[type]?.name || type}</span>
        </button>
      `
        )
        .join('');
    }

    // Re-attach event listeners for new buttons
    this.attachEventListeners();

    // Update preview if there are elements
    if (this.elements.length > 0) {
      this.updatePreview();
    }
  }

  attachEventListeners() {
    // Element buttons
    this.container.querySelectorAll('.element-button').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget as HTMLElement;
        if (!target) return;

        const type = target.dataset.type;
        if (type) {
          this.addElement(type);
        }
      });
    });

    // Tab switching
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget as HTMLElement;
        if (!target) return;

        const tab = target.dataset.tab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // Copy HTML button
    this.container.querySelector('.copy-html-button')?.addEventListener('click', () => {
      this.copyHTML();
    });

    // Note: Preview area interactions are now handled by iframe event listeners
  }

  addElement(type: string) {
    if (!this.elementTypes[type]) {
      throw new Error(`Unknown element type: ${type}`);
    }

    const element = {
      id: Date.now() + ++this.elementCounter,
      type: type,
      props: { ...this.elementTypes[type].defaultProps },
    };

    this.elements.push(element);
    this.updatePreview();
    this.selectElement(element.id);
  }

  selectElement(elementId: number) {
    this.selectedElement = this.elements.find(el => el.id === elementId) || null;
    this.updatePropertiesPanel();

    // Update visual selection
    this.container.querySelectorAll('.preview-element').forEach(el => {
      el.classList.remove('selected');
    });

    const selectedEl = this.container.querySelector(`[data-element-id="${elementId}"]`);
    if (selectedEl) {
      selectedEl.classList.add('selected');
    }
  }

  updatePreview() {
    this.updateIframePreview();
    this.updateHTMLOutput();
  }

  updateIframePreview() {
    const previewArea = this.container.querySelector('.preview-area');
    if (!previewArea) return;

    // Create iframe if not exists
    if (!this.previewIframe) {
      // Add iframe-mode class for CSS styling
      previewArea.classList.add('iframe-mode');

      this.previewIframe = IframePreviewHelper.createIframePreview(
        previewArea as HTMLElement,
        this.options.iframePreviewOptions
      );

      // Setup event listeners for iframe
      IframePreviewHelper.setupIframeEventListeners(
        this.previewIframe,
        {
          onElementClick: elementId => {
            this.selectElement(elementId);
          },
          onElementDragStart: elementId => {
            this.draggedElement = elementId;
          },
          onElementDragEnd: () => {
            this.draggedElement = null;
          },
          onDrop: newOrder => {
            // Reorder elements array
            const newElements: EditorElement[] = [];
            newOrder.forEach(id => {
              const element = this.elements.find(el => el.id === id);
              if (element) {
                newElements.push(element);
              }
            });
            this.elements = newElements;
            this.updatePreview();
          },
        },
        this.options.iframePreviewOptions
      );
    }

    // Generate HTML content
    const htmlContent =
      this.elements.length === 0
        ? '<div class="empty-state">Click elements from the sidebar to add them here</div>'
        : this.elements
            .map(element => {
              const elementType = this.elementTypes[element.type];
              const validation = elementType?.validate(element.props);

              return `
            <div class="preview-element ${validation ? 'has-error' : ''}" 
                 data-element-id="${element.id}" 
                 draggable="true">
              <div class="element-controls">
                <span class="element-type">${elementType?.name}</span>
                ${validation ? `<span class="validation-error">${validation}</span>` : ''}
                <button class="delete-element" data-element-id="${element.id}">×</button>
              </div>
              <div class="element-content">
                ${elementType?.render(element.props) || ''}
              </div>
            </div>
          `;
            })
            .join('');

    // Update iframe content
    IframePreviewHelper.updateIframeContent(this.previewIframe, htmlContent);
  }

  updateHTMLOutput() {
    const htmlOutput = this.container.querySelector('.html-output') as HTMLTextAreaElement;
    if (!htmlOutput) return;

    const html = this.generateFullHTML();
    htmlOutput.value = html;
  }

  generateHTML() {
    if (this.elements.length === 0) return '';

    return this.elements
      .map(element => this.elementTypes[element.type]?.render(element.props) || '')
      .join('\n');
  }

  updatePropertiesPanel() {
    const propertiesContent = this.container.querySelector('.properties-content');

    if (!propertiesContent) return;

    if (!this.selectedElement) {
      propertiesContent.innerHTML =
        '<div class="no-selection">Select an element to edit its properties</div>';
      return;
    }

    const elementType = this.elementTypes[this.selectedElement.type];
    if (!elementType) return;

    const validation = elementType.validate(this.selectedElement.props);

    propertiesContent.innerHTML = `
      <div class="properties-header">
        <h4>${elementType.name}</h4>
        ${validation ? `<div class="validation-error">${validation}</div>` : ''}
      </div>
      ${elementType.renderEditor(this.selectedElement.props)}
    `;

    // Set up event listeners for property inputs
    this.setupPropertyEventListeners(propertiesContent);
  }

  updateValidationDisplay(previousProps: Record<string, any>) {
    if (!this.selectedElement) return;

    const propertiesContent = this.container.querySelector('.properties-content');
    if (!propertiesContent) return;

    const elementType = this.elementTypes[this.selectedElement.type];
    if (!elementType) return;

    const currentValidation = elementType.validate(this.selectedElement.props);
    const previousValidation = elementType.validate(previousProps);

    // Only update validation error display if validation state changed
    if (currentValidation !== previousValidation) {
      const validationErrorEl = propertiesContent.querySelector('.validation-error');
      const propertiesHeader = propertiesContent.querySelector('.properties-header h4');
      
      if (currentValidation) {
        // Add or update validation error
        if (validationErrorEl) {
          validationErrorEl.textContent = currentValidation;
        } else if (propertiesHeader && propertiesHeader.parentNode) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-error';
          errorDiv.textContent = currentValidation;
          propertiesHeader.parentNode.appendChild(errorDiv);
        }
      } else {
        // Remove validation error
        if (validationErrorEl) {
          validationErrorEl.remove();
        }
      }
    }
  }

  updateProperty(key: string, value: any) {
    if (!this.selectedElement) return;

    const previousProps = { ...this.selectedElement.props };
    this.selectedElement.props[key] = value;
    this.updatePreview();
    
    // Only update validation error display instead of full panel re-render
    this.updateValidationDisplay(previousProps);
  }

  setupPropertyEventListeners(container: Element) {
    // Handle property inputs
    const propertyInputs = container.querySelectorAll('.property-input');
    propertyInputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const property = element.dataset.property;
      const valueType = element.dataset.valueType;

      if (!property) return;

      const eventType = element.type === 'checkbox' ? 'change' : 'input';
      element.addEventListener(eventType, () => {
        let value: any = element.value;

        // Type conversion based on data-value-type
        if (valueType === 'int') {
          value = parseInt(value, 10);
        } else if (valueType === 'boolean') {
          value = (element as HTMLInputElement).checked;
        }

        this.updateProperty(property, value);
      });
    });

    // Handle list item inputs
    const listItemInputs = container.querySelectorAll('.list-item-input');
    listItemInputs.forEach(input => {
      const element = input as HTMLInputElement;
      const index = parseInt(element.dataset.index || '0', 10);

      element.addEventListener('input', () => {
        this.updateListItem(index, element.value);
      });
    });

    // Handle list item removal buttons
    const removeButtons = container.querySelectorAll('.remove-list-item');
    removeButtons.forEach(button => {
      const element = button as HTMLButtonElement;
      const index = parseInt(element.dataset.index || '0', 10);

      element.addEventListener('click', () => {
        this.removeListItem(index);
      });
    });

    // Handle add list item button
    const addButton = container.querySelector('.add-list-item');
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.addListItem();
      });
    }
  }

  setupPostMessageListener() {
    window.addEventListener('message', (event) => {
      // For security, check origin if needed
      // if (event.origin !== expectedOrigin) return;

      if (event.data && event.data.type === 'deleteElement') {
        this.deleteElement(event.data.elementId);
      }
    });
  }

  // List-specific methods
  updateListItem(index: number, value: string) {
    if (!this.selectedElement || this.selectedElement.type !== 'list') return;

    this.selectedElement.props.items[index] = value;
    this.updatePreview();
    this.updatePropertiesPanel();
  }

  addListItem() {
    if (!this.selectedElement || this.selectedElement.type !== 'list') return;

    this.selectedElement.props.items.push('New item');
    this.updatePreview();
    this.updatePropertiesPanel();
  }

  removeListItem(index: number) {
    if (!this.selectedElement || this.selectedElement.type !== 'list') return;

    this.selectedElement.props.items.splice(index, 1);
    this.updatePreview();
    this.updatePropertiesPanel();
  }

  deleteElement(elementId: number) {
    this.elements = this.elements.filter(el => el.id !== elementId);

    if (this.selectedElement && this.selectedElement.id === elementId) {
      this.selectedElement = null;
    }

    this.updatePreview();
    this.updatePropertiesPanel();
  }

  switchTab(tabName: string) {
    // Update tab buttons
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    this.container.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab panels
    this.container.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    this.container.querySelector(`[data-panel="${tabName}"]`)?.classList.add('active');

    if (tabName === 'html') {
      this.updateHTMLOutput();
    }
  }

  async copyHTML() {
    const html = this.generateFullHTML();

    try {
      await navigator.clipboard.writeText(html);
      NotificationHelper.showSuccess('Full HTML copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      NotificationHelper.showSuccess('Full HTML copied to clipboard!');
    }
  }

  // Notifications are now managed by NotificationHelper

  // Drag and drop functionality is now managed by DragDropHelper

  // Utility methods (escapeHtml, isValidUrl) are inherited from UtilityMixin

  // Styles are now managed by StylesHelper

  // Full HTML generation methods
  generateFullHTML(): string {
    const bodyContent = this.generateHTML();
    return HTMLTemplateHelper.generateFullHTML(bodyContent, this.htmlTemplate);
  }

  getFullHTML(): string {
    return this.generateFullHTML();
  }

  updateHTMLTemplate(template: Partial<HTMLTemplate>): void {
    this.htmlTemplate = HTMLTemplateHelper.updateTemplate(this.htmlTemplate, template);
  }

  getHTMLTemplate(): HTMLTemplate {
    return { ...this.htmlTemplate };
  }

  // Public API methods
  getHTML() {
    return this.generateHTML();
  }

  getElements() {
    return [...this.elements];
  }

  setElements(elements: EditorElement[]) {
    this.elements = [...elements];
    this.selectedElement = null;
    this.updatePreview();
    this.updatePropertiesPanel();
  }

  registerElementType(name: string, definition: ElementType) {
    this.elementTypes = ElementTypesHelper.registerElementType(this.elementTypes, name, definition);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

// Export as ES module (modern standard)
export default VisualHtmlBuilder;

