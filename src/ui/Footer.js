/**
 * Vexorion — Footer Component
 * src/ui/Footer.js
 */

export class Footer {
  /**
   * @param {string} [text]
   */
  constructor(text) {
    this.text = text || 'Vexorion Deterministic Cryptographic Primitives • Tested directly in browser environment without external runtime dependencies.';
  }

  /**
   * Renders the footer DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const footer = document.createElement('footer');
    footer.id = 'app-footer';
    footer.innerHTML = `<span>${this.text}</span>`;
    return footer;
  }
}
