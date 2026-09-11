/**
 * Benchmark: Measuring throughput of core operations
 */

import { Hash } from '../src/core/Hash.js';
import { encodeBase58, decodeBase58 } from '../src/core/Bs58.js';
import { alloc } from '../src/core/Utils.js';

async function run() {
  console.log('Running performance benchmarks (smoke test)...');

  const payload = alloc(1024); // 1KB
  payload.fill(0xee);

  // 1. Benchmark Hash 1KB
  const startHash = performance.now();
  const HASH_ITERS = 100;
  for (let i = 0; i < HASH_ITERS; i++) {
    await Hash.sha3_256(payload);
  }
  const endHash = performance.now();
  const hashMs = endHash - startHash;
  console.log(`- SHA3-256 (1KB x ${HASH_ITERS}): ${hashMs.toFixed(2)}ms (${((HASH_ITERS / hashMs) * 1000).toFixed(0)} ops/sec)`);

  // 2. Benchmark Base58 1KB
  const startB58 = performance.now();
  const B58_ITERS = 50;
  for (let i = 0; i < B58_ITERS; i++) {
    const encoded = encodeBase58(payload);
    decodeBase58(encoded);
  }
  const endB58 = performance.now();
  const b58Ms = endB58 - startB58;
  console.log(`- Base58 Roundtrip (1KB x ${B58_ITERS}): ${b58Ms.toFixed(2)}ms (${((B58_ITERS / b58Ms) * 1000).toFixed(0)} ops/sec)`);

  console.log('✓ Benchmarks completed successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
