import { UtilityHelpers } from './UtilityHelpers';

export interface ElementType {
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  render: (props: Record<string, any>) => string;
  renderEditor: (
    props: Record<string, any>,
    onChange?: (key: string, value: any) => void
  ) => string;
  validate: (props: Record<string, any>) => string | null;
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
      render: (props: any) =>
        `<h${props.level}>${UtilityHelpers.escapeHtml(props.text)}</h${props.level}>`,
      renderEditor: (props: any) => `
        <div class="property-group">
          <label>Text:</label>
          <input type="text" value="${UtilityHelpers.escapeHtml(props.text)}" 
                 onchange="window.htmlEditor.updateProperty('text', this.value)">
        </div>
        <div class="property-group">
          <label>Level:</label>
          <select onchange="window.htmlEditor.updateProperty('level', parseInt(this.value))">
            ${[1, 2, 3, 4, 5, 6].map(i => `<option value="${i}" ${props.level === i ? 'selected' : ''}>H${i}</option>`).join('')}
          </select>
        </div>
      `,
      validate: (props: any) => (props.text.trim().length > 0 ? null : 'Title cannot be empty'),
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
      render: (props: any) =>
        `<p>${UtilityHelpers.escapeHtml(props.content).replace(/\n/g, '<br>')}</p>`,
      renderEditor: (props: any) => `
        <div class="property-group">
          <label>Content:</label>
          <textarea rows="4" onchange="window.htmlEditor.updateProperty('content', this.value)">${UtilityHelpers.escapeHtml(props.content)}</textarea>
        </div>
      `,
      validate: (props: any) =>
        props.content.trim().length > 0 ? null : 'Text content cannot be empty',
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
        width: '',
        height: '',
      },
      render: (props: any) => {
        const style = [];
        if (props.width) style.push(`width: ${props.width}px`);
        if (props.height) style.push(`height: ${props.height}px`);
        return `<img src="${UtilityHelpers.escapeHtml(props.src)}" alt="${UtilityHelpers.escapeHtml(props.alt)}"${style.length ? ` style="${style.join('; ')}"` : ''}>`;
      },
      renderEditor: (props: any) => `
        <div class="property-group">
          <label>Image URL:</label>
          <input type="url" value="${UtilityHelpers.escapeHtml(props.src)}" 
                 onchange="window.htmlEditor.updateProperty('src', this.value)"
                 placeholder="https://example.com/image.jpg">
        </div>
        <div class="property-group">
          <label>Alt Text:</label>
          <input type="text" value="${UtilityHelpers.escapeHtml(props.alt)}" 
                 onchange="window.htmlEditor.updateProperty('alt', this.value)">
        </div>
        <div class="property-group">
          <label>Width (px):</label>
          <input type="number" value="${props.width}" 
                 onchange="window.htmlEditor.updateProperty('width', this.value)"
                 min="1" placeholder="Auto">
        </div>
        <div class="property-group">
          <label>Height (px):</label>
          <input type="number" value="${props.height}" 
                 onchange="window.htmlEditor.updateProperty('height', this.value)"
                 min="1" placeholder="Auto">
        </div>
      `,
      validate: (props: any) => {
        if (!props.src.trim()) return 'Image URL is required';
        if (!UtilityHelpers.isValidUrl(props.src)) return 'Please enter a valid URL';
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
      render: (props: any) => {
        const tag = props.ordered ? 'ol' : 'ul';
        const items = props.items
          .map((item: any) => `<li>${UtilityHelpers.escapeHtml(item)}</li>`)
          .join('');
        return `<${tag}>${items}</${tag}>`;
      },
      renderEditor: (props: any) => `
        <div class="property-group">
          <label>
            <input type="checkbox" ${props.ordered ? 'checked' : ''} 
                   onchange="window.htmlEditor.updateProperty('ordered', this.checked)">
            Ordered List
          </label>
        </div>
        <div class="property-group">
          <label>Items:</label>
          <div class="list-editor">
            ${props.items
              .map(
                (item: any, index: any) => `
              <div class="list-item-editor">
                <input type="text" value="${UtilityHelpers.escapeHtml(item)}" 
                       onchange="window.htmlEditor.updateListItem(${index}, this.value)">
                <button type="button" onclick="window.htmlEditor.removeListItem(${index})">×</button>
              </div>
            `
              )
              .join('')}
            <button type="button" onclick="window.htmlEditor.addListItem()">+ Add Item</button>
          </div>
        </div>
      `,
      validate: (props: any) => {
        if (props.items.length === 0) return 'List must have at least one item';
        if (props.items.some((item: any) => !item.trim())) return 'List items cannot be empty';
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
