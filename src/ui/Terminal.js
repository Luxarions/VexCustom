/**
 * Vexorion — Terminal Component
 * src/ui/Terminal.js
 */

export class Terminal {
  constructor() {
    this.element = null;
    this.bodyEl = null;
  }

  /**
   * Renders the terminal container DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const col = document.createElement('div');
    col.id = 'terminal-column';
    col.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">Live Execution Console</div>
        <span class="font-mono text-xs" style="color: var(--text-sub); font-size: 0.6875rem;">stdout / stderr</span>
      </div>
      <div class="terminal-container" id="terminal-wrapper">
        <div class="terminal-header">
          <div class="terminal-dots">
            <div class="terminal-dot" style="background: #ef4444;"></div>
            <div class="terminal-dot" style="background: #eab308;"></div>
            <div class="terminal-dot" style="background: #22c55e;"></div>
          </div>
          <div class="terminal-title font-mono">browser-runner.log</div>
          <div></div>
        </div>
        <div id="terminal-output" class="terminal-body font-mono">
          <div class="terminal-line info">Vexorion Test Runner initializing...</div>
        </div>
      </div>
    `;

    this.element = col;
    this.bodyEl = col.querySelector('#terminal-output');
    return col;
  }

  /**
   * Appends a formatted line to the terminal.
   * @param {string} text
   * @param {'info' | 'success' | 'error' | 'header' | 'perf'} [type='info']
   */
  appendLine(text, type = 'info') {
    if (!this.bodyEl) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    this.bodyEl.appendChild(line);
    this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
  }

  /**
   * Clears all log entries from the terminal.
   */
  clear() {
    if (!this.bodyEl) return;
    this.bodyEl.innerHTML = '';
    this.appendLine('Console cleared.', 'info');
  }
}
