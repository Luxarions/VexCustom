/**
 * Vexorion — Test Runner Application UI Coordinator
 * src/ui/App.js
 */

import { SUITES, executeSuite } from '../test-runner.js';
import { Header } from './Header.js';
import { StatusBanner } from './StatusBanner.js';
import { ProgressBar } from './ProgressBar.js';
import { MetricsGrid } from './MetricsGrid.js';
import { SuitesList } from './SuitesList.js';
import { Terminal } from './Terminal.js';
import { Footer } from './Footer.js';

export class App {
  /**
   * @param {object} [options]
   * @param {Array<object>} [options.suites]
   * @param {string} [options.activePage='index.html']
   */
  constructor(options = {}) {
    this.suites = options.suites || SUITES;
    this.activePage = options.activePage || 'index.html';

    this.header = new Header({ activePage: this.activePage });
    this.statusBanner = new StatusBanner({
      onRunAll: () => this.runAll(),
      onRunPuppeteer: () => this.runPuppeteer(),
      onClearTerminal: () => this.terminal.clear(),
    });
    this.progressBar = new ProgressBar();
    this.metricsGrid = new MetricsGrid(this.suites.length);
    this.suitesList = new SuitesList(this.suites, {
      onRunSuite: (id) => this.runSingle(id),
    });
    this.terminal = new Terminal();
    this.footer = new Footer();

    this.isRunningAll = false;
  }

  /**
   * Mounts the UI components into the given root container or document.body.
   * @param {HTMLElement} [container]
   */
  mount(container = document.body) {
    container.innerHTML = '';

    // 1. Header
    container.appendChild(this.header.render());

    // 2. Main Content
    const main = document.createElement('main');
    main.id = 'main-content';

    main.appendChild(this.statusBanner.render());
    main.appendChild(this.progressBar.render());
    main.appendChild(this.metricsGrid.render());

    // Split Layout
    const split = document.createElement('div');
    split.id = 'layout-split-view';
    split.className = 'layout-split';
    split.appendChild(this.suitesList.render());
    split.appendChild(this.terminal.render());

    main.appendChild(split);
    container.appendChild(main);

    // 3. Footer
    container.appendChild(this.footer.render());

    // Expose helpers globally for backward compatibility
    window.runAllTests = () => this.runAll();
    window.runSingleSuite = (id) => this.runSingle(id);
    window.runPuppeteer = () => this.runPuppeteer();
    window.clearTerminal = () => this.terminal.clear();

    // Auto-run all tests on load in browser
    this.runAll();
  }

  /**
   * Runs a single test suite by ID.
   * @param {string} id
   */
  async runSingle(id) {
    const suite = this.suites.find((s) => s.id === id);
    if (!suite || this.isRunningAll) return;

    this.suitesList.setSuiteRunning(id);
    this.terminal.appendLine(`▶ [RUN] ${suite.file}`, 'header');

    const res = await executeSuite(suite, (log) => {
      let lineType = 'info';
      if (log.text.includes('✓')) lineType = 'success';
      else if (log.text.includes('Error') || log.type === 'error') lineType = 'error';
      else if (log.text.includes('ops/sec')) lineType = 'perf';
      this.terminal.appendLine(log.text, lineType);
    });

    this.suitesList.setSuiteResult(id, res);

    if (res.ok) {
      this.terminal.appendLine(`✓ [PASS] ${suite.file} (${res.duration.toFixed(1)}ms)`, 'success');
    } else {
      this.terminal.appendLine(`✖ [FAIL] ${suite.file}: ${res.error}`, 'error');
    }

    const stats = this.suitesList.getStats();
    this.metricsGrid.update(stats.passed, stats.failed, stats.totalDuration);
  }

