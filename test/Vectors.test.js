/**
 * Test: NIST & Known Test Vectors for SHA3 & Keccak
 */

import { Hash } from '../src/core/Hash.js';
import { assertEqual } from './_assert.js';

async function run() {
  console.log('Testing official and standard hash vectors...');

  // 1. NIST SHA3-256 empty string
  // "" -> a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a
  const sha3Empty = await Hash.sha3_256Hex('');
  assertEqual(
    sha3Empty,
    'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    'NIST SHA3-256 empty string mismatch'
  );

  // 2. Ethereum / Legacy Keccak-256 empty string
  // "" -> c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
  const keccakEmpty = await Hash.keccak256Hex('');
  assertEqual(
    keccakEmpty,
    'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
    'Keccak-256 empty string mismatch'
  );

  // 3. NIST SHA3-256 "The quick brown fox jumps over the lazy dog"
  const sha3Fox = await Hash.sha3_256Hex('The quick brown fox jumps over the lazy dog');
  assertEqual(
    sha3Fox,
    '69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04',
    'NIST SHA3-256 Quick Brown Fox mismatch'
  );

  // 4. Keccak-256 "The quick brown fox jumps over the lazy dog"
  const keccakFox = await Hash.keccak256Hex('The quick brown fox jumps over the lazy dog');
  assertEqual(
    keccakFox,
    '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15',
    'Keccak-256 Quick Brown Fox mismatch'
  );

  console.log('✓ All standard cryptographic vectors passed.');
}

run().catch((err) => {
  console.error(err);
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});

export { run };
