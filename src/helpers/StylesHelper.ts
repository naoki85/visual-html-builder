/**
 * HTML GUI Editor用のスタイルヘルパー
 * エディターのCSSスタイルを管理する
 */
export const StylesHelper = {
  /**
   * エディターのスタイルIDを取得
   */
  getStyleId(): string {
    return 'html-gui-editor-styles';
  },

  /**
   * エディターのスタイルが既に注入されているかチェック
   */
  isStylesInjected(): boolean {
    return !!document.getElementById(this.getStyleId());
  },

  /**
   * エディターのメインCSSスタイルを取得
   */
  getEditorStyles(): string {
    return `
      .html-gui-editor {
        display: grid;
        grid-template-columns: 250px 1fr 300px;
        height: 600px;
        border: 1px solid var(--editor-border-color, #ddd);
        border-radius: 8px;
        overflow: hidden;
        font-family: var(--editor-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        background: var(--editor-bg, #fff);
      }

      .editor-sidebar {
        background: var(--sidebar-bg, #f8f9fa);
        border-right: 1px solid var(--editor-border-color, #ddd);
        padding: 20px;
        overflow-y: auto;
      }

      .editor-sidebar h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: var(--text-color, #333);
      }

      .element-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .element-button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--button-border, #ddd);
        border-radius: 6px;
        background: var(--button-bg, #fff);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .element-button:hover {
        background: var(--button-hover-bg, #f0f0f0);
        border-color: var(--button-hover-border, #ccc);
        transform: translateY(-1px);
      }

      .element-icon {
        font-size: 18px;
        min-width: 20px;
        text-align: center;
      }

      .editor-main {
        display: flex;
        flex-direction: column;
        background: var(--main-bg, #fff);
      }

      .editor-tabs {
        display: flex;
        align-items: center;
        padding: 0 20px;
        border-bottom: 1px solid var(--editor-border-color, #ddd);
        background: var(--tabs-bg, #f8f9fa);
        gap: 10px;
      }

      .tab-button {
        padding: 10px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-size: 14px;
        color: var(--text-color, #666);
        transition: all 0.2s;
      }

      .tab-button:hover {
        color: var(--primary-color, #007bff);
      }

      .tab-button.active {
        color: var(--primary-color, #007bff);
        border-bottom-color: var(--primary-color, #007bff);
      }

      .copy-html-button {
        margin-left: auto;
        padding: 8px 12px;
        border: 1px solid var(--primary-color, #007bff);
        border-radius: 4px;
        background: var(--primary-color, #007bff);
        color: white;
        cursor: pointer;
        font-size: 12px;
      }

      .copy-html-button:hover {
        background: var(--primary-hover, #0056b3);
        transform: translateY(-1px);
      }

      .tab-content {
        flex: 1;
        overflow: hidden;
      }

      .tab-panel {
        display: none;
        height: 100%;
        overflow: auto;
      }

      .tab-panel.active {
        display: block;
      }

      .preview-area {
        padding: 20px;
        min-height: 100%;
      }

      .empty-state {
        text-align: center;
        color: var(--text-muted, #999);
        font-style: italic;
        padding: 40px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        margin: 20px;
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
        border-color: var(--hover-border, #007bff);
        background: rgba(0, 123, 255, 0.02);
      }

      .preview-element.selected {
        border-color: var(--primary-color, #007bff);
        background: rgba(0, 123, 255, 0.05);
      }

      .preview-element.has-error {
        border-color: var(--error-color, #dc3545);
        background: rgba(220, 53, 69, 0.05);
      }

      .preview-element.dragging {
        opacity: 0.5;
        transform: rotate(3deg);
      }

      .element-controls {
        display: none;
        position: absolute;
        top: -35px;
        right: 0;
        background: var(--primary-color, #007bff);
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

      .html-tab-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px 10px 20px;
        border-bottom: 1px solid var(--editor-border-color, #ddd);
        background: var(--tabs-bg, #f8f9fa);
      }

      .html-mode-button {
        padding: 6px 12px;
        border: 1px solid var(--button-border, #ddd);
        border-radius: 4px;
        background: var(--button-bg, #fff);
        cursor: pointer;
        font-size: 12px;
        color: var(--text-color, #666);
        transition: all 0.2s;
      }

      .html-mode-button:hover {
        background: var(--button-hover-bg, #f0f0f0);
        border-color: var(--button-hover-border, #ccc);
      }

      .html-mode-button.active {
        background: var(--primary-color, #007bff);
        color: white;
        border-color: var(--primary-color, #007bff);
      }

      .copy-current-html-button {
        margin-left: auto;
        padding: 6px 10px;
        border: 1px solid var(--success-color, #28a745);
        border-radius: 4px;
        background: var(--success-color, #28a745);
        color: white;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
      }

      .copy-current-html-button:hover {
        background: #218838;
        transform: translateY(-1px);
      }

      .html-output {
        width: 100%;
        height: calc(100% - 60px);
        border: none;
        padding: 20px;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 14px;
        resize: none;
        background: var(--code-bg, #f8f9fa);
        line-height: 1.5;
      }

      .editor-properties {
        background: var(--sidebar-bg, #f8f9fa);
        border-left: 1px solid var(--editor-border-color, #ddd);
        padding: 20px;
        overflow-y: auto;
      }

      .editor-properties h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: var(--text-color, #333);
      }

      .no-selection {
        color: var(--text-muted, #999);
        font-style: italic;
        text-align: center;
        padding: 20px;
      }

      .properties-header h4 {
        margin: 0 0 10px 0;
        color: var(--text-color, #333);
      }

      .property-group {
        margin-bottom: 15px;
      }

      .property-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color, #333);
      }

      .property-group input,
      .property-group select,
      .property-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--input-border, #ddd);
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .property-group input:focus,
      .property-group select:focus,
      .property-group textarea:focus {
        outline: none;
        border-color: var(--primary-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
      }

      .list-editor {
        border: 1px solid var(--input-border, #ddd);
        border-radius: 4px;
        padding: 10px;
        background: white;
      }

      .list-item-editor {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
      }

      .list-item-editor input {
        flex: 1;
        margin: 0;
      }

      .list-item-editor button {
        background: var(--error-color, #dc3545);
        color: white;
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: background 0.2s;
      }

      .list-item-editor button:hover {
        background: #c82333;
      }

      .list-editor button[onclick*="addListItem"] {
        background: var(--success-color, #28a745);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 8px;
        transition: background 0.2s;
      }

      .list-editor button[onclick*="addListItem"]:hover {
        background: #218838;
      }

      .validation-error {
        color: var(--error-color, #dc3545);
        font-size: 12px;
        margin-top: 5px;
        font-weight: 500;
      }

      .editor-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color, #28a745);
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Responsive design */
      @media (max-width: 1024px) {
        .html-gui-editor {
          grid-template-columns: 200px 1fr 250px;
        }
      }

      @media (max-width: 768px) {
        .html-gui-editor {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto 1fr;
          height: auto;
          min-height: 600px;
        }
        
        .editor-sidebar,
        .editor-properties {
          border: none;
          border-bottom: 1px solid var(--editor-border-color, #ddd);
        }
        
        .element-buttons {
          flex-direction: row;
          flex-wrap: wrap;
        }
        
        .element-button {
          flex: 1;
          min-width: 120px;
        }
      }

      /* Enhanced hover effects */
      .element-button:active {
        transform: translateY(0);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      }

      /* Drag and drop visual feedback */
      .preview-area.drag-over {
        background: rgba(0, 123, 255, 0.05);
      }

      .preview-element.drag-target {
        border-top: 3px solid var(--primary-color, #007bff);
      }

      /* Iframe preview styles */
      .preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 4px;
        background: white;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
        display: block;
      }

      .preview-area:has(.preview-iframe) {
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      
      /* Ensure iframe takes full height in flex container */
      .preview-area .preview-iframe {
        flex: 1;
        min-height: 0;
      }
      
      /* Fallback for browsers that don't support :has() */
      .preview-area.iframe-mode {
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      
      .preview-area.iframe-mode .preview-iframe {
        flex: 1;
        min-height: 0;
      }

      /* Loading state for iframe */
      .preview-area.iframe-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        color: #666;
      }

      .preview-area.iframe-loading::after {
        content: 'Loading preview...';
        font-style: italic;
      }
    `;
  },

  /**
   * エディターのスタイルをDOMに注入
   */
  injectEditorStyles(): void {
    if (this.isStylesInjected()) {
      return;
    }

    const style = document.createElement('style');
    style.id = this.getStyleId();
    style.textContent = this.getEditorStyles();

    document.head.appendChild(style);
  },

  /**
   * エディターのスタイルをDOMから削除
   */
  removeEditorStyles(): void {
    const existingStyle = document.getElementById(this.getStyleId());
    if (existingStyle) {
      existingStyle.remove();
    }
  },

  /**
   * カスタムCSSスタイルを追加
   * @param customStyles 追加するCSSスタイル
   * @param id スタイル要素のID（デフォルト: 'html-gui-editor-custom-styles'）
   */
  injectCustomStyles(customStyles: string, id: string = 'html-gui-editor-custom-styles'): void {
    // 既存のカスタムスタイルを削除
    const existingCustomStyle = document.getElementById(id);
    if (existingCustomStyle) {
      existingCustomStyle.remove();
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = customStyles;

    document.head.appendChild(style);
  },
};
