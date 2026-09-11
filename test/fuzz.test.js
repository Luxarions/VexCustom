/**
 * Test: Pseudo-fuzzing and roundtrip property tests
 */

import { encodeBase58, decodeBase58 } from '../src/core/Bs58.js';
import { toHex, fromHex, toBase64, fromBase64 } from '../src/core/Codec.js';
import { assertDeepEqual } from './_assert.js';

// Simple deterministic PRNG for reproducible fuzz runs
let s = 123456789;
function xorshift32() {
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}

function randomUint8Array(len) {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = xorshift32() & 0xff;
  }
  return arr;
}

async function run() {
  console.log('Running roundtrip fuzz tests...');

  for (let i = 0; i < 50; i++) {
    const len = xorshift32() % 256;
    const original = randomUint8Array(len);

    // 1. Base58 roundtrip
    const b58 = encodeBase58(original);
    const decodedB58 = decodeBase58(b58);
    assertDeepEqual(decodedB58, original, `Base58 fuzz mismatch at len ${len}`);

    // 2. Hex roundtrip
    const hex = toHex(original);
    const decodedHex = fromHex(hex);
    assertDeepEqual(decodedHex, original, `Hex fuzz mismatch at len ${len}`);

    // 3. Base64 roundtrip
    const b64 = toBase64(original);
    const decodedB64 = fromBase64(b64);
    assertDeepEqual(decodedB64, original, `Base64 fuzz mismatch at len ${len}`);
  }

  console.log('✓ Roundtrip fuzz tests passed (50 iterations per encoding).');
}

run().catch((err) => {
  console.error(err);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});

export { run };
