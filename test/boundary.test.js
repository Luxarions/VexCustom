/**
 * Test: Boundary Conditions & Buffer Edge Cases
 */

import { Hash } from '../src/core/Hash.js';
import { toHex, fromHex, toUtf8 } from '../src/core/Codec.js';
import { encodeBase58, decodeBase58 } from '../src/core/Bs58.js';
import { alloc } from '../src/core/Utils.js';
import { assertEqual, assertDeepEqual } from './_assert.js';

async function run() {
  console.log('Testing boundary conditions...');

  // 1. Empty buffer hashing
  const emptyRes = await Hash.sha3_256(alloc(0));
  assertEqual(emptyRes.length, 32, 'Empty buffer digest size mismatch');

  // 2. Exact rate boundary (SHA3-256 rate is 1088 bits = 136 bytes)
  const block136 = alloc(136);
  block136.fill(0x42);
  const digest136 = await Hash.sha3_256(block136);
  assertEqual(digest136.length, 32, '136-byte digest size mismatch');

  // 3. Rate boundary + 1 byte (137 bytes)
  const block137 = alloc(137);
  block137.fill(0x43);
  const digest137 = await Hash.sha3_256(block137);
  assertEqual(digest137.length, 32, '137-byte digest size mismatch');

  // 4. Multiple block inputs (500 bytes)
  const block500 = alloc(500);
  block500.fill(0xaa);
  const digest500 = await Hash.sha3_256(block500);
  assertEqual(digest500.length, 32, '500-byte digest size mismatch');

  // 5. Base58 all zeroes preserving
  const zeroes = new Uint8Array([0, 0, 0, 0, 0]);
  const b58Zeroes = encodeBase58(zeroes);
  assertEqual(b58Zeroes, '11111', 'Leading zeros not preserved as 1s in Base58');
  assertDeepEqual(decodeBase58(b58Zeroes), zeroes, 'Decoded zeros mismatch');

  // 6. Hex empty string
  const emptyHexBytes = fromHex('');
  assertEqual(emptyHexBytes.length, 0);
  assertEqual(toHex(alloc(0)), '');

  console.log('✓ All boundary condition tests passed.');
}

run().catch((err) => {
  console.error(err);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});

export { run };
