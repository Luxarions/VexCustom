/**
 * Vexorion — Codec Utilities
 * Hex, UTF-8, and Base64 conversions.
 */

import { HEX_REGEX, HEX_STRICT_REGEX } from './Constants.js';
import { assertUint8Array, alloc } from './Utils.js';
import { EncodingError } from './Errors.js';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: true });

/**
 * Converts a Uint8Array into a hex string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function toHex(bytes) {
  assertUint8Array(bytes, 'bytes');
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Parses a hex string into a Uint8Array.
 * Strips optional '0x' prefix. Requires even number of hex characters.
 * @param {string} hex
 * @returns {Uint8Array}
 */
export function fromHex(hex) {
  if (typeof hex !== 'string') {
    throw new EncodingError('Expected hex to be a string', 'hex');
  }
  let clean = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new EncodingError(`Hex string has odd length: ${clean.length}`, 'hex');
  }
  if (!HEX_STRICT_REGEX.test(clean)) {
    throw new EncodingError(`Invalid characters in hex string: "${clean}"`, 'hex');
  }

  const length = clean.length / 2;
  const out = alloc(length);
  for (let i = 0; i < length; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Encodes a string into UTF-8 Uint8Array.
 * @param {string} str
 * @returns {Uint8Array}
 */
export function toUtf8(str) {
  if (typeof str !== 'string') {
    throw new EncodingError('Expected string to be of type string', 'utf8');
  }
  return textEncoder.encode(str);
}

/**
 * Decodes a UTF-8 Uint8Array into a string.
 * Throws on malformed byte sequences.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function fromUtf8(bytes) {
  assertUint8Array(bytes, 'bytes');
  try {
    return textDecoder.decode(bytes);
  } catch (err) {
    throw new EncodingError(`Failed to decode UTF-8: ${err.message}`, 'utf8');
  }
}

/**
 * Encodes a Uint8Array to a Base64 string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function toBase64(bytes) {
  assertUint8Array(bytes, 'bytes');
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into a Uint8Array.
 * @param {string} b64
 * @returns {Uint8Array}
 */
export function fromBase64(b64) {
  if (typeof b64 !== 'string') {
    throw new EncodingError('Expected b64 to be a string', 'base64');
  }
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(b64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  try {
    const binary = atob(b64);
    const bytes = alloc(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    throw new EncodingError(`Invalid Base64 string: ${err.message}`, 'base64');
  }
}
