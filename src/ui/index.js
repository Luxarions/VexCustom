/**
 * Vexorion — UI Module Index
 * src/ui/index.js
 *
 * Exports all decoupled UI components (pure .js, zero external dependencies).
 */

export { Header } from './Header.js';
export { StatusBanner } from './StatusBanner.js';
export { ProgressBar } from './ProgressBar.js';
export { MetricsGrid } from './MetricsGrid.js';
export { SuiteCard } from './SuiteCard.js';
export { SuitesList } from './SuitesList.js';
export { Terminal } from './Terminal.js';
export { Footer } from './Footer.js';
export { App } from './App.js';
export { escapeHtml, formatDuration } from './utils.js';

// Auto-bootstrap when loaded as a module in browser environment
import { App } from './App.js';

if (typeof document !== 'undefined') {
  const init = () => {
    const root = document.getElementById('app') || document.body;
    const app = new App();
    app.mount(root);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
