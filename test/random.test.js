/**
 * Test: Cryptographic Random Generation
 */

import { randomBytes, randomInt } from '../src/core/Random.js';
import { assert, assertEqual } from './_assert.js';

async function run() {
  console.log('Testing cryptographically secure random generator...');

  // 1. Zero bytes
  const zero = await randomBytes(0);
  assertEqual(zero.length, 0);

  // 2. Standard lengths
  const r16 = await randomBytes(16);
  assertEqual(r16.length, 16);

  const r32 = await randomBytes(32);
  assertEqual(r32.length, 32);

  // 3. Large buffer crossing 65536 chunk threshold
  const large = await randomBytes(70000);
  assertEqual(large.length, 70000);

  // Verify non-zero entropy (statistically impossible to be all zeros)
  let nonZeroCount = 0;
  for (let i = 0; i < large.length; i++) {
    if (large[i] !== 0) nonZeroCount++;
  }
  assert(nonZeroCount > 60000, 'Random bytes lack expected entropy');

  // 4. randomInt bounds
  for (let i = 0; i < 100; i++) {
    const val = await randomInt(10, 20);
    assert(val >= 10 && val < 20, `randomInt out of bounds: ${val}`);
  }

  console.log('✓ All random generator tests passed.');
}

run().catch((err) => {
  console.error(err);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});

export { run };
