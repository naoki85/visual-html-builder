import { describe, it, expect, beforeEach } from 'vitest';
import { ElementTypesHelper, type ElementType } from '@helpers/ElementTypesHelper';

describe('ElementTypesHelper', () => {
  describe('createTitleElement', () => {
    let titleElement: ElementType;

    beforeEach(() => {
      titleElement = ElementTypesHelper.createTitleElement();
    });

    it('should have correct basic properties', () => {
      expect(titleElement.name).toBe('Title');
      expect(titleElement.icon).toBe('H');
      expect(titleElement.defaultProps).toEqual({ text: 'New Title', level: 1 });
    });

    it('should render H1 tag', () => {
      const html = titleElement.render({ text: 'Test Title', level: 1 });
      expect(html).toBe('<h1>Test Title</h1>');
    });

    it('should render different level header tags', () => {
      const h3 = titleElement.render({ text: 'H3 Title', level: 3 });
      expect(h3).toBe('<h3>H3 Title</h3>');
    });

    it('should perform HTML escaping', () => {
      const html = titleElement.render({ text: '<script>alert("xss")</script>', level: 2 });
      expect(html).toBe('<h2>&lt;script&gt;alert("xss")&lt;/script&gt;</h2>');
    });

    it('should generate editor HTML', () => {
      const editor = titleElement.renderEditor({ text: 'Test', level: 2 });
      expect(editor).toContain('input type="text"');
      expect(editor).toContain('value="Test"');
      expect(editor).toContain('select');
      expect(editor).toContain('option value="2" selected');
    });

    it('should treat empty title as validation error', () => {
      const error = titleElement.validate({ text: '', level: 1 });
      expect(error).toBe('Title cannot be empty');

      const error2 = titleElement.validate({ text: '   ', level: 1 });
      expect(error2).toBe('Title cannot be empty');
    });

    it('should pass validation for valid title', () => {
      const error = titleElement.validate({ text: 'Valid Title', level: 1 });
      expect(error).toBeNull();
    });
  });

  describe('createTextElement', () => {
    let textElement: ElementType;

    beforeEach(() => {
      textElement = ElementTypesHelper.createTextElement();
    });

    it('should have correct basic properties', () => {
      expect(textElement.name).toBe('Text');
      expect(textElement.icon).toBe('T');
      expect(textElement.defaultProps).toEqual({ content: 'Enter your text here...' });
    });

    it('should render paragraph tag', () => {
      const html = textElement.render({ content: 'Test content' });
      expect(html).toBe('<p>Test content</p>');
    });

    it('should convert line breaks to BR tags', () => {
      const html = textElement.render({ content: 'Line 1\nLine 2\nLine 3' });
      expect(html).toBe('<p>Line 1<br>Line 2<br>Line 3</p>');
    });

    it('should perform HTML escaping', () => {
      const html = textElement.render({ content: '<div>Test</div>' });
      expect(html).toBe('<p>&lt;div&gt;Test&lt;/div&gt;</p>');
    });

    it('should generate editor HTML', () => {
      const editor = textElement.renderEditor({ content: 'Test content' });
      expect(editor).toContain('textarea');
      expect(editor).toContain('Test content');
    });

    it('should treat empty content as validation error', () => {
      const error = textElement.validate({ content: '' });
      expect(error).toBe('Text content cannot be empty');

      const error2 = textElement.validate({ content: '   ' });
      expect(error2).toBe('Text content cannot be empty');
    });

    it('should pass validation for valid content', () => {
      const error = textElement.validate({ content: 'Valid content' });
      expect(error).toBeNull();
    });
  });

  describe('createImageElement', () => {
    let imageElement: ElementType;

    beforeEach(() => {
      imageElement = ElementTypesHelper.createImageElement();
    });

    it('should have correct basic properties', () => {
      expect(imageElement.name).toBe('Image');
      expect(imageElement.icon).toBe('🖼');
      expect(imageElement.defaultProps.src).toContain('typescript.svg');
      expect(imageElement.defaultProps.alt).toBe('Sample image');
    });

    it('should render basic IMG tag', () => {
      const props = { src: 'test.jpg', alt: 'Test image', width: '', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test image">');
    });

    it('should render IMG tag with style when width and height specified', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '200' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test" style="width: 300px; height: 200px">');
    });

    it('should render IMG tag with style when only width specified', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test" style="width: 300px">');
    });

    it('should perform HTML escaping', () => {
      const props = { src: 'test"evil.jpg', alt: 'Test"evil', width: '', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test"evil.jpg" alt="Test"evil">'); // Double quotes are not escaped
    });

    it('should generate editor HTML', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '200' };
      const editor = imageElement.renderEditor(props);
      expect(editor).toContain('type="url"');
      expect(editor).toContain('value="test.jpg"');
      expect(editor).toContain('value="Test"');
      expect(editor).toContain('value="300"');
      expect(editor).toContain('value="200"');
    });

    it('should treat empty src as validation error', () => {
      const error = imageElement.validate({ src: '', alt: 'Test' });
      expect(error).toBe('Image URL is required');

      const error2 = imageElement.validate({ src: '   ', alt: 'Test' });
      expect(error2).toBe('Image URL is required');
    });

    it('should treat invalid URL as validation error', () => {
      const error = imageElement.validate({ src: 'not-a-url', alt: 'Test' });
      expect(error).toBe('Please enter a valid URL');
    });

    it('should pass validation for valid URL', () => {
      const error = imageElement.validate({ src: 'https://example.com/image.jpg', alt: 'Test' });
      expect(error).toBeNull();
    });
  });

  describe('createListElement', () => {
    let listElement: ElementType;

    beforeEach(() => {
      listElement = ElementTypesHelper.createListElement();
    });

    it('should have correct basic properties', () => {
      expect(listElement.name).toBe('List');
      expect(listElement.icon).toBe('•');
      expect(listElement.defaultProps).toEqual({
        items: ['Item 1', 'Item 2', 'Item 3'],
        ordered: false
      });
    });

    it('should render unordered list', () => {
      const props = { items: ['Item 1', 'Item 2'], ordered: false };
      const html = listElement.render(props);
      expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    it('should render ordered list', () => {
      const props = { items: ['First', 'Second'], ordered: true };
      const html = listElement.render(props);
      expect(html).toBe('<ol><li>First</li><li>Second</li></ol>');
    });

    it('should perform HTML escaping', () => {
      const props = { items: ['<script>alert("xss")</script>'], ordered: false };
      const html = listElement.render(props);
      expect(html).toBe('<ul><li>&lt;script&gt;alert("xss")&lt;/script&gt;</li></ul>');
    });

    it('should generate editor HTML', () => {
      const props = { items: ['Item 1', 'Item 2'], ordered: false };
      const editor = listElement.renderEditor(props);
      expect(editor).toContain('type="checkbox"');
      expect(editor).toContain('Item 1');
      expect(editor).toContain('Item 2');
      expect(editor).toContain('+ Add Item');
    });

    it('should have checked checkbox in ordered list editor', () => {
      const props = { items: ['Item 1'], ordered: true };
      const editor = listElement.renderEditor(props);
      expect(editor).toContain('checked');
    });

    it('should treat empty array as validation error', () => {
      const error = listElement.validate({ items: [], ordered: false });
      expect(error).toBe('List must have at least one item');
    });

    it('should treat empty items as validation error', () => {
      const error = listElement.validate({ items: ['Item 1', '', 'Item 3'], ordered: false });
      expect(error).toBe('List items cannot be empty');

      const error2 = listElement.validate({ items: ['Item 1', '   ', 'Item 3'], ordered: false });
      expect(error2).toBe('List items cannot be empty');
    });

    it('should pass validation for valid list', () => {
      const error = listElement.validate({ items: ['Item 1', 'Item 2'], ordered: false });
      expect(error).toBeNull();
    });
  });

  describe('getAllElementTypes', () => {
    it('should return all element types', () => {
      const elementTypes = ElementTypesHelper.getAllElementTypes();
      expect(Object.keys(elementTypes)).toEqual(['title', 'text', 'image', 'list']);
      expect(elementTypes.title.name).toBe('Title');
      expect(elementTypes.text.name).toBe('Text');
      expect(elementTypes.image.name).toBe('Image');
      expect(elementTypes.list.name).toBe('List');
    });

    it('should have correct interface for each element type', () => {
      const elementTypes = ElementTypesHelper.getAllElementTypes();
      Object.values(elementTypes).forEach(elementType => {
        expect(elementType).toHaveProperty('name');
        expect(elementType).toHaveProperty('icon');
        expect(elementType).toHaveProperty('defaultProps');
        expect(elementType).toHaveProperty('render');
        expect(elementType).toHaveProperty('renderEditor');
        expect(elementType).toHaveProperty('validate');
        expect(typeof elementType.render).toBe('function');
        expect(typeof elementType.renderEditor).toBe('function');
        expect(typeof elementType.validate).toBe('function');
      });
    });
  });

  describe('registerElementType', () => {
    it('should add new element type', () => {
      const existingTypes = { title: ElementTypesHelper.createTitleElement() };
      const newType: ElementType = {
        name: 'Custom',
        icon: 'C',
        defaultProps: { value: 'test' },
        render: (props) => `<div>${props.value}</div>`,
        renderEditor: () => '<input>',
        validate: () => null
      };

      const result = ElementTypesHelper.registerElementType(existingTypes, 'custom', newType);
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('custom');
      expect(result.custom).toBe(newType);
      expect(Object.keys(result)).toEqual(['title', 'custom']);
    });

    it('should not overwrite existing element types (returns new object)', () => {
      const existingTypes = { title: ElementTypesHelper.createTitleElement() };
      const newType: ElementType = {
        name: 'Custom',
        icon: 'C',
        defaultProps: {},
        render: () => '',
        renderEditor: () => '',
        validate: () => null
      };

      const result = ElementTypesHelper.registerElementType(existingTypes, 'custom', newType);
      
      expect(result).not.toBe(existingTypes);
      expect(existingTypes).not.toHaveProperty('custom');
    });

    it('should overwrite element type with same name', () => {
      const originalTitle = ElementTypesHelper.createTitleElement();
      const existingTypes = { title: originalTitle };
      const newType: ElementType = {
        name: 'NewTitle',
        icon: 'NT',
        defaultProps: {},
        render: () => '',
        renderEditor: () => '',
        validate: () => null
      };

      const result = ElementTypesHelper.registerElementType(existingTypes, 'title', newType);
      
      expect(result.title).toBe(newType);
      expect(result.title).not.toBe(originalTitle);
    });
  });
});