import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HTMLTemplateHelper, type HTMLTemplate, type HeadConfig, type MetaElement, type LinkElement, type ScriptElement } from '@helpers/HTMLTemplateHelper';

describe('HTMLTemplateHelper', () => {
  describe('getDefaultTemplate', () => {
    it('デフォルトテンプレートを返す', () => {
      const template = HTMLTemplateHelper.getDefaultTemplate();
      
      expect(template.doctype).toBe('<!DOCTYPE html>');
      expect(template.htmlAttributes).toEqual({ lang: 'en' });
      expect(template.head?.title).toBe('Generated HTML');
      expect(template.head?.meta).toHaveLength(2);
      expect(template.head?.meta?.[0]).toEqual({ charset: 'UTF-8' });
      expect(template.head?.meta?.[1]).toEqual({ 
        name: 'viewport', 
        content: 'width=device-width, initial-scale=1.0' 
      });
      expect(template.bodyAttributes).toEqual({});
    });

    it('新しいオブジェクトを返す（参照が異なる）', () => {
      const template1 = HTMLTemplateHelper.getDefaultTemplate();
      const template2 = HTMLTemplateHelper.getDefaultTemplate();
      
      expect(template1).not.toBe(template2);
      expect(template1.head).not.toBe(template2.head);
    });
  });

  describe('validateTemplate', () => {
    it('有効なテンプレートはnullを返す', () => {
      const template = HTMLTemplateHelper.getDefaultTemplate();
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });

    it('無効なdoctypeはエラーを返す', () => {
      const template: HTMLTemplate = { doctype: 'invalid' }; // 'doctype'を含まない
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Invalid doctype format');
    });

    it('長すぎるタイトルはエラーを返す', () => {
      const longTitle = 'a'.repeat(201);
      const template: HTMLTemplate = { head: { title: longTitle } };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Title is too long (max 200 characters)');
    });

    it('無効なmeta要素はエラーを返す', () => {
      const template: HTMLTemplate = {
        head: { meta: [{ content: 'value' }] } // charset, name, property, httpEquivが全て未設定
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Meta element must have at least one of: charset, name, property, or http-equiv');
    });

    it('有効なmeta要素は通す', () => {
      const template: HTMLTemplate = {
        head: { 
          meta: [
            { charset: 'UTF-8' },
            { name: 'description', content: 'test' },
            { property: 'og:title', content: 'test' },
            { httpEquiv: 'refresh', content: '30' }
          ] 
        }
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });

    it('rel属性のないlink要素はエラーを返す', () => {
      const template: HTMLTemplate = {
        head: { links: [{ href: 'style.css' }] } // rel属性なし
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Link element must have rel attribute');
    });

    it('href属性のないstylesheetリンクはエラーを返す', () => {
      const template: HTMLTemplate = {
        head: { links: [{ rel: 'stylesheet' }] } // href属性なし
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Stylesheet link must have href attribute');
    });

    it('有効なlink要素は通す', () => {
      const template: HTMLTemplate = {
        head: { 
          links: [
            { rel: 'stylesheet', href: 'style.css' },
            { rel: 'icon', href: 'favicon.ico' }
          ] 
        }
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });
  });

  describe('buildHeadSection', () => {
    it('基本的なhead要素を構築する', () => {
      const headConfig: HeadConfig = {
        title: 'Test Title',
        meta: [{ charset: 'UTF-8' }],
        links: [{ rel: 'stylesheet', href: 'style.css' }]
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);
      
      expect(result).toContain('<title>Test Title</title>');
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<link rel="stylesheet" href="style.css">');
    });

    it('インラインスクリプトを構築する', () => {
      const headConfig: HeadConfig = {
        scripts: [{
          content: 'console.log("test");',
          type: 'text/javascript'
        }]
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);
      
      expect(result).toContain('<script type="text/javascript">');
      expect(result).toContain('console.log("test");');
      expect(result).toContain('</script>');
    });

    it('外部スクリプトを構築する', () => {
      const headConfig: HeadConfig = {
        scripts: [{
          src: 'script.js',
          async: true,
          defer: true
        }]
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);
      
      expect(result).toContain('<script src="script.js" async defer></script>');
    });

    it('カスタムhead要素を構築する', () => {
      const headConfig: HeadConfig = {
        customHead: '<link rel="preload" href="font.woff2">\n<style>body { margin: 0; }</style>'
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);
      
      expect(result).toContain('<link rel="preload" href="font.woff2">');
      expect(result).toContain('<style>body { margin: 0; }</style>');
    });

    it('空のheadConfigでも正常に動作する', () => {
      const result = HTMLTemplateHelper.buildHeadSection({});
      expect(result).toBe('');
    });

    it('HTMLエスケープを適用する', () => {
      const headConfig: HeadConfig = {
        title: '<script>alert("xss")</script>',
        meta: [{ name: 'description', content: '<img src=x onerror=alert(1)>' }]
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);
      
      expect(result).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(result).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('generateFullHTML', () => {
    it('基本的なHTMLドキュメントを生成する', () => {
      const bodyContent = '<h1>Hello World</h1>';
      const result = HTMLTemplateHelper.generateFullHTML(bodyContent);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="en">');
      expect(result).toContain('<head>');
      expect(result).toContain('<title>Generated HTML</title>');
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<body>');
      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('</body>');
      expect(result).toContain('</html>');
    });

    it('カスタムテンプレートでHTMLを生成する', () => {
      const bodyContent = '<p>Test content</p>';
      const template: HTMLTemplate = {
        doctype: '<!DOCTYPE html>',
        htmlAttributes: { lang: 'ja', dir: 'ltr' },
        head: {
          title: 'Custom Title',
          meta: [{ name: 'description', content: 'Custom description' }]
        },
        bodyAttributes: { class: 'custom-body' }
      };

      const result = HTMLTemplateHelper.generateFullHTML(bodyContent, template);

      expect(result).toContain('<html lang="ja" dir="ltr">');
      expect(result).toContain('<title>Custom Title</title>');
      expect(result).toContain('<meta name="description" content="Custom description">');
      expect(result).toContain('<body class="custom-body">');
    });

    it('部分的なテンプレートをデフォルトとマージする', () => {
      const bodyContent = '<div>Content</div>';
      const template: HTMLTemplate = {
        head: { title: 'Partial Title' }
        // 他のプロパティは未指定
      };

      const result = HTMLTemplateHelper.generateFullHTML(bodyContent, template);

      // カスタムタイトルが使用される
      expect(result).toContain('<title>Partial Title</title>');
      // デフォルトのmeta要素が残る
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<meta name="viewport"');
    });

    it('警告を出力してもHTML生成は継続する', () => {
      const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // DEVモードをシミュレート
      (globalThis as any).__DEV__ = true;
      
      const template: HTMLTemplate = {
        head: { title: 'a'.repeat(201) } // 長すぎるタイトル
      };

      const result = HTMLTemplateHelper.generateFullHTML('<div>Test</div>', template);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<div>Test</div>');
      
      // クリーンアップ
      delete (globalThis as any).__DEV__;
      mockConsoleWarn.mockRestore();
    });
  });

  describe('updateTemplate', () => {
    it('テンプレートを更新する', () => {
      const currentTemplate: HTMLTemplate = {
        doctype: '<!DOCTYPE html>',
        htmlAttributes: { lang: 'en' },
        head: { title: 'Original Title' },
        bodyAttributes: { class: 'original' }
      };

      const updates: Partial<HTMLTemplate> = {
        head: { title: 'Updated Title' },
        bodyAttributes: { class: 'updated', id: 'main' }
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, updates);

      expect(result.head?.title).toBe('Updated Title');
      expect(result.bodyAttributes).toEqual({ class: 'updated', id: 'main' });
      expect(result.htmlAttributes).toEqual({ lang: 'en' }); // 変更されていない
      expect(result.doctype).toBe('<!DOCTYPE html>'); // 変更されていない
    });

    it('新しいオブジェクトを返す（元のオブジェクトを変更しない）', () => {
      const currentTemplate: HTMLTemplate = {
        head: { title: 'Original' }
      };

      const updates: Partial<HTMLTemplate> = {
        head: { title: 'Updated' }
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, updates);

      expect(result).not.toBe(currentTemplate);
      expect(currentTemplate.head?.title).toBe('Original'); // 元のオブジェクトは変更されない
      expect(result.head?.title).toBe('Updated');
    });

    it('空の更新でも正常に動作する', () => {
      const currentTemplate: HTMLTemplate = {
        head: { title: 'Test' }
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, {});

      expect(result.head?.title).toBe('Test');
      expect(result).not.toBe(currentTemplate); // 新しいオブジェクト
    });
  });

  describe('buildAttributes', () => {
    it('基本的な属性文字列を構築する', () => {
      const attributes = { lang: 'en', class: 'test', id: 'main' };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' lang="en" class="test" id="main"');
    });

    it('boolean属性を正しく処理する', () => {
      const attributes = { disabled: true, hidden: false, async: true };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' disabled async');
    });

    it('数値属性を文字列に変換する', () => {
      const attributes = { tabindex: 0, colspan: 2 };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' tabindex="0" colspan="2"');
    });

    it('undefined、null、falseの値を除外する', () => {
      const attributes = { 
        lang: 'en', 
        class: undefined, 
        id: null, 
        hidden: false,
        'data-test': 'value'
      };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' lang="en" data-test="value"');
    });

    it('空のオブジェクトで空文字列を返す', () => {
      const result = HTMLTemplateHelper.buildAttributes({});
      expect(result).toBe('');
    });

    it('HTMLエスケープを適用する', () => {
      const attributes = { title: 'Hello "World" & <Test>' };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' title="Hello "World" &amp; &lt;Test&gt;"'); // ダブルクォートはエスケープされない
    });
  });

  describe('escapeHtml', () => {
    it('HTMLの特殊文字をエスケープする', () => {
      const input = '<script>alert("XSS") & test</script>';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert("XSS") &amp; test&lt;/script&gt;');
    });

    it('クォート文字をエスケープする', () => {
      const input = 'He said "Hello" & \'Goodbye\'';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe('He said "Hello" &amp; \'Goodbye\'');
    });

    it('空文字列を処理する', () => {
      const result = HTMLTemplateHelper.escapeHtml('');
      expect(result).toBe('');
    });

    it('通常のテキストはそのまま返す', () => {
      const input = 'Hello World 123';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe(input);
    });
  });
});