  /**
   * Executes all test suites sequentially inside the current browser window.
   */
  async runAll() {
    if (this.isRunningAll) return;
    this.isRunningAll = true;

    this.statusBanner.setRunning();
    this.progressBar.reset();

    this.terminal.appendLine('==================================================', 'header');
    this.terminal.appendLine('🚀 Starting Vexorion Browser Test Suite', 'header');
    this.terminal.appendLine('==================================================', 'header');

    const totalStart = performance.now();
    let passedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < this.suites.length; i++) {
      const s = this.suites[i];
      this.suitesList.setSuiteRunning(s.id);
      this.terminal.appendLine(`\n▶ [RUN] ${s.file}`, 'header');

      const res = await executeSuite(s, (log) => {
        let lineType = 'info';
        if (log.text.includes('✓')) lineType = 'success';
        else if (log.text.includes('Error') || log.type === 'error') lineType = 'error';
        else if (log.text.includes('ops/sec')) lineType = 'perf';
        this.terminal.appendLine(log.text, lineType);
      });

      this.suitesList.setSuiteResult(s.id, res);

      if (res.ok) {
        passedCount++;
        this.terminal.appendLine(`✓ [PASS] ${s.file} (${res.duration.toFixed(1)}ms)`, 'success');
      } else {
        failedCount++;
        this.terminal.appendLine(`✖ [FAIL] ${s.file}: ${res.error}`, 'error');
      }

      this.progressBar.setProgress(((i + 1) / this.suites.length) * 100);

      const stats = this.suitesList.getStats();
      this.metricsGrid.update(stats.passed, stats.failed, stats.totalDuration);
    }

    const totalDuration = performance.now() - totalStart;

    this.terminal.appendLine('\n==================================================', 'header');
    this.terminal.appendLine(
      `Test Summary: ${passedCount} passed, ${failedCount} failed (${totalDuration.toFixed(1)}ms)`,
      failedCount === 0 ? 'success' : 'error'
    );
    this.terminal.appendLine('==================================================', 'header');

    this.statusBanner.setCompleted(passedCount, failedCount, totalDuration);
    this.metricsGrid.update(passedCount, failedCount, totalDuration);
    this.isRunningAll = false;
  }

  /**
   * Triggers the headless Puppeteer suite on the server and streams feedback.
   */
  async runPuppeteer() {
    if (this.isRunningAll) return;
    this.isRunningAll = true;

    this.statusBanner.setRunning('Launching headless Chromium via Puppeteer...');
    this.progressBar.reset();
    this.progressBar.setProgress(30);

    this.terminal.appendLine('\n==================================================', 'header');
    this.terminal.appendLine('🤖 Triggering Headless Puppeteer Suite (/api/run-puppeteer)', 'header');
    this.terminal.appendLine('==================================================', 'header');

    try {
      const response = await fetch('/api/run-puppeteer', { method: 'POST' });
      const data = await response.json();

      this.progressBar.setProgress(100);

      if (!data.success) {
        throw new Error(data.error || 'Puppeteer runner failed');
      }

      const res = data.result;
      if (res.logs && Array.isArray(res.logs)) {
        res.logs.forEach((log) => {
          let lineType = 'info';
          if (log.includes('✓') || log.includes('PASS')) lineType = 'success';
          else if (log.includes('✖') || log.includes('FAIL') || log.includes('Error')) lineType = 'error';
          else if (log.includes('ops/sec')) lineType = 'perf';
          this.terminal.appendLine(`[Puppeteer] ${log}`, lineType);
        });
      }

      this.terminal.appendLine('\n==================================================', 'header');
      this.terminal.appendLine(
        `🎯 Puppeteer Headless Outcome: ${res.passedCount} passed, ${res.failedCount} failed (${res.duration.toFixed(1)}ms)`,
        res.ok ? 'success' : 'error'
      );
      this.terminal.appendLine('==================================================', 'header');

      this.statusBanner.setCompleted(res.passedCount, res.failedCount, res.duration, 'Puppeteer verified all 9');
      this.metricsGrid.update(res.passedCount, res.failedCount, res.duration);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.terminal.appendLine(`✖ Puppeteer Error: ${msg}`, 'error');
      this.statusBanner.setCompleted(0, 1, 0);
    } finally {
      this.isRunningAll = false;
    }
  }
}
