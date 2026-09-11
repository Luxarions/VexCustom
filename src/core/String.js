/**
 * Vexorion — String Manipulation Utilities
 */

import { ValidationError } from './Errors.js';

/**
 * Validates that input is a non-empty string.
 * @param {unknown} val
 * @param {string}  [fieldName='value']
 * @returns {string}
 */
export function assertNonEmptyString(val, fieldName = 'value') {
  if (typeof val !== 'string' || val.trim().length === 0) {
    throw new ValidationError(`Expected ${fieldName} to be a non-empty string`, fieldName);
  }
  return val;
}

/**
 * Pads a string on the left to target length.
 * @param {string} str
 * @param {number} targetLength
 * @param {string} [padChar='0']
 * @returns {string}
 */
export function padLeft(str, targetLength, padChar = '0') {
  return str.padStart(targetLength, padChar);
}

/**
 * Normalizes hex string by stripping leading 0x and converting to lowercase.
 * @param {string} hex
 * @returns {string}
 */
export function normalizeHex(hex) {
  if (typeof hex !== 'string') {
    throw new ValidationError('Expected hex to be a string', 'hex');
  }
  const clean = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  return clean.toLowerCase();
}
