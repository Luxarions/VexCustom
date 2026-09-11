/**
 * Test: Error Hierarchy and Expected Throws
 */

import {
  VexorionError,
  ValidationError,
  EncodingError,
  CryptoError,
  RangeError,
} from '../src/core/Errors.js';
import { fromHex, fromBase64 } from '../src/core/Codec.js';
import { decodeBase58 } from '../src/core/Bs58.js';
import { assertThrows, assert } from './_assert.js';

async function run() {
  console.log('Testing custom type hierarchy and input validation guards...');

  // 1. Inheritance checks
  const valErr = new ValidationError('test validation', 'param');
  assert(valErr instanceof VexorionError, 'ValidationError should inherit from VexorionError');
  assert(valErr instanceof Error, 'ValidationError should inherit from Error');

  // 2. Hex odd length
  assertThrows(() => fromHex('abc'), EncodingError, 'Odd hex should throw EncodingError');

  // 3. Hex invalid characters
  assertThrows(() => fromHex('zz'), EncodingError, 'Invalid hex char should throw EncodingError');

  // 4. Base58 invalid character
  assertThrows(() => decodeBase58('0OIl'), EncodingError, 'Invalid Base58 char should throw EncodingError');

  console.log('✓ All type hierarchy and input validation tests passed.');
}

if (typeof process !== 'undefined' && process.argv?.[1]?.includes('errors.test.js')) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { run };
