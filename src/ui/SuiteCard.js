/**
 * Vexorion — SuiteCard Component
 * src/ui/SuiteCard.js
 */

import { escapeHtml, formatDuration } from './utils.js';

export class SuiteCard {
  /**
   * @param {object} suite - Suite definition object { id, name, file, category }
   * @param {object} [callbacks]
   * @param {(suiteId: string) => void} [callbacks.onRun]
   */
  constructor(suite, callbacks = {}) {
    this.suite = suite;
    this.onRun = callbacks.onRun || (() => {});
    this.state = {
      status: 'pending', // 'pending' | 'running' | 'passed' | 'failed'
      duration: 0,
      logs: [],
      error: null,
    };
    this.element = null;
  }

  /**
   * Renders the suite card DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const card = document.createElement('div');
    card.className = 'suite-card';
    card.id = `suite-card-${this.suite.id}`;

    this.element = card;
    this.update();
    return card;
  }

  /**
   * Updates the card appearance based on internal state.
   */
  update() {
    if (!this.element) return;

    let indicatorClass = '';
    if (this.state.status === 'passed') indicatorClass = 'pass';
    else if (this.state.status === 'failed') indicatorClass = 'fail';
    else if (this.state.status === 'running') indicatorClass = 'running';

    let timeStr = formatDuration(this.state.duration);
    let logHtml = '';
    if (this.state.logs && this.state.logs.length > 0) {
      const lines = this.state.logs.map(l => l.text).join('\n');
      logHtml = `<div class="suite-logs font-mono">${escapeHtml(lines)}</div>`;
    }

    let errorHtml = '';
    if (this.state.error) {
      errorHtml = `<div class="suite-error font-mono">${escapeHtml(this.state.error)}</div>`;
    }

    this.element.innerHTML = `
      <div class="suite-header">
        <div class="suite-title-group">
          <div class="suite-indicator ${indicatorClass}"></div>
          <div>
            <div class="suite-name">${escapeHtml(this.suite.name)}</div>
            <div class="suite-category font-mono">${escapeHtml(this.suite.category)} • ${escapeHtml(this.suite.file)}</div>
          </div>
        </div>
        <div class="suite-meta">
          <span class="suite-time font-mono">${timeStr}</span>
          <button class="btn-run-one font-mono" type="button">Run</button>
        </div>
      </div>
      ${errorHtml}
      ${logHtml}
    `;

    const runBtn = this.element.querySelector('.btn-run-one');
    if (runBtn) {
      runBtn.disabled = this.state.status === 'running';
      runBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onRun(this.suite.id);
      });
    }
  }

  /**
   * Sets the running state.
   */
  setRunning() {
    this.state.status = 'running';
    this.state.error = null;
    this.update();
  }

  /**
   * Sets test result.
   * @param {{ ok: boolean, duration: number, logs: Array<{type: string, text: string}>, error?: string }} result
   */
  setResult(result) {
    this.state.status = resOkToStatus(result.ok);
    this.state.duration = result.duration;
    this.state.logs = result.logs || [];
    this.state.error = result.error || null;
    this.update();
  }
}

function resOkToStatus(ok) {
  return ok ? 'passed' : 'failed';
}
