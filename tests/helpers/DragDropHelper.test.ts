import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DragDropHelper, type DragDropOptions, type DragDropCallbacks } from '@helpers/DragDropHelper';

describe('DragDropHelper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // テスト用のコンテナとドラッグ可能要素を作成
    container = document.createElement('div');
    container.className = 'preview-area';
    
    // テスト用の要素を3つ作成
    for (let i = 1; i <= 3; i++) {
      const element = document.createElement('div');
      element.className = 'preview-element';
      element.setAttribute('data-element-id', i.toString());
      element.textContent = `Element ${i}`;
      element.style.height = '50px';
      element.style.margin = '10px 0';
      container.appendChild(element);
    }
    
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('getDefaultOptions', () => {
    it('デフォルトオプションを返す', () => {
      const options = DragDropHelper.getDefaultOptions();
      
      expect(options.containerSelector).toBe('.preview-area');
      expect(options.draggableSelector).toBe('.preview-element');
      expect(options.draggedClass).toBe('dragging');
      expect(options.elementIdAttribute).toBe('data-element-id');
    });

    it('新しいオブジェクトを返す（参照が異なる）', () => {
      const options1 = DragDropHelper.getDefaultOptions();
      const options2 = DragDropHelper.getDefaultOptions();
      
      expect(options1).not.toBe(options2);
    });
  });

  describe('getDragAfterElement', () => {
    beforeEach(() => {
      // getBoundingClientRectをモック
      const elements = container.querySelectorAll('.preview-element');
      elements.forEach((element, index) => {
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
          top: index * 70, // 50px height + 20px margin
          height: 50,
          bottom: (index * 70) + 50,
          left: 0,
          right: 100,
          width: 100,
          x: 0,
          y: index * 70,
          toJSON: () => ({})
        } as DOMRect);
      });
    });

    it('最初の要素の上部にドロップする場合はnullを返す', () => {
      const result = DragDropHelper.getDragAfterElement(container, 10);
      expect(result).toBeNull();
    });

    it('最初の要素と2番目の要素の間にドロップする場合は2番目の要素を返す', () => {
      const result = DragDropHelper.getDragAfterElement(container, 60);
      const elements = container.querySelectorAll('.preview-element');
      expect(result).toBe(elements[1]);
    });

    it('2番目と3番目の要素の間にドロップする場合は3番目の要素を返す', () => {
      const result = DragDropHelper.getDragAfterElement(container, 130);
      const elements = container.querySelectorAll('.preview-element');
      expect(result).toBe(elements[2]);
    });

    it('最後の要素の下部にドロップする場合はnullを返す', () => {
      const result = DragDropHelper.getDragAfterElement(container, 200);
      expect(result).toBeNull();
    });

    it('ドラッグ中の要素は除外される', () => {
      const elements = container.querySelectorAll('.preview-element');
      elements[1].classList.add('dragging');

      const result = DragDropHelper.getDragAfterElement(container, 60);
      expect(result).toBe(elements[2]); // dragging要素を除いて計算される
    });

    it('カスタムオプションを使用する', () => {
      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-element',
        draggedClass: 'custom-dragging'
      };

      // カスタム要素を追加
      const customElement = document.createElement('div');
      customElement.className = 'custom-element';
      vi.spyOn(customElement, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        height: 50,
        bottom: 50,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      } as DOMRect);
      container.appendChild(customElement);

      const result = DragDropHelper.getDragAfterElement(container, 40, customOptions);
      expect(result).toBe(customElement);
    });
  });

  describe('handleDrop', () => {
    let mockCallbacks: DragDropCallbacks;

    beforeEach(() => {
      mockCallbacks = {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDrop: vi.fn(),
        updatePreview: vi.fn()
      };
    });

    it('要素の順序を返す', () => {
      const result = DragDropHelper.handleDrop(container, mockCallbacks);
      
      expect(result).toEqual(['1', '2', '3']); // data-element-id の値
    });

    it('onDropコールバックが呼ばれる', () => {
      const result = DragDropHelper.handleDrop(container, mockCallbacks);
      
      expect(mockCallbacks.onDrop).toHaveBeenCalledWith(result);
    });

    it('updatePreviewコールバックが呼ばれる', () => {
      DragDropHelper.handleDrop(container, mockCallbacks);
      
      expect(mockCallbacks.updatePreview).toHaveBeenCalled();
    });

    it('カスタムオプションで動作する', () => {
      // カスタム属性を持つ要素を作成
      const customContainer = document.createElement('div');
      const element1 = document.createElement('div');
      element1.className = 'custom-item';
      element1.setAttribute('data-custom-id', 'A');
      const element2 = document.createElement('div');
      element2.className = 'custom-item';
      element2.setAttribute('data-custom-id', 'B');
      
      customContainer.appendChild(element1);
      customContainer.appendChild(element2);
      document.body.appendChild(customContainer);

      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-item',
        elementIdAttribute: 'data-custom-id'
      };

      const result = DragDropHelper.handleDrop(customContainer, mockCallbacks, customOptions);
      
      expect(result).toEqual(['A', 'B']);
      
      customContainer.remove();
    });

    it('コールバックが未定義でもエラーにならない', () => {
      const emptyCallbacks: DragDropCallbacks = {};
      
      expect(() => {
        DragDropHelper.handleDrop(container, emptyCallbacks);
      }).not.toThrow();
    });
  });

  describe('enableDragAndDrop', () => {
    let mockCallbacks: DragDropCallbacks;

    beforeEach(() => {
      mockCallbacks = {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDrop: vi.fn(),
        updatePreview: vi.fn()
      };
    });

    it('ドラッグ可能要素にdraggable属性を設定する', () => {
      DragDropHelper.enableDragAndDrop(container, mockCallbacks);
      
      const elements = container.querySelectorAll('.preview-element');
      elements.forEach(element => {
        expect(element.getAttribute('draggable')).toBe('true');
      });
    });

    it('ドラッグイベントリスナーが設定される', () => {
      const element = container.querySelector('.preview-element') as HTMLElement;
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
      
      DragDropHelper.enableDragAndDrop(container, mockCallbacks);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragstart', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragend', expect.any(Function));
    });

    it('コンテナにドロップイベントリスナーが設定される', () => {
      const addEventListenerSpy = vi.spyOn(container, 'addEventListener');
      
      DragDropHelper.enableDragAndDrop(container, mockCallbacks);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));
    });

    it('カスタムオプションで動作する', () => {
      // カスタム要素を作成
      const customElement = document.createElement('div');
      customElement.className = 'custom-draggable';
      container.appendChild(customElement);

      const customOptions: Partial<DragDropOptions> = {
        draggableSelector: '.custom-draggable'
      };

      DragDropHelper.enableDragAndDrop(container, mockCallbacks, customOptions);
      
      expect(customElement.getAttribute('draggable')).toBe('true');
    });

    afterEach(() => {
      // イベントリスナーをクリーンアップ
      const elements = container.querySelectorAll('.preview-element');
      elements.forEach(element => {
        element.removeAttribute('draggable');
      });
    });
  });
});