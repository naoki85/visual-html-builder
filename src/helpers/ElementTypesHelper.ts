import { UtilityHelpers } from './UtilityHelpers';

// Updated ElementType interface using unknown instead of any
export interface ElementType {
  name: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  render: (props: Record<string, unknown>) => string;
  renderEditor: (
    props: Record<string, unknown>,
    onChange?: (key: string, value: unknown) => void
  ) => string;
  validate: (props: Record<string, unknown>) => string | null;
}

/**
 * Element type definition helper for HTML GUI Editor
 */
export const ElementTypesHelper = {
  /**
   * Create title element type
   */
  createTitleElement(): ElementType {
    return {
      name: 'Title',
      icon: 'H',
      defaultProps: { text: 'New Title', level: 1 },
      render: (props: Record<string, unknown>) => {
        const level = typeof props.level === 'number' && props.level >= 1 && props.level <= 6 ? props.level : 1;
        const text = typeof props.text === 'string' ? props.text : '';
        return `<h${level}>${UtilityHelpers.escapeHtml(text)}</h${level}>`;
      },
      renderEditor: (props: Record<string, unknown>) => {
        const text = typeof props.text === 'string' ? props.text : '';
        const level = typeof props.level === 'number' ? props.level : 1;
        return `
        <div class="property-group">
          <label>Text:</label>
          <input type="text" value="${UtilityHelpers.escapeHtml(text)}" 
                 class="property-input" data-property="text">
        </div>
        <div class="property-group">
          <label>Level:</label>
          <select class="property-input" data-property="level" data-value-type="int">
            ${[1, 2, 3, 4, 5, 6].map(i => `<option value="${i}" ${level === i ? 'selected' : ''}>H${i}</option>`).join('')}
          </select>
        </div>`;
      },
      validate: (props: Record<string, unknown>) => {
        const text = typeof props.text === 'string' ? props.text : '';
        return text.trim().length > 0 ? null : 'Title cannot be empty';
      },
    };
  },

  /**
   * Create text element type
   */
  createTextElement(): ElementType {
    return {
      name: 'Text',
      icon: 'T',
      defaultProps: { content: 'Enter your text here...' },
      render: (props: Record<string, unknown>) => {
        const content = typeof props.content === 'string' ? props.content : '';
        return `<p>${UtilityHelpers.escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
      },
      renderEditor: (props: Record<string, unknown>) => {
        const content = typeof props.content === 'string' ? props.content : '';
        return `
        <div class="property-group">
          <label>Content:</label>
          <textarea rows="4" class="property-input" data-property="content">${UtilityHelpers.escapeHtml(content)}</textarea>
        </div>`;
      },
      validate: (props: Record<string, unknown>) => {
        const content = typeof props.content === 'string' ? props.content : '';
        return content.trim().length > 0 ? null : 'Text content cannot be empty';
      },
    };
  },

  /**
   * Create image element type
   */
  createImageElement(): ElementType {
    return {
      name: 'Image',
      icon: '🖼',
      defaultProps: {
        src: 'https://raw.githubusercontent.com/naoki85/visual-html-builder/refs/heads/main/src/typescript.svg',
        alt: 'Sample image',
        width: undefined,
        height: undefined,
      },
      render: (props: Record<string, unknown>) => {
        const src = typeof props.src === 'string' ? props.src : '';
        const alt = typeof props.alt === 'string' ? props.alt : '';
        const width = typeof props.width === 'number' ? props.width : 
          typeof props.width === 'string' && !isNaN(Number(props.width)) ? Number(props.width) : undefined;
        const height = typeof props.height === 'number' ? props.height : 
          typeof props.height === 'string' && !isNaN(Number(props.height)) ? Number(props.height) : undefined;
        
        const style = [];
        if (width) style.push(`width: ${width}px`);
        if (height) style.push(`height: ${height}px`);
        return `<img src="${UtilityHelpers.escapeHtml(src)}" alt="${UtilityHelpers.escapeHtml(alt)}"${style.length ? ` style="${style.join('; ')}"` : ''}>`;
      },
      renderEditor: (props: Record<string, unknown>) => {
        const src = typeof props.src === 'string' ? props.src : '';
        const alt = typeof props.alt === 'string' ? props.alt : '';
        const width = typeof props.width === 'number' ? props.width : 
          typeof props.width === 'string' && !isNaN(Number(props.width)) ? Number(props.width) : undefined;
        const height = typeof props.height === 'number' ? props.height : 
          typeof props.height === 'string' && !isNaN(Number(props.height)) ? Number(props.height) : undefined;
        
        return `
        <div class="property-group">
          <label>Image URL:</label>
          <input type="url" value="${UtilityHelpers.escapeHtml(src)}" 
                 class="property-input" data-property="src"
                 placeholder="https://example.com/image.jpg">
        </div>
        <div class="property-group">
          <label>Alt Text:</label>
          <input type="text" value="${UtilityHelpers.escapeHtml(alt)}" 
                 class="property-input" data-property="alt">
        </div>
        <div class="property-group">
          <label>Width (px):</label>
          <input type="number" value="${width || ''}" 
                 class="property-input" data-property="width"
                 min="1" placeholder="Auto">
        </div>
        <div class="property-group">
          <label>Height (px):</label>
          <input type="number" value="${height || ''}" 
                 class="property-input" data-property="height"
                 min="1" placeholder="Auto">
        </div>`;
      },
      validate: (props: Record<string, unknown>) => {
        const src = typeof props.src === 'string' ? props.src : '';
        if (!src.trim()) return 'Image URL is required';
        if (!UtilityHelpers.isValidUrl(src)) return 'Please enter a valid URL';
        return null;
      },
    };
  },

  /**
   * Create list element type
   */
  createListElement(): ElementType {
    return {
      name: 'List',
      icon: '•',
      defaultProps: { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false },
      render: (props: Record<string, unknown>) => {
        const ordered = typeof props.ordered === 'boolean' ? props.ordered : false;
        const itemsArray = Array.isArray(props.items) ? props.items : [];
        const tag = ordered ? 'ol' : 'ul';
        const items = itemsArray
          .filter((item): item is string => typeof item === 'string')
          .map((item: string) => `<li>${UtilityHelpers.escapeHtml(item)}</li>`)
          .join('');
        return `<${tag}>${items}</${tag}>`;
      },
      renderEditor: (props: Record<string, unknown>) => {
        const ordered = typeof props.ordered === 'boolean' ? props.ordered : false;
        const itemsArray = Array.isArray(props.items) ? props.items : [];
        const validItems = itemsArray.filter((item): item is string => typeof item === 'string');
        
        return `
        <div class="property-group">
          <label>
            <input type="checkbox" ${ordered ? 'checked' : ''} 
                   class="property-input" data-property="ordered" data-value-type="boolean">
            Ordered List
          </label>
        </div>
        <div class="property-group">
          <label>Items:</label>
          <div class="list-editor">
            ${validItems
              .map(
                (item: string, index: number) => `
              <div class="list-item-editor">
                <input type="text" value="${UtilityHelpers.escapeHtml(item)}" 
                       class="list-item-input" data-index="${index}">
                <button type="button" class="remove-list-item" data-index="${index}">×</button>
              </div>
            `
              )
              .join('')}
            <button type="button" class="add-list-item">+ Add Item</button>
          </div>
        </div>`;
      },
      validate: (props: Record<string, unknown>) => {
        const itemsArray = Array.isArray(props.items) ? props.items : [];
        const validItems = itemsArray.filter((item): item is string => typeof item === 'string');
        
        if (validItems.length === 0) return 'List must have at least one item';
        if (validItems.some((item: string) => !item.trim())) return 'List items cannot be empty';
        return null;
      },
    };
  },

  /**
   * Get all element types
   */
  getAllElementTypes(): Record<string, ElementType> {
    return {
      title: this.createTitleElement(),
      text: this.createTextElement(),
      image: this.createImageElement(),
      list: this.createListElement(),
    };
  },

  /**
   * Add custom element type to default element types
   * @param elementTypes Existing element types
   * @param name New element type name
   * @param definition New element type definition
   */
  registerElementType(
    elementTypes: Record<string, ElementType>,
    name: string,
    definition: ElementType
  ): Record<string, ElementType> {
    return {
      ...elementTypes,
      [name]: definition,
    };
  },
};
