/**
 * Vexorion — ProgressBar Component
 * src/ui/ProgressBar.js
 */

export class ProgressBar {
  constructor() {
    this.element = null;
    this.fillEl = null;
  }

  /**
   * Renders the progress bar DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.id = 'progress-bar-container';
    container.className = 'progress-bar-container';
    container.innerHTML = `<div id="progress-bar" class="progress-bar-fill"></div>`;

    this.element = container;
    this.fillEl = container.querySelector('#progress-bar');
    return container;
  }

  /**
   * Updates the progress percentage (0 - 100).
   * @param {number} percentage
   */
  setProgress(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    if (this.fillEl) {
      this.fillEl.style.width = `${clamped}%`;
    }
  }

  /**
   * Resets the progress bar to 0%.
   */
  reset() {
    this.setProgress(0);
  }
}
