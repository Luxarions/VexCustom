/**
 * Vexorion — StatusBanner Component
 * src/ui/StatusBanner.js
 */

export class StatusBanner {
  /**
   * @param {object} [callbacks]
   * @param {() => void} [callbacks.onRunAll]
   * @param {() => void} [callbacks.onRunPuppeteer]
   * @param {() => void} [callbacks.onClearTerminal]
   */
  constructor(callbacks = {}) {
    this.onRunAll = callbacks.onRunAll || (() => {});
    this.onRunPuppeteer = callbacks.onRunPuppeteer || (() => {});
    this.onClearTerminal = callbacks.onClearTerminal || (() => {});
    this.element = null;
    this.badgeEl = null;
    this.summaryEl = null;
    this.runBtn = null;
    this.puppeteerBtn = null;
    this.btnText = null;
  }

  /**
   * Renders the banner DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const banner = document.createElement('div');
    banner.id = 'status-banner';
    banner.className = 'banner';
    banner.innerHTML = `
      <div class="banner-info">
        <h2>
          <span>Test Suite Status</span>
          <span id="overall-badge" class="status-badge running font-mono">INITIALIZING</span>
        </h2>
        <p id="overall-summary">Preparing browser test harness for 9 cryptographic & codec suites...</p>
      </div>
      <div class="banner-actions">
        <button id="btn-run-all" class="btn btn-primary">
          <span id="btn-icon">↻</span>
          <span id="btn-text">Rerun In Browser</span>
        </button>
        <button id="btn-run-puppeteer" class="btn btn-secondary">
          <span>🤖 Run Puppeteer</span>
        </button>
        <button id="btn-clear-term" class="btn btn-secondary">Clear</button>
      </div>
    `;

    this.element = banner;
    this.badgeEl = banner.querySelector('#overall-badge');
    this.summaryEl = banner.querySelector('#overall-summary');
    this.runBtn = banner.querySelector('#btn-run-all');
    this.puppeteerBtn = banner.querySelector('#btn-run-puppeteer');
    this.btnText = banner.querySelector('#btn-text');

    this.runBtn.addEventListener('click', () => this.onRunAll());
    this.puppeteerBtn.addEventListener('click', () => this.onRunPuppeteer());
    banner.querySelector('#btn-clear-term').addEventListener('click', () => this.onClearTerminal());

    return banner;
  }

  /**
   * Sets the running state.
   * @param {string} [msg]
   */
  setRunning(msg = 'Executing 9 test suites sequentially in browser runtime...') {
    if (this.badgeEl) {
      this.badgeEl.className = 'status-badge running font-mono';
      this.badgeEl.textContent = 'RUNNING';
    }
    if (this.summaryEl) {
      this.summaryEl.textContent = msg;
    }
    if (this.runBtn) {
      this.runBtn.disabled = true;
    }
    if (this.puppeteerBtn) {
      this.puppeteerBtn.disabled = true;
    }
    if (this.btnText) {
      this.btnText.textContent = 'Running...';
    }
  }

  /**
   * Sets completed state.
   * @param {number} passed
   * @param {number} failed
   * @param {number} duration
   * @param {string} [prefix='All 9']
   */
  setCompleted(passed, failed, duration, prefix = 'All 9') {
    if (this.runBtn) {
      this.runBtn.disabled = false;
    }
    if (this.puppeteerBtn) {
      this.puppeteerBtn.disabled = false;
    }
    if (this.btnText) {
      this.btnText.textContent = 'Rerun In Browser';
    }
    if (failed === 0) {
      if (this.badgeEl) {
        this.badgeEl.className = 'status-badge pass font-mono';
        this.badgeEl.textContent = 'ALL 9 PASSED';
      }
      if (this.summaryEl) {
        this.summaryEl.textContent = `${prefix} cryptographic, codec, and boundary test suites passed cleanly in ${duration.toFixed(1)}ms.`;
      }
    } else {
      if (this.badgeEl) {
        this.badgeEl.className = 'status-badge fail font-mono';
        this.badgeEl.textContent = `${failed} FAILED`;
      }
      if (this.summaryEl) {
        this.summaryEl.textContent = `${failed} of 9 test suites encountered errors. See log entries below.`;
      }
    }
  }
}
