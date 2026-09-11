/**
 * Vexorion — Puppeteer Automated Browser Test Runner
 * test/puppeteer.js
 *
 * Launches headless Chromium via Puppeteer, navigates to the Vexorion
 * test harness, intercepts console logs, and verifies that all 9
 * cryptographic and encoding suites pass without failure.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Creates a lightweight static file server for testing.
 * @param {number} port
 * @returns {Promise<http.Server>}
 */
function createStaticServer(port = 0) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        let pathname = decodeURIComponent(reqUrl.pathname);
        if (pathname === '/') pathname = '/index.html';

        const filePath = path.join(rootDir, pathname);
        // Security check: ensure path is within rootDir
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          return res.end('403 Forbidden');
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end(`404 Not Found: ${pathname}`);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.message}`);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
    server.on('error', reject);
  });
}

/**
 * Runs the Puppeteer test suite.
 * @returns {Promise<{ ok: boolean, passedCount: number, failedCount: number, duration: number, logs: string[] }>}
 */
export async function runPuppeteerSuite() {
  console.log('==================================================');
  console.log('🤖 Launching Headless Chromium via Puppeteer');
  console.log('==================================================');

  // Start temporary local server on dynamic port
  const server = await createStaticServer(0);
  const port = server.address().port;
  const targetUrl = `http://127.0.0.1:${port}/index.html`;
  console.log(`[Puppeteer] Internal test server listening at ${targetUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
    ],
  });

  const logs = [];

  try {
    const page = await browser.newPage();

    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      if (msg.type() === 'error') {
        console.error(`\x1b[31m[Browser Error]\x1b[0m ${text}`);
      } else if (text.includes('✓') || text.includes('PASS')) {
        console.log(`\x1b[32m[Browser]\x1b[0m ${text}`);
      } else if (text.includes('✖') || text.includes('FAIL')) {
        console.log(`\x1b[31m[Browser]\x1b[0m ${text}`);
      } else {
        console.log(`[Browser] ${text}`);
      }
    });

    page.on('pageerror', (err) => {
      const msg = `Page error: ${err.message}`;
      logs.push(msg);
      console.error(`\x1b[31m[Browser Error]\x1b[0m ${msg}`);
    });

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('[Puppeteer] Waiting for test execution to complete...');

    // Wait for the badge to show "ALL 9 PASSED" or "FAILED"
    await page.waitForFunction(
      () => {
        const badge = document.querySelector('#overall-badge');
        if (!badge) return false;
        const text = badge.textContent || '';
        return text.includes('PASSED') || text.includes('FAILED');
      },
      { timeout: 45000 }
    );

    // Extract status and metrics from the page DOM
    const results = await page.evaluate(() => {
      const badge = document.querySelector('#overall-badge');
      const passedEl = document.querySelector('#metric-passed');
      const failedEl = document.querySelector('#metric-failed');
      const durationEl = document.querySelector('#metric-duration');

      const badgeText = badge ? badge.textContent.trim() : '';
      const passed = passedEl ? parseInt(passedEl.textContent.trim(), 10) || 0 : 0;
      const failed = failedEl ? parseInt(failedEl.textContent.trim(), 10) || 0 : 0;
      const duration = durationEl ? parseFloat(durationEl.textContent.trim()) || 0 : 0;

      return {
        badgeText,
        passed,
        failed,
        duration,
        allPassed: badgeText.includes('PASSED') && failed === 0,
      };
    });

    const summaryMsg =
      results.failed === 0
        ? `🎯 Puppeteer Verification Result: All ${results.passed} suites passed (${results.duration.toFixed(1)}ms)`
        : `🎯 Puppeteer Verification Result: ${results.passed} passed, ${results.failed} issues (${results.duration.toFixed(1)}ms)`;

    console.log('==================================================');
    console.log(summaryMsg);
    console.log('==================================================');

    return {
      ok: results.allPassed,
      passedCount: results.passed,
      failedCount: results.failed,
      duration: results.duration,
      logs,
    };
  } finally {
    await browser.close();
    await new Promise((res) => server.close(res));
  }
}

// If invoked directly from CLI: node test/puppeteer.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPuppeteerSuite()
    .then((res) => {
      if (!res.ok) {
        console.error(`\x1b[31m✖ Puppeteer test suite failed (${res.failedCount} failures).\x1b[0m`);
        process.exit(1);
      }
      console.log(`\x1b[32m✓ Puppeteer browser tests completed successfully.\x1b[0m`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('\x1b[31m[Puppeteer Fatal Error]\x1b[0m', err);
      process.exit(1);
    });
}
