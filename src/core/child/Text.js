/**
 * Vexorion — Text Builder Class
 */

import { toUtf8 } from '../Codec.js';
import { ByteBuf } from './ByteBuf.js';
import { assertNonEmptyString } from '../String.js';

export class Text {
  /**
   * @param {string} str
   */
  constructor(str) {
    if (typeof str !== 'string') {
      throw new TypeError('Expected str to be a string');
    }
    this._str = str;
  }

  get value() {
    return this._str;
  }

  toBytes() {
    return new ByteBuf(toUtf8(this._str));
  }
}
