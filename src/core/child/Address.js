/**
 * Vexorion — Address Builder Class
 */

import { encodeBase58, decodeBase58 } from '../Bs58.js';
import { toHex, fromHex } from '../Codec.js';
import { assertUint8Array } from '../Utils.js';

export class Address {
  /**
   * @param {Uint8Array} raw
   */
  constructor(raw) {
    this._raw = assertUint8Array(raw, 'raw');
  }

  toBase58() {
    return encodeBase58(this._raw);
  }

  toHex() {
    return toHex(this._raw);
  }

  static fromBase58(str) {
    return new Address(decodeBase58(str));
  }

  static fromHex(hex) {
    return new Address(fromHex(hex));
  }
}
