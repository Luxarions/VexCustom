/**
 * Test: Codec (Hex, Base64, UTF-8, Base58)
 */

import { toHex, fromHex, toUtf8, fromUtf8, toBase64, fromBase64 } from '../src/core/Codec.js';
import { encodeBase58, decodeBase58 } from '../src/core/Bs58.js';
import { assertEqual, assertDeepEqual } from './_assert.js';

async function run() {
  console.log('Testing Codec modules...');

  // 1. Hex
  const raw = new Uint8Array([0x00, 0x01, 0x0e, 0x0f, 0x10, 0xff]);
  const hex = toHex(raw);
  assertEqual(hex, '00010e0f10ff');
  assertDeepEqual(fromHex(hex), raw);
  assertDeepEqual(fromHex('0x' + hex), raw);

  // 2. UTF-8
  const text = 'Hello, Vexorion! 🚀 🦊';
  const utf8Bytes = toUtf8(text);
  assertEqual(fromUtf8(utf8Bytes), text);

  // 3. Base64
  const b64 = toBase64(utf8Bytes);
  assertDeepEqual(fromBase64(b64), utf8Bytes);

  // 4. Base58
  const b58 = encodeBase58(utf8Bytes);
  assertDeepEqual(decodeBase58(b58), utf8Bytes);

  console.log('✓ All codec tests passed.');
}

if (typeof process !== 'undefined' && process.argv?.[1]?.includes('codec.test.js')) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { run };
