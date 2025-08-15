import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationHelper, type NotificationType } from '@helpers/NotificationHelper';

describe('NotificationHelper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create container before each test
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up container and notifications after each test
    NotificationHelper.removeAll();
    container.remove();
    
    // Remove added notification styles as well
    const styleElement = document.getElementById('html-gui-editor-notification-styles');
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('getDefaultOptions', () => {
    it('should return default notification options', () => {
      const options = NotificationHelper.getDefaultOptions();
      
      expect(options.type).toBe('success');
      expect(options.duration).toBe(3000);
      expect(options.position).toBe('top-right');
      expect(options.className).toBe('editor-notification');
      expect(options.container).toBe(document.body);
    });

    it('should return a new object (different reference)', () => {
      const options1 = NotificationHelper.getDefaultOptions();
      const options2 = NotificationHelper.getDefaultOptions();
      
      expect(options1).not.toBe(options2);
    });
  });

  describe('getNotificationClass', () => {
    it('should return class name for success type', () => {
      const className = NotificationHelper.getNotificationClass('success');
      expect(className).toBe('editor-notification editor-notification--success');
    });

    it('should return class name for error type', () => {
      const className = NotificationHelper.getNotificationClass('error');
      expect(className).toBe('editor-notification editor-notification--error');
    });

    it('should return class name for warning type', () => {
      const className = NotificationHelper.getNotificationClass('warning');
      expect(className).toBe('editor-notification editor-notification--warning');
    });

    it('should return class name for info type', () => {
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
      it(`should return position class name for ${position}`, () => {
        const className = NotificationHelper.getPositionClass(position);
        expect(className).toBe(`editor-notification--${position}`);
      });
    });
  });

  describe('createNotificationElement', () => {
    it('should create basic notification element', () => {
      const options = NotificationHelper.getDefaultOptions();
      const element = NotificationHelper.createNotificationElement('Test message', options);

      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('Test message');
      expect(element.className).toContain('editor-notification');
      expect(element.className).toContain('editor-notification--success');
      expect(element.className).toContain('editor-notification--top-right');
    });

    it('should create notification element with different type', () => {
      const options = { ...NotificationHelper.getDefaultOptions(), type: 'error' as NotificationType };
      const element = NotificationHelper.createNotificationElement('Error message', options);

      expect(element.className).toContain('editor-notification--error');
    });

    it('should add custom class name', () => {
      const options = { 
        ...NotificationHelper.getDefaultOptions(), 
        className: 'custom-notification'
      };
      const element = NotificationHelper.createNotificationElement('Test', options);

      expect(element.className).toContain('custom-notification');
    });

    it('should set accessibility attributes', () => {
      const options = NotificationHelper.getDefaultOptions();
      const element = NotificationHelper.createNotificationElement('Test', options);

      expect(element.getAttribute('role')).toBe('alert');
      expect(element.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('show', () => {
    it('should display basic notification', () => {
      const notification = NotificationHelper.show('Test message', { container });

      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild).toBe(notification);
      expect(notification.textContent).toBe('Test message');
    });

    it('should display notification with custom options', () => {
      const notification = NotificationHelper.show('Custom message', {
        container,
        type: 'warning',
        position: 'bottom-left',
        duration: 1000
      });

      expect(notification.className).toContain('editor-notification--warning');
      expect(notification.className).toContain('editor-notification--bottom-left');
    });

    it('should not auto-remove when duration is 0', () => {
      vi.useFakeTimers();
      
      NotificationHelper.show('Persistent message', {
        container,
        duration: 0
      });

      expect(container.children).toHaveLength(1);
      
      // Should not be removed even after sufficient time
      vi.advanceTimersByTime(10000);
      expect(container.children).toHaveLength(1);
      
      vi.useRealTimers();
    });

    it('should be auto-removed after specified duration', () => {
      vi.useFakeTimers();
      
      NotificationHelper.show('Auto remove', {
        container,
        duration: 1000
      });

      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1000);
      
      // Fade out starts with remove()
      expect(container.children).toHaveLength(1);
      
      // Removed after fade out completion
      vi.advanceTimersByTime(300);
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showSuccess', () => {
    it('should display success notification', () => {
      const notification = NotificationHelper.showSuccess('Success!', { container });

      expect(notification.className).toContain('editor-notification--success');
      expect(notification.textContent).toBe('Success!');
    });

    it('should override type option', () => {
      const notification = NotificationHelper.showSuccess('Success!', { 
        container,
        // @ts-expect-error - type is omitted but for testing purposes
        type: 'error'
      });

      expect(notification.className).toContain('editor-notification--success');
    });
  });

  describe('showError', () => {
    it('should display error notification', () => {
      const notification = NotificationHelper.showError('Error!', { container });

      expect(notification.className).toContain('editor-notification--error');
      expect(notification.textContent).toBe('Error!');
    });

    it('should have default duration of 5000ms', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showError('Error!', { container });
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(4999);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1);
      vi.advanceTimersByTime(300); // Fade out completion
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showWarning', () => {
    it('should display warning notification', () => {
      const notification = NotificationHelper.showWarning('Warning!', { container });

      expect(notification.className).toContain('editor-notification--warning');
      expect(notification.textContent).toBe('Warning!');
    });

    it('should have default duration of 4000ms', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showWarning('Warning!', { container });
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(3999);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(1);
      vi.advanceTimersByTime(300); // Fade out completion
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('showInfo', () => {
    it('should display info notification', () => {
      const notification = NotificationHelper.showInfo('Info!', { container });

      expect(notification.className).toContain('editor-notification--info');
      expect(notification.textContent).toBe('Info!');
    });
  });

  describe('showSimple', () => {
    it('should display simple notification', () => {
      const notification = NotificationHelper.showSimple('Simple message', container);

      expect(notification.className).toBe('editor-notification');
      expect(notification.textContent).toBe('Simple message');
      expect(container.children).toHaveLength(1);
    });

    it('should use document.body when container is not specified', () => {
      const notification = NotificationHelper.showSimple('Body message');

      expect(document.body.contains(notification)).toBe(true);
      expect(notification.className).toBe('editor-notification');
    });

    it('should be auto-removed after 3 seconds', () => {
      vi.useFakeTimers();
      
      NotificationHelper.showSimple('Auto remove', container);
      expect(container.children).toHaveLength(1);
      
      vi.advanceTimersByTime(3000);
      vi.advanceTimersByTime(300); // Fade out completion
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });
  });

  describe('remove', () => {
    it('should remove notification element', () => {
      vi.useFakeTimers();
      
      const notification = NotificationHelper.show('Test', { container, duration: 0 });
      expect(container.children).toHaveLength(1);

      NotificationHelper.remove(notification);
      
      // Fade out effect is applied
      expect(notification.style.opacity).toBe('0');
      expect(notification.style.transform).toBe('translateX(100%)');
      
      // Removed after 300ms
      vi.advanceTimersByTime(300);
      expect(container.children).toHaveLength(0);
      
      vi.useRealTimers();
    });

    it('should do nothing when parent element does not exist', () => {
      const orphanElement = document.createElement('div');
      
      // Verify that no error is thrown
      expect(() => {
        NotificationHelper.remove(orphanElement);
      }).not.toThrow();
    });
  });

  describe('removeAll', () => {
    it('should remove all notifications', () => {
      NotificationHelper.show('Message 1', { container, duration: 0 });
      NotificationHelper.show('Message 2', { container, duration: 0 });
      NotificationHelper.showSimple('Message 3', container);

      expect(container.children).toHaveLength(3);

      NotificationHelper.removeAll(container);

      // All removal processes start (fading out)
      expect(container.children).toHaveLength(3);
      Array.from(container.children).forEach(child => {
        expect((child as HTMLElement).style.opacity).toBe('0');
      });
    });

    it('should remove notifications in document.body when container is not specified', () => {
      NotificationHelper.showSimple('Body message 1');
      NotificationHelper.showSimple('Body message 2');

      const bodyNotifications = document.body.querySelectorAll('.editor-notification');
      expect(bodyNotifications.length).toBeGreaterThanOrEqual(2);

      NotificationHelper.removeAll();

      // Removal process starts
      const updatedNotifications = document.body.querySelectorAll('.editor-notification');
      Array.from(updatedNotifications).forEach(notification => {
        expect((notification as HTMLElement).style.opacity).toBe('0');
      });
    });
  });

  describe('injectNotificationStyles', () => {
    it('should add notification styles', () => {
      NotificationHelper.injectNotificationStyles();

      const styleElement = document.getElementById('html-gui-editor-notification-styles');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
      expect(styleElement?.textContent).toContain('.editor-notification');
    });

    it('should not add duplicate styles when styles already exist', () => {
      NotificationHelper.injectNotificationStyles();
      NotificationHelper.injectNotificationStyles();

      const styleElements = document.querySelectorAll('#html-gui-editor-notification-styles');
      expect(styleElements.length).toBe(1);
    });

    it('should include necessary classes in added styles', () => {
      NotificationHelper.injectNotificationStyles();

      const styleElement = document.getElementById('html-gui-editor-notification-styles');
      const styles = styleElement?.textContent || '';

      // Base class
      expect(styles).toContain('.editor-notification');
      
      // Position classes
      expect(styles).toContain('.editor-notification--top-right');
      expect(styles).toContain('.editor-notification--bottom-center');
      
      // Type classes
      expect(styles).toContain('.editor-notification--success');
      expect(styles).toContain('.editor-notification--error');
      expect(styles).toContain('.editor-notification--warning');
      expect(styles).toContain('.editor-notification--info');
      
      // Animation
      expect(styles).toContain('@keyframes slideIn');
    });
  });
});