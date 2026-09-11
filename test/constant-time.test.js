/**
 * Test: Constant-Time Operations
 */

import { timingSafeEqual, selectByte, bytesEqual } from '../src/core/ConstantTime.js';
import { assert, assertEqual } from './_assert.js';

async function run() {
  console.log('Testing constant-time operations...');

  // 1. timingSafeEqual identity
  const a = new Uint8Array([1, 2, 3, 4]);
  const b = new Uint8Array([1, 2, 3, 4]);
  const c = new Uint8Array([1, 2, 3, 5]);
  const d = new Uint8Array([1, 2, 3]);

  assert(timingSafeEqual(a, b), 'Identical arrays should be equal');
  assert(!timingSafeEqual(a, c), 'Different arrays should not be equal');
  assert(!timingSafeEqual(a, d), 'Different length arrays should not be equal');

  // 2. selectByte
  assertEqual(selectByte(1, 0xaa, 0xbb), 0xaa);
  assertEqual(selectByte(0, 0xaa, 0xbb), 0xbb);

  // 3. bytesEqual
  assertEqual(bytesEqual(0x42, 0x42), 1);
  assertEqual(bytesEqual(0x42, 0x43), 0);

  console.log('✓ All constant-time operation tests passed.');
}

run().catch((err) => {
  console.error(err);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});

export { run };
