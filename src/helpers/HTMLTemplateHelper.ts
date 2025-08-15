/**
 * HTML template management helper
 * Manages generation of complete HTML documents and head element customization
 */

export interface MetaElement {
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;
  [key: string]: string | undefined;
}

export interface LinkElement {
  rel?: string;
  href?: string;
  type?: string;
  media?: string;
  [key: string]: string | undefined;
}

export interface ScriptElement {
  src?: string;
  content?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface HeadConfig {
  title?: string;
  meta?: MetaElement[];
  links?: LinkElement[];
  scripts?: ScriptElement[];
  customHead?: string;
}

export interface HTMLTemplate {
  doctype?: string;
  htmlAttributes?: Record<string, string>;
  head?: HeadConfig;
  bodyAttributes?: Record<string, string>;
}

export const HTMLTemplateHelper = {
  /**
   * Get default HTML template
   */
  getDefaultTemplate(): HTMLTemplate {
    return {
      doctype: '<!DOCTYPE html>',
      htmlAttributes: {
        lang: 'en'
      },
      head: {
        title: 'Generated HTML',
        meta: [
          { charset: 'UTF-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
        ],
        links: [],
        scripts: [],
        customHead: ''
      },
      bodyAttributes: {}
    };
  },

  /**
   * Validate HTML template
   * @param template Template to validate
   * @returns Error message (null if valid)
   */
  validateTemplate(template: HTMLTemplate): string | null {
    // Validate doctype
    if (template.doctype && !template.doctype.toLowerCase().includes('doctype')) {
      return 'Invalid doctype format';
    }

    // Validate head.title
    if (template.head?.title && template.head.title.length > 200) {
      return 'Title is too long (max 200 characters)';
    }

    // Validate meta tags
    if (template.head?.meta) {
      for (const meta of template.head.meta) {
        if (!meta.charset && !meta.name && !meta.property && !meta.httpEquiv) {
          return 'Meta element must have at least one of: charset, name, property, or http-equiv';
        }
      }
    }

    // Validate link tags
    if (template.head?.links) {
      for (const link of template.head.links) {
        if (!link.rel) {
          return 'Link element must have rel attribute';
        }
        if (link.rel === 'stylesheet' && !link.href) {
          return 'Stylesheet link must have href attribute';
        }
      }
    }

    return null;
  },

  /**
   * Build head element HTML
   * @param headConfig Head element configuration
   */
  buildHeadSection(headConfig: HeadConfig): string {
    const parts: string[] = [];

    // Title element
    if (headConfig.title) {
      parts.push(`  <title>${this.escapeHtml(headConfig.title)}</title>`);
    }

    // Meta elements
    if (headConfig.meta && headConfig.meta.length > 0) {
      headConfig.meta.forEach(meta => {
        const attributes = this.buildAttributes(meta as Record<string, string | number | boolean>);
        parts.push(`  <meta${attributes}>`);
      });
    }

    // Link elements
    if (headConfig.links && headConfig.links.length > 0) {
      headConfig.links.forEach(link => {
        const attributes = this.buildAttributes(link as Record<string, string | number | boolean>);
        parts.push(`  <link${attributes}>`);
      });
    }

    // Script elements
    if (headConfig.scripts && headConfig.scripts.length > 0) {
      headConfig.scripts.forEach(script => {
        if (script.content) {
          // Inline script
          const scriptAttrs: Record<string, string | number | boolean> = {};
          if (script.type) scriptAttrs.type = script.type;
          if (script.async) scriptAttrs.async = script.async;
          if (script.defer) scriptAttrs.defer = script.defer;
          
          const attributes = this.buildAttributes(scriptAttrs);
          parts.push(`  <script${attributes}>`);
          parts.push(`    ${script.content}`);
          parts.push(`  </script>`);
        } else if (script.src) {
          // External script
          const attributes = this.buildAttributes(script as Record<string, string | number | boolean>);
          parts.push(`  <script${attributes}></script>`);
        }
      });
    }

    // Custom head elements
    if (headConfig.customHead) {
      const customLines = headConfig.customHead
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `  ${line}`);
      parts.push(...customLines);
    }

    return parts.join('\n');
  },

  /**
   * Generate complete HTML document
   * @param bodyContent Body element content
   * @param template HTML template settings
   */
  generateFullHTML(bodyContent: string, template: HTMLTemplate = {}): string {
    // Merge with default template
    const defaultTemplate = this.getDefaultTemplate();
    const mergedTemplate: HTMLTemplate = {
      doctype: template.doctype || defaultTemplate.doctype,
      htmlAttributes: { ...defaultTemplate.htmlAttributes, ...template.htmlAttributes },
      head: {
        title: template.head?.title || defaultTemplate.head?.title,
        meta: template.head?.meta || defaultTemplate.head?.meta,
        links: template.head?.links || defaultTemplate.head?.links,
        scripts: template.head?.scripts || defaultTemplate.head?.scripts,
        customHead: template.head?.customHead || defaultTemplate.head?.customHead
      },
      bodyAttributes: { ...defaultTemplate.bodyAttributes, ...template.bodyAttributes }
    };

    // Template validation
    const validationError = this.validateTemplate(mergedTemplate);
    if (validationError) {
      // Development warning - will be removed in production build
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        console.warn(`HTMLTemplate validation warning: ${validationError}`);
      }
    }

    // Build HTML element attributes
    const htmlAttributes = this.buildAttributes(mergedTemplate.htmlAttributes || {});
    const bodyAttributes = this.buildAttributes(mergedTemplate.bodyAttributes || {});

    // Build head element
    const headContent = this.buildHeadSection(mergedTemplate.head || {});

    // Build complete HTML
    const html = [
      mergedTemplate.doctype,
      `<html${htmlAttributes}>`,
      '<head>',
      headContent,
      '</head>',
      `<body${bodyAttributes}>`,
      bodyContent,
      '</body>',
      '</html>'
    ].join('\n');

    return html;
  },

  /**
   * Update template (merge with existing settings)
   * @param currentTemplate Current template
   * @param updates Settings to update
   */
  updateTemplate(currentTemplate: HTMLTemplate, updates: Partial<HTMLTemplate>): HTMLTemplate {
    return {
      ...currentTemplate,
      ...updates,
      htmlAttributes: {
        ...currentTemplate.htmlAttributes,
        ...updates.htmlAttributes
      },
      head: {
        ...currentTemplate.head,
        ...updates.head,
        meta: updates.head?.meta || currentTemplate.head?.meta,
        links: updates.head?.links || currentTemplate.head?.links,
        scripts: updates.head?.scripts || currentTemplate.head?.scripts
      },
      bodyAttributes: {
        ...currentTemplate.bodyAttributes,
        ...updates.bodyAttributes
      }
    };
  },

  /**
   * Build HTML attribute string from attribute object
   * @param attributes Attribute object
   */
  buildAttributes(attributes: Record<string, string | number | boolean>): string {
    const attrs = Object.entries(attributes)
      .filter(([, value]) => value !== undefined && value !== null && value !== false)
      .map(([key, value]) => {
        if (value === true) {
          return key; // Boolean attribute
        }
        return `${key}="${this.escapeHtml(String(value))}"`; 
      });

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
  },

  /**
   * HTML escape processing
   * @param text Text to escape
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};