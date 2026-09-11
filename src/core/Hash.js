/**
 * Vexorion — High-Level Hash Interface
 */

import { ALGORITHMS } from './Constants.js';
import { hash as cryptoHash } from './Crypto.js';
import { toHex, toUtf8 } from './Codec.js';
import { assertUint8Array } from './Utils.js';

function normalizeInput(input) {
  if (typeof input === 'string') {
    return toUtf8(input);
  }
  return assertUint8Array(input, 'input');
}

export class Hash {
  /**
   * Computes SHA3-256 digest.
   * @param {string|Uint8Array} input
   * @returns {Promise<Uint8Array>}
   */
  static async sha3_256(input) {
    return cryptoHash(ALGORITHMS.SHA3_256, normalizeInput(input));
  }

  /**
   * Computes SHA3-256 digest and returns hex string.
   * @param {string|Uint8Array} input
   * @returns {Promise<string>}
   */
  static async sha3_256Hex(input) {
    const digest = await this.sha3_256(input);
    return toHex(digest);
  }

  /**
   * Computes Keccak-256 digest.
   * @param {string|Uint8Array} input
   * @returns {Promise<Uint8Array>}
   */
  static async keccak256(input) {
    return cryptoHash(ALGORITHMS.KECCAK_256, normalizeInput(input));
  }

  /**
   * Computes Keccak-256 digest and returns hex string.
   * @param {string|Uint8Array} input
   * @returns {Promise<string>}
   */
  static async keccak256Hex(input) {
    const digest = await this.keccak256(input);
    return toHex(digest);
  }

  /**
   * Computes SHA3-512 digest.
   * @param {string|Uint8Array} input
   * @returns {Promise<Uint8Array>}
   */
  static async sha3_512(input) {
    return cryptoHash(ALGORITHMS.SHA3_512, normalizeInput(input));
  }

  /**
   * Computes SHAKE-256 variable-length hash.
   * @param {string|Uint8Array} input
   * @param {number} outputLength - Length in bytes
   * @returns {Promise<Uint8Array>}
   */
  static async shake256(input, outputLength) {
    return cryptoHash(ALGORITHMS.SHAKE256, normalizeInput(input), outputLength);
  }
}
