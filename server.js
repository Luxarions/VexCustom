/**
 * Vexorion — Native HTTP Development & Production Server
 * server.js
 *
 * Lightweight, zero-dependency Node.js HTTP server.
 * Replaces Vite with standard ES module serving and integrates
 * the Puppeteer automated browser test runner API.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPuppeteerSuite } from './test/puppeteer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const PORT = 3000;
const HOST = '0.0.0.0';

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
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

/**
 * Handles incoming HTTP requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // API endpoint: trigger Puppeteer test run from web UI
  if (pathname === '/api/run-puppeteer' && (req.method === 'POST' || req.method === 'GET')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      console.log('[Server] Running Puppeteer browser test suite via API...');
      const result = await runPuppeteerSuite();
      return res.end(JSON.stringify({ success: true, result }));
    } catch (err) {
      console.error('[Server] Puppeteer run error:', err);
      return res.end(
        JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        })
      );
    }
  }

  // Static File Serving
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  let targetFile = path.join(rootDir, relativePath);

  // Resolve directory to index.html if applicable
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, 'index.html');
  }

  // Prevent directory traversal attacks
  if (!targetFile.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end(`404 Not Found: ${pathname}`);
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  });

  const stream = fs.createReadStream(targetFile);
  stream.pipe(res);
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`==================================================`);
  console.log(`🛡️  Vexorion Server running at http://${HOST}:${PORT}`);
  console.log(`🤖 Puppeteer test runner available via /api/run-puppeteer`);
  console.log(`==================================================`);
});

export default server;
