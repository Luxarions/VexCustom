/**
 * Vexorion — Hex Builder Class
 */

import { fromHex, toHex } from '../Codec.js';
import { ByteBuf } from './ByteBuf.js';

export class Hex {
  /**
   * @param {string} hexStr
   */
  constructor(hexStr) {
    this._hex = hexStr;
  }

  get value() {
    return this._hex;
  }

  toBytes() {
    return new ByteBuf(fromHex(this._hex));
  }
}
