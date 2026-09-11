/**
 * Vexorion — Header Component
 * src/ui/Header.js
 */

export class Header {
  /**
   * @param {object} [options]
   * @param {string} [options.title='Vexorion']
   * @param {string} [options.version='v1.0.0']
   * @param {string} [options.subtitle='Browser Unit Test Runner & Verification Suite']
   * @param {string} [options.activePage='index.html']
   */
  constructor(options = {}) {
    this.title = options.title || 'Vexorion';
    this.version = options.version || 'v1.0.0';
    this.subtitle = options.subtitle || 'Browser Unit Test Runner & Verification Suite';
    this.activePage = options.activePage || 'index.html';
  }

  /**
   * Renders the header DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const header = document.createElement('header');
    header.id = 'app-header';
    header.innerHTML = `
      <div class="header-container">
        <div class="brand">
          <div class="brand-icon">🛡️</div>
          <div>
            <div class="brand-title">
              <span>${this.title}</span>
              <span class="tag font-mono">${this.version}</span>
            </div>
            <div class="brand-subtitle">${this.subtitle}</div>
          </div>
        </div>
        <div class="header-links">
          <a href="/index.html" class="nav-link ${this.activePage === 'index.html' ? 'active' : ''}">index.html (Runner)</a>
          <a href="/UnitTest.html" class="nav-link ${this.activePage === 'UnitTest.html' ? 'active' : ''}">UnitTest.html</a>
        </div>
      </div>
    `;
    return header;
  }
}
