/**
 * Vexorion Browser Unit Test Runner
 * Orchestrates all 9 test suites directly inside the browser environment.
 */

import { run as runVectors } from '../test/Vectors.test.js';
import { run as runBoundary } from '../test/boundary.test.js';
import { run as runFuzz } from '../test/fuzz.test.js';
import { run as runConstantTime } from '../test/constant-time.test.js';
import { run as runErrors } from '../test/errors.test.js';
import { run as runRandom } from '../test/random.test.js';
import { run as runCodec } from '../test/codec.test.js';
import { run as runChild } from '../test/child.test.js';
import { run as runBench } from '../test/bench.test.js';

export const SUITES = [
  { id: 'vectors', name: 'NIST & Ethereum Hash Vectors', file: 'Vectors.test.js', category: 'Cryptographic Vectors', run: runVectors },
  { id: 'boundary', name: 'Buffer Boundaries & Edge Cases', file: 'boundary.test.js', category: 'Boundary Conditions', run: runBoundary },
  { id: 'fuzz', name: 'Roundtrip Property Fuzzing (50 iters)', file: 'fuzz.test.js', category: 'Codec Fuzzing', run: runFuzz },
  { id: 'constant-time', name: 'Side-Channel Constant-Time Operations', file: 'constant-time.test.js', category: 'Side-Channel Defense', run: runConstantTime },
  { id: 'errors', name: 'Strict Error Hierarchy & Assertions', file: 'errors.test.js', category: 'Error Handling', run: runErrors },
  { id: 'random', name: 'CSPRNG Entropy & Rejection Sampling', file: 'random.test.js', category: 'Random Generation', run: runRandom },
  { id: 'codec', name: 'Hex, UTF-8, Base64 & Base58 Codecs', file: 'codec.test.js', category: 'Encoding', run: runCodec },
  { id: 'child', name: 'Fluent Vex Builder Architecture', file: 'child.test.js', category: 'Fluent API', run: runChild },
  { id: 'bench', name: 'Throughput Performance Benchmarks', file: 'bench.test.js', category: 'Performance', run: runBench },
];

export async function executeSuite(suite, onLog) {
  const originalLog = console.log;
  const originalError = console.error;
  const logs = [];

  console.log = (...args) => {
    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    logs.push({ type: 'info', text });
    if (onLog) onLog({ type: 'info', text });
    originalLog(...args);
  };

  console.error = (...args) => {
    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    logs.push({ type: 'error', text });
    if (onLog) onLog({ type: 'error', text });
    originalError(...args);
  };

  const t0 = performance.now();
  try {
    await suite.run();
    const duration = performance.now() - t0;
    return { ok: true, duration, logs };
  } catch (err) {
    const duration = performance.now() - t0;
    const errorText = err instanceof Error ? err.message : String(err);
    logs.push({ type: 'error', text: errorText });
    return { ok: false, duration, error: errorText, logs };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
