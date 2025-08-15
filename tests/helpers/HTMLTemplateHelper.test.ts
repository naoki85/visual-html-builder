import { describe, it, expect, vi } from 'vitest';
import {
  HTMLTemplateHelper,
  type HTMLTemplate,
  type HeadConfig,
} from '@helpers/HTMLTemplateHelper';

describe('HTMLTemplateHelper', () => {
  describe('getDefaultTemplate', () => {
    it('should return default template', () => {
      const template = HTMLTemplateHelper.getDefaultTemplate();

      expect(template.doctype).toBe('<!DOCTYPE html>');
      expect(template.htmlAttributes).toEqual({ lang: 'en' });
      expect(template.head?.title).toBe('Generated HTML');
      expect(template.head?.meta).toHaveLength(2);
      expect(template.head?.meta?.[0]).toEqual({ charset: 'UTF-8' });
      expect(template.head?.meta?.[1]).toEqual({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      });
      expect(template.bodyAttributes).toEqual({});
    });

    it('should return a new object (different reference)', () => {
      const template1 = HTMLTemplateHelper.getDefaultTemplate();
      const template2 = HTMLTemplateHelper.getDefaultTemplate();

      expect(template1).not.toBe(template2);
      expect(template1.head).not.toBe(template2.head);
    });
  });

  describe('validateTemplate', () => {
    it('should return null for valid template', () => {
      const template = HTMLTemplateHelper.getDefaultTemplate();
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });

    it('should return error for invalid doctype', () => {
      const template: HTMLTemplate = { doctype: 'invalid' }; // Doesn't contain 'doctype'
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Invalid doctype format');
    });

    it('should return error for too long title', () => {
      const longTitle = 'a'.repeat(201);
      const template: HTMLTemplate = { head: { title: longTitle } };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Title is too long (max 200 characters)');
    });

    it('should return error for invalid meta element', () => {
      const template: HTMLTemplate = {
        head: { meta: [{ content: 'value' }] }, // All charset, name, property, httpEquiv are unset
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe(
        'Meta element must have at least one of: charset, name, property, or http-equiv'
      );
    });

    it('should pass valid meta elements', () => {
      const template: HTMLTemplate = {
        head: {
          meta: [
            { charset: 'UTF-8' },
            { name: 'description', content: 'test' },
            { property: 'og:title', content: 'test' },
            { httpEquiv: 'refresh', content: '30' },
          ],
        },
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });

    it('should return error for link element without rel attribute', () => {
      const template: HTMLTemplate = {
        head: { links: [{ href: 'style.css' }] }, // No rel attribute
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Link element must have rel attribute');
    });

    it('should return error for stylesheet link without href attribute', () => {
      const template: HTMLTemplate = {
        head: { links: [{ rel: 'stylesheet' }] }, // No href attribute
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBe('Stylesheet link must have href attribute');
    });

    it('should pass valid link elements', () => {
      const template: HTMLTemplate = {
        head: {
          links: [
            { rel: 'stylesheet', href: 'style.css' },
            { rel: 'icon', href: 'favicon.ico' },
          ],
        },
      };
      const result = HTMLTemplateHelper.validateTemplate(template);
      expect(result).toBeNull();
    });
  });

  describe('buildHeadSection', () => {
    it('should build basic head elements', () => {
      const headConfig: HeadConfig = {
        title: 'Test Title',
        meta: [{ charset: 'UTF-8' }],
        links: [{ rel: 'stylesheet', href: 'style.css' }],
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);

      expect(result).toContain('<title>Test Title</title>');
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<link rel="stylesheet" href="style.css">');
    });

    it('should build inline script', () => {
      const headConfig: HeadConfig = {
        scripts: [
          {
            content: 'console.log("test");',
            type: 'text/javascript',
          },
        ],
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);

      expect(result).toContain('<script type="text/javascript">');
      expect(result).toContain('console.log("test");');
      expect(result).toContain('</script>');
    });

    it('should build external script', () => {
      const headConfig: HeadConfig = {
        scripts: [
          {
            src: 'script.js',
            async: true,
            defer: true,
          },
        ],
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);

      expect(result).toContain('<script src="script.js" async defer></script>');
    });

    it('should build custom head elements', () => {
      const headConfig: HeadConfig = {
        customHead: '<link rel="preload" href="font.woff2">\n<style>body { margin: 0; }</style>',
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);

      expect(result).toContain('<link rel="preload" href="font.woff2">');
      expect(result).toContain('<style>body { margin: 0; }</style>');
    });

    it('should work correctly with empty headConfig', () => {
      const result = HTMLTemplateHelper.buildHeadSection({});
      expect(result).toBe('');
    });

    it('should apply HTML escaping', () => {
      const headConfig: HeadConfig = {
        title: '<script>alert("xss")</script>',
        meta: [{ name: 'description', content: '<img src=x onerror=alert(1)>' }],
      };

      const result = HTMLTemplateHelper.buildHeadSection(headConfig);

      expect(result).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(result).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('generateFullHTML', () => {
    it('should generate basic HTML document', () => {
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

    it('should generate HTML with custom template', () => {
      const bodyContent = '<p>Test content</p>';
      const template: HTMLTemplate = {
        doctype: '<!DOCTYPE html>',
        htmlAttributes: { lang: 'ja', dir: 'ltr' },
        head: {
          title: 'Custom Title',
          meta: [{ name: 'description', content: 'Custom description' }],
        },
        bodyAttributes: { class: 'custom-body' },
      };

      const result = HTMLTemplateHelper.generateFullHTML(bodyContent, template);

      expect(result).toContain('<html lang="ja" dir="ltr">');
      expect(result).toContain('<title>Custom Title</title>');
      expect(result).toContain('<meta name="description" content="Custom description">');
      expect(result).toContain('<body class="custom-body">');
    });

    it('should merge partial template with defaults', () => {
      const bodyContent = '<div>Content</div>';
      const template: HTMLTemplate = {
        head: { title: 'Partial Title' },
        // Other properties are unspecified
      };

      const result = HTMLTemplateHelper.generateFullHTML(bodyContent, template);

      // Custom title is used
      expect(result).toContain('<title>Partial Title</title>');
      // Default meta elements remain
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<meta name="viewport"');
    });

    it('should continue HTML generation even with warnings', () => {
      const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Simulate DEV mode
      (globalThis as any).__DEV__ = true;

      const template: HTMLTemplate = {
        head: { title: 'a'.repeat(201) }, // Too long title
      };

      const result = HTMLTemplateHelper.generateFullHTML('<div>Test</div>', template);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<div>Test</div>');

      // Cleanup
      delete (globalThis as any).__DEV__;
      mockConsoleWarn.mockRestore();
    });
  });

  describe('updateTemplate', () => {
    it('should update template', () => {
      const currentTemplate: HTMLTemplate = {
        doctype: '<!DOCTYPE html>',
        htmlAttributes: { lang: 'en' },
        head: { title: 'Original Title' },
        bodyAttributes: { class: 'original' },
      };

      const updates: Partial<HTMLTemplate> = {
        head: { title: 'Updated Title' },
        bodyAttributes: { class: 'updated', id: 'main' },
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, updates);

      expect(result.head?.title).toBe('Updated Title');
      expect(result.bodyAttributes).toEqual({ class: 'updated', id: 'main' });
      expect(result.htmlAttributes).toEqual({ lang: 'en' }); // Unchanged
      expect(result.doctype).toBe('<!DOCTYPE html>'); // Unchanged
    });

    it('should return new object (does not modify original)', () => {
      const currentTemplate: HTMLTemplate = {
        head: { title: 'Original' },
      };

      const updates: Partial<HTMLTemplate> = {
        head: { title: 'Updated' },
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, updates);

      expect(result).not.toBe(currentTemplate);
      expect(currentTemplate.head?.title).toBe('Original'); // Original object is not modified
      expect(result.head?.title).toBe('Updated');
    });

    it('should work correctly with empty updates', () => {
      const currentTemplate: HTMLTemplate = {
        head: { title: 'Test' },
      };

      const result = HTMLTemplateHelper.updateTemplate(currentTemplate, {});

      expect(result.head?.title).toBe('Test');
      expect(result).not.toBe(currentTemplate); // New object
    });
  });

  describe('buildAttributes', () => {
    it('should build basic attribute string', () => {
      const attributes = { lang: 'en', class: 'test', id: 'main' };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' lang="en" class="test" id="main"');
    });

    it('should handle boolean attributes correctly', () => {
      const attributes = { disabled: true, hidden: false, async: true };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' disabled async');
    });

    it('should convert numeric attributes to strings', () => {
      const attributes = { tabindex: 0, colspan: 2 };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' tabindex="0" colspan="2"');
    });

    it('should exclude undefined, null, false values', () => {
      const attributes = {
        lang: 'en',
        class: undefined,
        id: null,
        hidden: false,
        'data-test': 'value',
      };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' lang="en" data-test="value"');
    });

    it('should return empty string for empty object', () => {
      const result = HTMLTemplateHelper.buildAttributes({});
      expect(result).toBe('');
    });

    it('should apply HTML escaping', () => {
      const attributes = { title: 'Hello "World" & <Test>' };
      const result = HTMLTemplateHelper.buildAttributes(attributes);
      expect(result).toBe(' title="Hello "World" &amp; &lt;Test&gt;"'); // Double quotes are not escaped
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS") & test</script>';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert("XSS") &amp; test&lt;/script&gt;');
    });

    it('should escape quote characters', () => {
      const input = 'He said "Hello" & \'Goodbye\'';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe('He said "Hello" &amp; \'Goodbye\'');
    });

    it('should handle empty strings', () => {
      const result = HTMLTemplateHelper.escapeHtml('');
      expect(result).toBe('');
    });

    it('should return normal text unchanged', () => {
      const input = 'Hello World 123';
      const result = HTMLTemplateHelper.escapeHtml(input);
      expect(result).toBe(input);
    });
  });
});
