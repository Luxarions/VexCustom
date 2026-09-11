/**
 * Vexorion — ByteBuf Builder Class
 */

import { Bytes } from '../Bytes.js';
import { assertUint8Array } from '../Utils.js';
import { fromHex, toHex, toUtf8, fromUtf8 } from '../Codec.js';

export class ByteBuf extends Bytes {
  /**
   * Appends more bytes and returns a new ByteBuf.
   * @param {Uint8Array|Bytes|string} item
   * @returns {ByteBuf}
   */
  append(item) {
    let toAppend;
    if (typeof item === 'string') {
      toAppend = toUtf8(item);
    } else if (item instanceof Bytes) {
      toAppend = item.raw;
    } else {
      toAppend = assertUint8Array(item, 'item');
    }

    const merged = new Uint8Array(this._bytes.length + toAppend.length);
    merged.set(this._bytes, 0);
    merged.set(toAppend, this._bytes.length);
    return new ByteBuf(merged);
  }

  static from(source) {
    if (source instanceof ByteBuf) {
      return new ByteBuf(source.raw);
    }
    const b = Bytes.from(source);
    return new ByteBuf(b.raw);
  }
}
