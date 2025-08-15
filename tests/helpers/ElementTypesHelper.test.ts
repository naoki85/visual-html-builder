import { describe, it, expect, beforeEach } from 'vitest';
import { ElementTypesHelper, type ElementType } from '@helpers/ElementTypesHelper';

describe('ElementTypesHelper', () => {
  describe('createTitleElement', () => {
    let titleElement: ElementType;

    beforeEach(() => {
      titleElement = ElementTypesHelper.createTitleElement();
    });

    it('正しい基本プロパティを持つ', () => {
      expect(titleElement.name).toBe('Title');
      expect(titleElement.icon).toBe('H');
      expect(titleElement.defaultProps).toEqual({ text: 'New Title', level: 1 });
    });

    it('H1タグをレンダリングする', () => {
      const html = titleElement.render({ text: 'Test Title', level: 1 });
      expect(html).toBe('<h1>Test Title</h1>');
    });

    it('異なるレベルのヘッダータグをレンダリングする', () => {
      const h3 = titleElement.render({ text: 'H3 Title', level: 3 });
      expect(h3).toBe('<h3>H3 Title</h3>');
    });

    it('HTMLエスケープを行う', () => {
      const html = titleElement.render({ text: '<script>alert("xss")</script>', level: 2 });
      expect(html).toBe('<h2>&lt;script&gt;alert("xss")&lt;/script&gt;</h2>');
    });

    it('エディターHTMLを生成する', () => {
      const editor = titleElement.renderEditor({ text: 'Test', level: 2 });
      expect(editor).toContain('input type="text"');
      expect(editor).toContain('value="Test"');
      expect(editor).toContain('select');
      expect(editor).toContain('option value="2" selected');
    });

    it('空のタイトルをバリデーションエラーとする', () => {
      const error = titleElement.validate({ text: '', level: 1 });
      expect(error).toBe('Title cannot be empty');

      const error2 = titleElement.validate({ text: '   ', level: 1 });
      expect(error2).toBe('Title cannot be empty');
    });

    it('有効なタイトルはバリデーションを通す', () => {
      const error = titleElement.validate({ text: 'Valid Title', level: 1 });
      expect(error).toBeNull();
    });
  });

  describe('createTextElement', () => {
    let textElement: ElementType;

    beforeEach(() => {
      textElement = ElementTypesHelper.createTextElement();
    });

    it('正しい基本プロパティを持つ', () => {
      expect(textElement.name).toBe('Text');
      expect(textElement.icon).toBe('T');
      expect(textElement.defaultProps).toEqual({ content: 'Enter your text here...' });
    });

    it('パラグラフタグをレンダリングする', () => {
      const html = textElement.render({ content: 'Test content' });
      expect(html).toBe('<p>Test content</p>');
    });

    it('改行をBRタグに変換する', () => {
      const html = textElement.render({ content: 'Line 1\nLine 2\nLine 3' });
      expect(html).toBe('<p>Line 1<br>Line 2<br>Line 3</p>');
    });

    it('HTMLエスケープを行う', () => {
      const html = textElement.render({ content: '<div>Test</div>' });
      expect(html).toBe('<p>&lt;div&gt;Test&lt;/div&gt;</p>');
    });

    it('エディターHTMLを生成する', () => {
      const editor = textElement.renderEditor({ content: 'Test content' });
      expect(editor).toContain('textarea');
      expect(editor).toContain('Test content');
    });

    it('空のコンテンツをバリデーションエラーとする', () => {
      const error = textElement.validate({ content: '' });
      expect(error).toBe('Text content cannot be empty');

      const error2 = textElement.validate({ content: '   ' });
      expect(error2).toBe('Text content cannot be empty');
    });

    it('有効なコンテンツはバリデーションを通す', () => {
      const error = textElement.validate({ content: 'Valid content' });
      expect(error).toBeNull();
    });
  });

  describe('createImageElement', () => {
    let imageElement: ElementType;

    beforeEach(() => {
      imageElement = ElementTypesHelper.createImageElement();
    });

    it('正しい基本プロパティを持つ', () => {
      expect(imageElement.name).toBe('Image');
      expect(imageElement.icon).toBe('🖼');
      expect(imageElement.defaultProps.src).toContain('placeholder');
      expect(imageElement.defaultProps.alt).toBe('Sample image');
    });

    it('基本的なIMGタグをレンダリングする', () => {
      const props = { src: 'test.jpg', alt: 'Test image', width: '', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test image">');
    });

    it('幅と高さ指定でスタイル付きIMGタグをレンダリングする', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '200' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test" style="width: 300px; height: 200px">');
    });

    it('幅のみ指定でスタイル付きIMGタグをレンダリングする', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test.jpg" alt="Test" style="width: 300px">');
    });

    it('HTMLエスケープを行う', () => {
      const props = { src: 'test"evil.jpg', alt: 'Test"evil', width: '', height: '' };
      const html = imageElement.render(props);
      expect(html).toBe('<img src="test"evil.jpg" alt="Test"evil">'); // ダブルクォートはエスケープされない
    });

    it('エディターHTMLを生成する', () => {
      const props = { src: 'test.jpg', alt: 'Test', width: '300', height: '200' };
      const editor = imageElement.renderEditor(props);
      expect(editor).toContain('type="url"');
      expect(editor).toContain('value="test.jpg"');
      expect(editor).toContain('value="Test"');
      expect(editor).toContain('value="300"');
      expect(editor).toContain('value="200"');
    });

    it('空のsrcをバリデーションエラーとする', () => {
      const error = imageElement.validate({ src: '', alt: 'Test' });
      expect(error).toBe('Image URL is required');

      const error2 = imageElement.validate({ src: '   ', alt: 'Test' });
      expect(error2).toBe('Image URL is required');
    });

    it('無効なURLをバリデーションエラーとする', () => {
      const error = imageElement.validate({ src: 'not-a-url', alt: 'Test' });
      expect(error).toBe('Please enter a valid URL');
    });

    it('有効なURLはバリデーションを通す', () => {
      const error = imageElement.validate({ src: 'https://example.com/image.jpg', alt: 'Test' });
      expect(error).toBeNull();
    });
  });

  describe('createListElement', () => {
    let listElement: ElementType;

    beforeEach(() => {
      listElement = ElementTypesHelper.createListElement();
    });

    it('正しい基本プロパティを持つ', () => {
      expect(listElement.name).toBe('List');
      expect(listElement.icon).toBe('•');
      expect(listElement.defaultProps).toEqual({
        items: ['Item 1', 'Item 2', 'Item 3'],
        ordered: false
      });
    });

    it('順序なしリストをレンダリングする', () => {
      const props = { items: ['Item 1', 'Item 2'], ordered: false };
      const html = listElement.render(props);
      expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    it('順序ありリストをレンダリングする', () => {
      const props = { items: ['First', 'Second'], ordered: true };
      const html = listElement.render(props);
      expect(html).toBe('<ol><li>First</li><li>Second</li></ol>');
    });

    it('HTMLエスケープを行う', () => {
      const props = { items: ['<script>alert("xss")</script>'], ordered: false };
      const html = listElement.render(props);
      expect(html).toBe('<ul><li>&lt;script&gt;alert("xss")&lt;/script&gt;</li></ul>');
    });

    it('エディターHTMLを生成する', () => {
      const props = { items: ['Item 1', 'Item 2'], ordered: false };
      const editor = listElement.renderEditor(props);
      expect(editor).toContain('type="checkbox"');
      expect(editor).toContain('Item 1');
      expect(editor).toContain('Item 2');
      expect(editor).toContain('+ Add Item');
    });

    it('順序ありリストのエディターでチェックボックスがチェック済み', () => {
      const props = { items: ['Item 1'], ordered: true };
      const editor = listElement.renderEditor(props);
      expect(editor).toContain('checked');
    });

    it('空の配列をバリデーションエラーとする', () => {
      const error = listElement.validate({ items: [], ordered: false });
      expect(error).toBe('List must have at least one item');
    });

    it('空の項目をバリデーションエラーとする', () => {
      const error = listElement.validate({ items: ['Item 1', '', 'Item 3'], ordered: false });
      expect(error).toBe('List items cannot be empty');

      const error2 = listElement.validate({ items: ['Item 1', '   ', 'Item 3'], ordered: false });
      expect(error2).toBe('List items cannot be empty');
    });

    it('有効なリストはバリデーションを通す', () => {
      const error = listElement.validate({ items: ['Item 1', 'Item 2'], ordered: false });
      expect(error).toBeNull();
    });
  });

  describe('getAllElementTypes', () => {
    it('全ての要素タイプを返す', () => {
      const elementTypes = ElementTypesHelper.getAllElementTypes();
      expect(Object.keys(elementTypes)).toEqual(['title', 'text', 'image', 'list']);
      expect(elementTypes.title.name).toBe('Title');
      expect(elementTypes.text.name).toBe('Text');
      expect(elementTypes.image.name).toBe('Image');
      expect(elementTypes.list.name).toBe('List');
    });

    it('各要素タイプが正しいインターフェースを持つ', () => {
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
    it('新しい要素タイプを追加する', () => {
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

    it('既存の要素タイプを上書きしない（新しいオブジェクトを返す）', () => {
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

    it('同名の要素タイプを上書きする', () => {
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