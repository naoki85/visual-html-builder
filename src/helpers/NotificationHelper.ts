/**
 * Visual HTML Builder用の通知ヘルパー
 * 様々なタイプの通知を管理する
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  className?: string;
  container?: HTMLElement;
}

export const NotificationHelper = {
  /**
   * デフォルトの通知設定
   */
  getDefaultOptions(): Required<NotificationOptions> {
    return {
      type: 'success',
      duration: 3000,
      position: 'top-right',
      className: 'editor-notification',
      container: document.body,
    };
  },

  /**
   * 通知タイプに応じたCSSクラス名を取得
   */
  getNotificationClass(type: NotificationType): string {
    const baseClass = 'editor-notification';
    return `${baseClass} ${baseClass}--${type}`;
  },

  /**
   * 位置に応じたCSSクラス名を取得
   */
  getPositionClass(position: NonNullable<NotificationOptions['position']>): string {
    return `editor-notification--${position}`;
  },

  /**
   * 通知要素を作成
   */
  createNotificationElement(message: string, options: Required<NotificationOptions>): HTMLElement {
    const notification = document.createElement('div');

    // CSSクラスを設定
    const classes = [
      this.getNotificationClass(options.type),
      this.getPositionClass(options.position),
    ];

    if (options.className && options.className !== 'editor-notification') {
      classes.push(options.className);
    }

    notification.className = classes.join(' ');
    notification.textContent = message;

    // アクセシビリティ属性
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    return notification;
  },

  /**
   * 基本的な通知を表示
   */
  show(message: string, options: NotificationOptions = {}): HTMLElement {
    const finalOptions = { ...this.getDefaultOptions(), ...options };
    const notification = this.createNotificationElement(message, finalOptions);

    // 通知を表示
    finalOptions.container.appendChild(notification);

    // 指定時間後に自動削除
    if (finalOptions.duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, finalOptions.duration);
    }

    return notification;
  },

  /**
   * 成功通知を表示
   */
  showSuccess(message: string, options: Omit<NotificationOptions, 'type'> = {}): HTMLElement {
    return this.show(message, { ...options, type: 'success' });
  },

  /**
   * エラー通知を表示
   */
  showError(message: string, options: Omit<NotificationOptions, 'type'> = {}): HTMLElement {
    return this.show(message, { ...options, type: 'error', duration: 5000 });
  },

  /**
   * 警告通知を表示
   */
  showWarning(message: string, options: Omit<NotificationOptions, 'type'> = {}): HTMLElement {
    return this.show(message, { ...options, type: 'warning', duration: 4000 });
  },

  /**
   * 情報通知を表示
   */
  showInfo(message: string, options: Omit<NotificationOptions, 'type'> = {}): HTMLElement {
    return this.show(message, { ...options, type: 'info' });
  },

  /**
   * VisualHtmlBuilder互換のシンプル通知（後方互換性）
   */
  showSimple(message: string, container?: HTMLElement): HTMLElement {
    const notification = document.createElement('div');
    notification.className = 'editor-notification';
    notification.textContent = message;

    const targetContainer = container || document.body;
    targetContainer.appendChild(notification);

    setTimeout(() => {
      this.remove(notification);
    }, 3000);

    return notification;
  },

  /**
   * 通知を削除
   */
  remove(notification: HTMLElement): void {
    if (notification && notification.parentNode) {
      // フェードアウトアニメーション
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';

      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  },

  /**
   * 全ての通知を削除
   */
  removeAll(container?: HTMLElement): void {
    const targetContainer = container || document.body;
    const notifications = targetContainer.querySelectorAll(
      '.editor-notification, [class*="editor-notification"]'
    );

    notifications.forEach(notification => {
      this.remove(notification as HTMLElement);
    });
  },

  /**
   * 通知スタイルを動的に追加（StylesHelperに含まれていない場合の補完）
   */
  injectNotificationStyles(): void {
    const styleId = 'html-gui-editor-notification-styles';

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .editor-notification {
        position: fixed;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        word-wrap: break-word;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      /* Position variants */
      .editor-notification--top-right {
        top: 20px;
        right: 20px;
      }

      .editor-notification--top-left {
        top: 20px;
        left: 20px;
      }

      .editor-notification--bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .editor-notification--bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .editor-notification--top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .editor-notification--bottom-center {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      /* Type variants */
      .editor-notification--success {
        background: var(--success-color, #28a745);
        color: white;
      }

      .editor-notification--error {
        background: var(--error-color, #dc3545);
        color: white;
      }

      .editor-notification--warning {
        background: var(--warning-color, #ffc107);
        color: #212529;
      }

      .editor-notification--info {
        background: var(--info-color, #17a2b8);
        color: white;
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
    `;

    document.head.appendChild(style);
  },
};
