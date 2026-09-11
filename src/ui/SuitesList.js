/**
 * Vexorion — SuitesList Component
 * src/ui/SuitesList.js
 */

import { SuiteCard } from './SuiteCard.js';

export class SuitesList {
  /**
   * @param {Array<object>} suites
   * @param {object} [callbacks]
   * @param {(suiteId: string) => void} [callbacks.onRunSuite]
   */
  constructor(suites, callbacks = {}) {
    this.suites = suites;
    this.onRunSuite = callbacks.onRunSuite || (() => {});
    this.cards = new Map();
    this.element = null;
    this.listEl = null;
  }

  /**
   * Renders the suites list container.
   * @returns {HTMLElement}
   */
  render() {
    const col = document.createElement('div');
    col.id = 'suites-column';
    col.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">Isolated Test Suites (${this.suites.length})</div>
      </div>
      <div id="suites-container" class="suites-list"></div>
    `;

    this.element = col;
    this.listEl = col.querySelector('#suites-container');

    this.suites.forEach((s) => {
      const card = new SuiteCard(s, {
        onRun: (id) => this.onRunSuite(id),
      });
      this.cards.set(s.id, card);
      this.listEl.appendChild(card.render());
    });

    return col;
  }

  /**
   * Gets a specific SuiteCard component by ID.
   * @param {string} id
   * @returns {SuiteCard | undefined}
   */
  getCard(id) {
    return this.cards.get(id);
  }

  /**
   * Sets a specific suite to running state.
   * @param {string} id
   */
  setSuiteRunning(id) {
    const card = this.cards.get(id);
    if (card) card.setRunning();
  }

  /**
   * Updates a specific suite with its test results.
   * @param {string} id
   * @param {object} result
   */
  setSuiteResult(id, result) {
    const card = this.cards.get(id);
    if (card) card.setResult(result);
  }

  /**
   * Calculates current aggregate statistics across all suites.
   * @returns {{ passed: number, failed: number, totalDuration: number }}
   */
  getStats() {
    let passed = 0;
    let failed = 0;
    let totalDuration = 0;

    for (const card of this.cards.values()) {
      if (card.state.status === 'passed') passed++;
      if (card.state.status === 'failed') failed++;
      totalDuration += card.state.duration || 0;
    }

    return { passed, failed, totalDuration };
  }
}
