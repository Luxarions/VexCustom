/**
 * Vexorion — Internal Utilities
 */

import { ValidationError } from './Errors.js';

/**
 * Asserts condition, throws ValidationError if false.
 * @param {boolean} condition
 * @param {string}  message
 * @param {string}  [field]
 */
export function assert(condition, message, field) {
  if (!condition) {
    throw new ValidationError(message, field);
  }
}

/**
 * Verifies value is a Uint8Array.
 * @param {unknown} value
 * @param {string}  [fieldName='value']
 * @returns {Uint8Array}
 */
export function assertUint8Array(value, fieldName = 'value') {
  if (!(value instanceof Uint8Array)) {
    throw new ValidationError(
      `Expected ${fieldName} to be an instance of Uint8Array, got ${typeof value}`,
      fieldName
    );
  }
  return value;
}

/**
 * Asserts a safe non-negative integer.
 * @param {unknown} value
 * @param {string}  [fieldName='value']
 * @returns {number}
 */
export function assertInteger(value, fieldName = 'value') {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new ValidationError(
      `Expected ${fieldName} to be a non-negative safe integer, got ${value}`,
      fieldName
    );
  }
  return value;
}

/**
 * Allocates a zeroed Uint8Array of specified length.
 * @param {number} length
 * @returns {Uint8Array}
 */
export function alloc(length) {
  assertInteger(length, 'length');
  return new Uint8Array(length);
}

/**
 * Zeroes out a Uint8Array in place.
 * @param {Uint8Array} buffer
 */
export function wipe(buffer) {
  assertUint8Array(buffer, 'buffer');
  buffer.fill(0);
}

/**
 * Clones a Uint8Array.
 * @param {Uint8Array} src
 * @returns {Uint8Array}
 */
export function cloneBytes(src) {
  assertUint8Array(src, 'src');
  const dst = new Uint8Array(src.length);
  dst.set(src);
  return dst;
}

/**
 * Concatenates multiple Uint8Arrays.
 * @param {Uint8Array[]} arrays
 * @returns {Uint8Array}
 */
export function concatBytes(arrays) {
  if (!Array.isArray(arrays)) {
    throw new ValidationError('Expected arrays to be an Array', 'arrays');
  }
  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
    assertUint8Array(arrays[i], `arrays[${i}]`);
    totalLength += arrays[i].length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < arrays.length; i++) {
    result.set(arrays[i], offset);
    offset += arrays[i].length;
  }
  return result;
}
