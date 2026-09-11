/**
 * Vexorion — Digest Builder Class
 * Supports lazy calculation and chaining.
 */

import { hash } from '../Crypto.js';
import { toHex } from '../Codec.js';
import { assertUint8Array } from '../Utils.js';

export class Digest {
  /**
   * @param {string} algorithm
   * @param {Uint8Array} data
   */
  constructor(algorithm, data) {
    this._algorithm = algorithm;
    this._data = assertUint8Array(data, 'data');
    this._cached = null;
  }

  async run(outputLength) {
    if (!this._cached || outputLength !== undefined) {
      this._cached = await hash(this._algorithm, this._data, outputLength);
    }
    return this._cached;
  }

  async toHex(outputLength) {
    const d = await this.run(outputLength);
    return toHex(d);
  }
}
