/**
 * HTML GUI Editor用のドラッグ&ドロップヘルパー
 * 要素の並び替え機能を管理する
 */

export interface DragDropCallbacks {
  onDragStart?: (elementId: number) => void;
  onDragEnd?: () => void;
  onDrop?: (newOrder: number[]) => void;
  updatePreview?: () => void;
}

export interface DragDropOptions {
  containerSelector: string;
  draggableSelector: string;
  draggedClass?: string;
  elementIdAttribute?: string;
}

export const DragDropHelper = {
  /**
   * デフォルトオプション
   */
  getDefaultOptions(): Required<DragDropOptions> {
    return {
      containerSelector: '.preview-area',
      draggableSelector: '.preview-element',
      draggedClass: 'dragging',
      elementIdAttribute: 'data-element-id',
    };
  },

  /**
   * ドラッグ対象要素の後に挿入すべき要素を取得
   * @param container ドロップエリアのコンテナ
   * @param y マウスのY座標
   * @param options ドラッグ&ドロップオプション
   */
  getDragAfterElement(
    container: HTMLElement,
    y: number,
    options: Partial<DragDropOptions> = {}
  ): Element | null {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    const draggableElements = [
      ...container.querySelectorAll(
        `${finalOptions.draggableSelector}:not(.${finalOptions.draggedClass})`
      ),
    ];

    return draggableElements.reduce(
      (closest: any, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  },

  /**
   * ドロップ処理を実行
   * @param container コンテナ要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  handleDrop(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): number[] {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    const previewElements = [...container.querySelectorAll(finalOptions.draggableSelector)];
    const newOrder = previewElements.map(el => {
      const elementId = el.getAttribute(finalOptions.elementIdAttribute);
      return parseInt(elementId || '0');
    });

    // コールバックを実行
    if (callbacks.onDrop) {
      callbacks.onDrop(newOrder);
    }

    if (callbacks.updatePreview) {
      callbacks.updatePreview();
    }

    return newOrder;
  },

  /**
   * 要素にドラッグ開始イベントリスナーを追加
   * @param element 対象要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  addDragStartListener(
    element: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    element.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      target.classList.add(finalOptions.draggedClass);

      const elementId = parseInt(target.getAttribute(finalOptions.elementIdAttribute) || '0');

      if (callbacks.onDragStart) {
        callbacks.onDragStart(elementId);
      }

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    });
  },

  /**
   * 要素にドラッグ終了イベントリスナーを追加
   * @param element 対象要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  addDragEndListener(
    element: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    element.addEventListener('dragend', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove(finalOptions.draggedClass);

      if (callbacks.onDragEnd) {
        callbacks.onDragEnd();
      }
    });
  },

  /**
   * コンテナにドラッグオーバーイベントリスナーを追加
   * @param container コンテナ要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  addDragOverListener(
    container: HTMLElement,
    _callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    container.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      const afterElement = this.getDragAfterElement(container, e.clientY, options);
      const draggedEl = container.querySelector(`.${finalOptions.draggedClass}`);

      if (draggedEl) {
        if (afterElement == null) {
          container.appendChild(draggedEl);
        } else {
          container.insertBefore(draggedEl, afterElement);
        }
      }
    });
  },

  /**
   * コンテナにドロップイベントリスナーを追加
   * @param container コンテナ要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  addDropListener(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      this.handleDrop(container, callbacks, options);
    });
  },

  /**
   * 要素群にドラッグ機能を一括設定
   * @param elements ドラッグ可能な要素の配列
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  setupDraggableElements(
    elements: HTMLElement[],
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    elements.forEach(element => {
      element.setAttribute('draggable', 'true');
      this.addDragStartListener(element, callbacks, options);
      this.addDragEndListener(element, callbacks, options);
    });
  },

  /**
   * ドロップエリアを設定
   * @param container ドロップエリアのコンテナ
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  setupDropZone(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    this.addDragOverListener(container, callbacks, options);
    this.addDropListener(container, callbacks, options);
  },

  /**
   * 完全なドラッグ&ドロップ機能を設定
   * @param container コンテナ要素
   * @param callbacks コールバック関数
   * @param options ドラッグ&ドロップオプション
   */
  setupDragAndDrop(
    container: HTMLElement,
    callbacks: DragDropCallbacks,
    options: Partial<DragDropOptions> = {}
  ): void {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    // ドロップエリアを設定
    this.setupDropZone(container, callbacks, options);

    // 既存のドラッグ可能要素を設定
    const elements = [
      ...container.querySelectorAll(finalOptions.draggableSelector),
    ] as HTMLElement[];
    this.setupDraggableElements(elements, callbacks, options);
  },

  /**
   * ドラッグ&ドロップの視覚的フィードバック用CSSを追加
   */
  injectDragDropStyles(): void {
    const styleId = 'html-gui-editor-dragdrop-styles';

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .preview-element.dragging {
        opacity: 0.7;
        transform: scale(0.98);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .preview-area.drag-over {
        background: rgba(0, 123, 255, 0.05);
        border: 2px dashed var(--primary-color, #007bff);
      }

      .preview-element.drag-target {
        border-top: 3px solid var(--primary-color, #007bff);
      }

      .preview-element[draggable="true"] {
        cursor: grab;
      }

      .preview-element[draggable="true"]:active {
        cursor: grabbing;
      }
    `;

    document.head.appendChild(style);
  },
};
