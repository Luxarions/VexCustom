/**
 * Vexorion — Bitcoin / IPFS Base58 Encoding & Decoding
 * Preserves leading zero bytes deterministically.
 */

import { BASE58_ALPHABET } from './Constants.js';
import { assertUint8Array, alloc } from './Utils.js';
import { EncodingError } from './Errors.js';

const ALPHABET_MAP = new Uint8Array(256);
ALPHABET_MAP.fill(255);
for (let i = 0; i < BASE58_ALPHABET.length; i++) {
  ALPHABET_MAP[BASE58_ALPHABET.charCodeAt(i)] = i;
}

/**
 * Encodes a Uint8Array into a Base58 string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function encodeBase58(bytes) {
  assertUint8Array(bytes, 'bytes');
  if (bytes.length === 0) return '';

  // Count leading zeros
  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
    leadingZeros++;
  }

  // Allocate upper bound for base58 digits: ceil(log(256)/log(58)) ≈ 1.366
  const size = Math.ceil(bytes.length * 1.365658237309761) + 1;
  const b58 = new Uint8Array(size);
  let length = 0;

  for (let i = leadingZeros; i < bytes.length; i++) {
    let carry = bytes[i];
    let j = 0;
    for (let it = size - 1; (carry !== 0 || j < length) && it >= 0; it--, j++) {
      carry += 256 * b58[it];
      b58[it] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    length = j;
  }

  // Skip leading zeros in b58
  let it = size - length;
  while (it < size && b58[it] === 0) {
    it++;
  }

  let str = '1'.repeat(leadingZeros);
  for (; it < size; ++it) {
    str += BASE58_ALPHABET.charAt(b58[it]);
  }

  return str;
}

/**
 * Decodes a Base58 string into a Uint8Array.
 * @param {string} str
 * @returns {Uint8Array}
 */
export function decodeBase58(str) {
  if (typeof str !== 'string') {
    throw new EncodingError('Expected input to be a string', 'base58');
  }
  if (str.length === 0) return alloc(0);

  // Count leading '1's (representing leading zero bytes)
  let leadingZeros = 0;
  while (leadingZeros < str.length && str[leadingZeros] === '1') {
    leadingZeros++;
  }

  // Upper bound for decoded bytes: ceil(log(58)/log(256)) ≈ 0.733
  const size = Math.ceil(str.length * 0.732247611039887) + 1;
  const b256 = new Uint8Array(size);
  let length = 0;

  for (let i = leadingZeros; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode > 255) {
      throw new EncodingError(`Non-ASCII character in Base58 string: "${str[i]}"`, 'base58');
    }
    const val = ALPHABET_MAP[charCode];
    if (val === 255) {
      throw new EncodingError(`Invalid Base58 character: "${str[i]}"`, 'base58');
    }

    let carry = val;
    let j = 0;
    for (let it = size - 1; (carry !== 0 || j < length) && it >= 0; it--, j++) {
      carry += 58 * b256[it];
      b256[it] = carry % 256;
      carry = Math.floor(carry / 256);
    }
    length = j;
  }

  // Skip leading zeros in b256
  let it = size - length;
  while (it < size && b256[it] === 0) {
    it++;
  }

  const result = alloc(leadingZeros + (size - it));
  for (let i = 0; i < leadingZeros; i++) {
    result[i] = 0;
  }
  for (let i = leadingZeros; it < size; i++, it++) {
    result[i] = b256[it];
  }

  return result;
}
