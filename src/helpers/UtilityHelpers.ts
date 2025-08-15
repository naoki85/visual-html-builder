/**
 * HTML GUI Editor用のユーティリティヘルパー関数集
 */
export const UtilityHelpers = {
  /**
   * HTMLエスケープ処理
   * @param text エスケープする文字列
   * @returns エスケープされた文字列
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * URL形式の妥当性をチェック
   * @param string チェックする文字列
   * @returns 有効なURLの場合true
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
