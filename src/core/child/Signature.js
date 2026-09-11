/**
 * Vexorion — Signature Builder Class
 */

import { toHex, fromHex, toBase64, fromBase64 } from '../Codec.js';
import { assertUint8Array } from '../Utils.js';

export class Signature {
  /**
   * @param {Uint8Array} raw
   */
  constructor(raw) {
    this._raw = assertUint8Array(raw, 'raw');
  }

  get raw() {
    return this._raw;
  }

  toHex() {
    return toHex(this._raw);
  }

  toBase64() {
    return toBase64(this._raw);
  }

  static fromHex(hex) {
    return new Signature(fromHex(hex));
  }

  static fromBase64(b64) {
    return new Signature(fromBase64(b64));
  }
}
