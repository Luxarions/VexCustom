/**
 * Vexorion — Constant-Time Operations
 * Defends against side-channel and timing attacks.
 */

import { assertUint8Array } from './Utils.js';

/**
 * Constant-time equality comparison of two Uint8Arrays.
 * Returns true if equal, false otherwise.
 * Always inspects all bytes regardless of early mismatches.
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
export function timingSafeEqual(a, b) {
  assertUint8Array(a, 'a');
  assertUint8Array(b, 'b');

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Constant-time conditional byte select.
 * Returns x when condition is 1, y when condition is 0.
 * @param {number} condition - 0 or 1
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function selectByte(condition, x, y) {
  const mask = -condition;
  return (x & mask) | (y & ~mask);
}

/**
 * Constant-time byte equality.
 * Returns 1 if x === y, 0 otherwise.
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function bytesEqual(x, y) {
  const diff = x ^ y;
  return ((diff | -diff) >> 31) + 1;
}
