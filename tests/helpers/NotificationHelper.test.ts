import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationHelper, type NotificationOptions, type NotificationType } from '@helpers/NotificationHelper';

describe('NotificationHelper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // 各テスト前にコンテナを作成
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 各テスト後にコンテナと通知をクリーンアップ
    NotificationHelper.removeAll();
    container.remove();
    
    // 追加された通知スタイルも削除
    const styleElement = document.getElementById('html-gui-editor-notification-styles');
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('getDefaultOptions', () => {
    it('デフォルトの通知設定を返す', () => {
      const options = NotificationHelper.getDefaultOptions();
      
      expect(options.type).toBe('success');
      expect(options.duration).toBe(3000);
      expect(options.position).toBe('top-right');
      expect(options.className).toBe('editor-notification');
      expect(options.container).toBe(document.body);
    });

    it('新しいオブジェクトを返す（参照が異なる）', () => {
      const options1 = NotificationHelper.getDefaultOptions();
      const options2 = NotificationHelper.getDefaultOptions();
      
      expect(options1).not.toBe(options2);
    });
  });

  describe('getNotificationClass', () => {
    it('success タイプのクラス名を返す', () => {
      const className = NotificationHelper.getNotificationClass('success');
      expect(className).toBe('editor-notification editor-notification--success');
    });

    it('error タイプのクラス名を返す', () => {
      const className = NotificationHelper.getNotificationClass('error');
      expect(className).toBe('editor-notification editor-notification--error');
    });

    it('warning タイプのクラス名を返す', () => {
      const className = NotificationHelper.getNotificationClass('warning');
      expect(className).toBe('editor-notification editor-notification--warning');
    });

    it('info タイプのクラス名を返す', () => {
      const className = NotificationHelper.getNotificationClass('info');
      expect(className).toBe('editor-notification editor-notification--info');
    });
  });

  describe('getPositionClass', () => {
    const positions = [
      'top-right',
      'top-left', 
      'bottom-right',
      'bottom-left',
      'top-center',
      'bottom-center'
    ] as const;

    positions.forEach(position => {
      it(`${position} の位置クラス名を返す`, () => {
        const className = NotificationHelper.getPositionClass(position);
        expect(className).toBe(`editor-notification--${position}`);
      });
    });
  });

  describe('createNotificationElement', () => {
    it('基本的な通知要素を作成する', () => {
      const options = NotificationHelper.getDefaultOptions();
      const element = NotificationHelper.createNotificationElement('Test message', options);

      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('Test message');
      expect(element.className).toContain('editor-notification');
      expect(element.className).toContain('editor-notification--success');
      expect(element.className).toContain('editor-notification--top-right');
    });

    it('異なるタイプで通知要素を作成する', () => {
      const options = { ...NotificationHelper.getDefaultOptions(), type: 'error' as NotificationType };
      const element = NotificationHelper.createNotificationElement('Error message', options);

      expect(element.className).toContain('editor-notification--error');
    });

    it('カスタムクラス名を追加する', () => {
      const options = { 
        ...NotificationHelper.getDefaultOptions(), 
        className: 'custom-notification'
      };
      const element = NotificationHelper.createNotificationElement('Test', options);

      expect(element.className).toContain('custom-notification');
    });

    it('アクセシビリティ属性を設定する', () => {
      const options = NotificationHelper.getDefaultOptions();
      const element = NotificationHelper.createNotificationElement('Test', options);

      expect(element.getAttribute('role')).toBe('alert');
      expect(element.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('show', () => {
    it('基本的な通知を表示する', () => {
      const notification = NotificationHelper.show('Test message', { container });

      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild).toBe(notification);
      expect(notification.textContent).toBe('Test message');
    });

    it('カスタムオプションで通知を表示する', () => {
      const notification = NotificationHelper.show('Custom message', {
        container,
        type: 'warning',
        position: 'bottom-left',
        duration: 1000
      });

      expect(notification.className).toContain('editor-notification--warning');
      expect(notification.className).toContain('editor-notification--bottom-left');
    });

    it('duration が 0 の場合は自動削除しない', () => {
      vi.useFakeTimers();
      
      const notification = NotificationHelper.show('Persistent message', {
        container,
        duration: 0
      });

      expect(container.children).toHaveLength(1);
      
      // 十分な時間が経っても削除されない
      vi.advanceTimersByTime(10000);
      expect(container.children).toHaveLength(1);
      
      vi.useRealTimers();
    });

    it('指定したduration後に自動削除される', () => {
      vi.useFakeTimers();
      
      NotificationHelper.show('Auto remove', {
        container,
        duration: 1000
      });

      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1000);
      
      // remove() でフェードアウト開始
      expect(container.children).toHaveLength(1);
      
      // フェードアウト完了後に削除
      vi.advanceTimersByTime(300);
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showSuccess', () => {
    it('成功通知を表示する', () => {
      const notification = NotificationHelper.showSuccess('Success!', { container });

      expect(notification.className).toContain('editor-notification--success');
      expect(notification.textContent).toBe('Success!');
    });

    it('typeオプションは上書きされる', () => {
      const notification = NotificationHelper.showSuccess('Success!', { 
        container,
        // @ts-expect-error - type は Omit されているがテストのため
        type: 'error'
      });

      expect(notification.className).toContain('editor-notification--success');
    });
  });

  describe('showError', () => {
    it('エラー通知を表示する', () => {
      const notification = NotificationHelper.showError('Error!', { container });

      expect(notification.className).toContain('editor-notification--error');
      expect(notification.textContent).toBe('Error!');
    });

    it('デフォルトでduration は 5000ms', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showError('Error!', { container });
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(4999);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1);
      vi.advanceTimersByTime(300); // フェードアウト完了
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showWarning', () => {
    it('警告通知を表示する', () => {
      const notification = NotificationHelper.showWarning('Warning!', { container });

      expect(notification.className).toContain('editor-notification--warning');
      expect(notification.textContent).toBe('Warning!');
    });

    it('デフォルトでduration は 4000ms', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showWarning('Warning!', { container });
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(3999);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1);
      vi.advanceTimersByTime(300); // フェードアウト完了
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showInfo', () => {
    it('情報通知を表示する', () => {
      const notification = NotificationHelper.showInfo('Info!', { container });

      expect(notification.className).toContain('editor-notification--info');
      expect(notification.textContent).toBe('Info!');
    });
  });

  describe('showSimple', () => {
    it('シンプルな通知を表示する', () => {
      const notification = NotificationHelper.showSimple('Simple message', container);

      expect(notification.className).toBe('editor-notification');
      expect(notification.textContent).toBe('Simple message');
      expect(container.children).toHaveLength(1);
    });

    it('コンテナ未指定時はdocument.bodyを使用', () => {
      const notification = NotificationHelper.showSimple('Body message');

      expect(document.body.contains(notification)).toBe(true);
      expect(notification.className).toBe('editor-notification');
    });

    it('3秒後に自動削除される', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showSimple('Auto remove', container);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(3000);
      vi.advanceTimersByTime(300); // フェードアウト完了
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('remove', () => {
    it('通知要素を削除する', () => {
      vi.useFakeTimers();
      
      const notification = NotificationHelper.show('Test', { container, duration: 0 });
      expect(container.children).toHaveLength(1);

      NotificationHelper.remove(notification);
      
      // フェードアウト効果が適用される
      expect(notification.style.opacity).toBe('0');
      expect(notification.style.transform).toBe('translateX(100%)');
      
      // 300ms後に削除
      vi.advanceTimersByTime(300);
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });

    it('親要素がない場合は何もしない', () => {
      const orphanElement = document.createElement('div');
      
      // エラーを投げないことを確認
      expect(() => {
        NotificationHelper.remove(orphanElement);
      }).not.toThrow();
    });
  });

  describe('removeAll', () => {
    it('全ての通知を削除する', () => {
      NotificationHelper.show('Message 1', { container, duration: 0 });
      NotificationHelper.show('Message 2', { container, duration: 0 });
      NotificationHelper.showSimple('Message 3', container);

      expect(container.children).toHaveLength(3);

      NotificationHelper.removeAll(container);

      // 全て削除処理が開始される（フェードアウト中）
      expect(container.children).toHaveLength(3);
      Array.from(container.children).forEach(child => {
        expect((child as HTMLElement).style.opacity).toBe('0');
      });
    });

    it('コンテナ未指定時はdocument.body内の通知を削除', () => {
      NotificationHelper.showSimple('Body message 1');
      NotificationHelper.showSimple('Body message 2');

      const bodyNotifications = document.body.querySelectorAll('.editor-notification');
      expect(bodyNotifications.length).toBeGreaterThanOrEqual(2);

      NotificationHelper.removeAll();

      // 削除処理が開始される
      const updatedNotifications = document.body.querySelectorAll('.editor-notification');
      Array.from(updatedNotifications).forEach(notification => {
        expect((notification as HTMLElement).style.opacity).toBe('0');
      });
    });
  });

  describe('injectNotificationStyles', () => {
    it('通知スタイルを追加する', () => {
      NotificationHelper.injectNotificationStyles();

      const styleElement = document.getElementById('html-gui-editor-notification-styles');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
      expect(styleElement?.textContent).toContain('.editor-notification');
    });

    it('既にスタイルが存在する場合は重複追加しない', () => {
      NotificationHelper.injectNotificationStyles();
      NotificationHelper.injectNotificationStyles();

      const styleElements = document.querySelectorAll('#html-gui-editor-notification-styles');
      expect(styleElements.length).toBe(1);
    });

    it('追加されるスタイルに必要なクラスが含まれる', () => {
      NotificationHelper.injectNotificationStyles();

      const styleElement = document.getElementById('html-gui-editor-notification-styles');
      const styles = styleElement?.textContent || '';

      // 基本クラス
      expect(styles).toContain('.editor-notification');
      
      // 位置クラス
      expect(styles).toContain('.editor-notification--top-right');
      expect(styles).toContain('.editor-notification--bottom-center');
      
      // タイプクラス
      expect(styles).toContain('.editor-notification--success');
      expect(styles).toContain('.editor-notification--error');
      expect(styles).toContain('.editor-notification--warning');
      expect(styles).toContain('.editor-notification--info');
      
      // アニメーション
      expect(styles).toContain('@keyframes slideIn');
    });
  });
});