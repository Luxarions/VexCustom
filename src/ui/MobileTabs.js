/**
 * Vexorion — MobileTabs Component
 * src/ui/MobileTabs.js
 *
 * Provides a mobile segmented tab controller to switch between
 * Test Suites and Live Terminal views without vertical scrolling overload.
 */

export class MobileTabs {
  /**
   * @param {object} [callbacks]
   * @param {(activeTab: 'suites' | 'terminal') => void} [callbacks.onTabChange]
   */
  constructor(callbacks = {}) {
    this.onTabChange = callbacks.onTabChange || (() => {});
    this.activeTab = 'suites'; // 'suites' | 'terminal'
    this.element = null;
    this.suitesBtn = null;
    this.terminalBtn = null;
  }

  /**
   * Renders the mobile tab bar.
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.id = 'mobile-view-tabs';
    container.className = 'mobile-tabs-container';
    container.setAttribute('role', 'tablist');
    container.setAttribute('aria-label', 'Mobile view selector');

    container.innerHTML = `
      <button type="button" role="tab" id="mobile-tab-suites" class="mobile-tab-btn active" aria-selected="true" aria-controls="suites-column">
        <span class="mobile-tab-icon">📋</span>
        <span class="mobile-tab-label">Test Suites</span>
        <span id="mobile-suites-badge" class="mobile-tab-badge">9</span>
      </button>
      <button type="button" role="tab" id="mobile-tab-terminal" class="mobile-tab-btn" aria-selected="false" aria-controls="terminal-column">
        <span class="mobile-tab-icon">💻</span>
        <span class="mobile-tab-label">Live Console</span>
        <span id="mobile-terminal-badge" class="mobile-tab-badge dot"></span>
      </button>
    `;

    this.element = container;
    this.suitesBtn = container.querySelector('#mobile-tab-suites');
    this.terminalBtn = container.querySelector('#mobile-tab-terminal');

    this.suitesBtn.addEventListener('click', () => this.selectTab('suites'));
    this.terminalBtn.addEventListener('click', () => this.selectTab('terminal'));

    return container;
  }

  /**
   * Selects an active tab.
   * @param {'suites' | 'terminal'} tab
   */
  selectTab(tab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    if (this.suitesBtn && this.terminalBtn) {
      if (tab === 'suites') {
        this.suitesBtn.classList.add('active');
        this.suitesBtn.setAttribute('aria-selected', 'true');
        this.terminalBtn.classList.remove('active');
        this.terminalBtn.setAttribute('aria-selected', 'false');
      } else {
        this.terminalBtn.classList.add('active');
        this.terminalBtn.setAttribute('aria-selected', 'true');
        this.suitesBtn.classList.remove('active');
        this.suitesBtn.setAttribute('aria-selected', 'false');
      }
    }

    this.onTabChange(tab);
  }

  /**
   * Sets a counter or indicator badge on suites tab.
   * @param {number} count
   */
  updateSuitesBadge(count) {
    const el = this.element ? this.element.querySelector('#mobile-suites-badge') : null;
    if (el) {
      el.textContent = String(count);
    }
  }

  /**
   * Shows an active activity dot on terminal tab.
   * @param {boolean} active
   */
  setTerminalActivity(active) {
    const el = this.element ? this.element.querySelector('#mobile-terminal-badge') : null;
    if (el) {
      el.classList.toggle('pulse', active);
    }
  }
}
