/**
 * Vexorion — Bytes Wrapper Class
 * Fluent immutable helper around Uint8Array.
 */

import { assertUint8Array, cloneBytes, wipe } from './Utils.js';
import { toHex, fromHex, toUtf8, fromUtf8, toBase64, fromBase64 } from './Codec.js';
import { encodeBase58, decodeBase58 } from './Bs58.js';
import { timingSafeEqual } from './ConstantTime.js';

export class Bytes {
  /**
   * @param {Uint8Array} rawBytes
   */
  constructor(rawBytes) {
    assertUint8Array(rawBytes, 'rawBytes');
    this._bytes = cloneBytes(rawBytes);
  }

  get length() {
    return this._bytes.length;
  }

  get raw() {
    return cloneBytes(this._bytes);
  }

  static fromHex(hex) {
    return new Bytes(fromHex(hex));
  }

  static fromUtf8(str) {
    return new Bytes(toUtf8(str));
  }

  static fromBase64(b64) {
    return new Bytes(fromBase64(b64));
  }

  static fromBase58(b58) {
    return new Bytes(decodeBase58(b58));
  }

  static from(source) {
    if (source instanceof Bytes) {
      return new Bytes(source.raw);
    }
    if (source instanceof Uint8Array) {
      return new Bytes(source);
    }
    if (typeof source === 'string') {
      return Bytes.fromUtf8(source);
    }
    throw new TypeError('Unsupported source type for Bytes.from');
  }

  toHex() {
    return toHex(this._bytes);
  }

  toUtf8() {
    return fromUtf8(this._bytes);
  }

  toBase64() {
    return toBase64(this._bytes);
  }

  toBase58() {
    return encodeBase58(this._bytes);
  }

  equals(other) {
    if (!(other instanceof Bytes)) {
      return false;
    }
    return timingSafeEqual(this._bytes, other._bytes);
  }

  slice(start, end) {
    return new Bytes(this._bytes.slice(start, end));
  }

  wipe() {
    wipe(this._bytes);
  }
}
