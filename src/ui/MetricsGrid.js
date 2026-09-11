/**
 * Vexorion — MetricsGrid Component
 * src/ui/MetricsGrid.js
 */

export class MetricsGrid {
  /**
   * @param {number} totalSuites
   */
  constructor(totalSuites = 9) {
    this.totalSuites = totalSuites;
    this.element = null;
    this.passedEl = null;
    this.failedEl = null;
    this.durationEl = null;
    this.totalEl = null;
  }

  /**
   * Renders the metrics grid DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const grid = document.createElement('div');
    grid.id = 'metrics-grid';
    grid.className = 'metrics-grid';
    grid.innerHTML = `
      <div class="metric-card" id="metric-card-pass">
        <div class="metric-label">Pass Rate</div>
        <div class="metric-value font-mono">
          <span id="metric-passed" style="color: var(--color-pass);">0</span>
          <span class="metric-sub">/ <span id="metric-total">${this.totalSuites}</span> suites</span>
        </div>
      </div>

      <div class="metric-card" id="metric-card-fail">
        <div class="metric-label">Failed Suites</div>
        <div class="metric-value font-mono">
          <span id="metric-failed" style="color: var(--color-fail);">0</span>
          <span class="metric-sub">failures</span>
        </div>
      </div>

      <div class="metric-card" id="metric-card-duration">
        <div class="metric-label">Total Execution Time</div>
        <div class="metric-value font-mono">
          <span id="metric-duration">0.0</span>
          <span class="metric-sub">ms</span>
        </div>
      </div>

      <div class="metric-card" id="metric-card-engine">
        <div class="metric-label">Runtime Engine</div>
        <div class="metric-value font-mono" style="font-size: 1.125rem;">
          <span>WebCrypto + JS Sponge</span>
        </div>
      </div>
    `;

    this.element = grid;
    this.passedEl = grid.querySelector('#metric-passed');
    this.failedEl = grid.querySelector('#metric-failed');
    this.durationEl = grid.querySelector('#metric-duration');
    this.totalEl = grid.querySelector('#metric-total');
    return grid;
  }

  /**
   * Updates metric values.
   * @param {number} passed
   * @param {number} failed
   * @param {number} durationMs
   */
  update(passed, failed, durationMs) {
    if (this.passedEl) this.passedEl.textContent = String(passed);
    if (this.failedEl) this.failedEl.textContent = String(failed);
    if (this.durationEl) this.durationEl.textContent = durationMs.toFixed(1);
  }

  /**
   * Updates total suites count.
   * @param {number} count
   */
  setTotal(count) {
    this.totalSuites = count;
    if (this.totalEl) this.totalEl.textContent = String(count);
  }
}
