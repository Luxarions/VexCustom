/**
 * Custom zero-dependency test runner.
 * Runs all *.test.js files sequentially in isolated child processes.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
  'Vectors.test.js',
  'boundary.test.js',
  'fuzz.test.js',
  'constant-time.test.js',
  'errors.test.js',
  'random.test.js',
  'codec.test.js',
  'child.test.js',
  'bench.test.js',
];

console.log('='.repeat(50));
console.log('🚀 Running Vexorion Test Suite');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

for (const file of testFiles) {
  const fullPath = join(__dirname, file);
  console.log(`\n▶ [RUN] ${file}`);

  const res = spawnSync(process.execPath, [fullPath], {
    stdio: 'inherit',
    env: process.env,
  });

  if (res.status === 0) {
    passed++;
  } else {
    failed++;
    console.error(`✖ [FAIL] ${file} exited with code ${res.status}`);
  }
}

console.log('\n' + '='.repeat(50));
console.log(`Test Summary: ${passed} passed, ${failed} failed.`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
