/**
 * Utility helper functions for HTML GUI Editor
 */
export const UtilityHelpers = {
  /**
   * Escape HTML special characters
   * @param text The string to escape
   * @returns The escaped string
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Check if a string is a valid URL format
   * @param string The string to check
   * @returns True if the string is a valid URL
   */
  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },
};
