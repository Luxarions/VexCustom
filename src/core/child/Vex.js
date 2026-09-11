/**
 * Vexorion — Vex Universal Builder
 * Entry point for fluent, chainable operations.
 */

import { ByteBuf } from './ByteBuf.js';
import { Text } from './Text.js';
import { Hex } from './Hex.js';
import { Digest } from './Digest.js';
import { Address } from './Address.js';
import { Signature } from './Signature.js';

export class Vex {
  static bytes(data) {
    return ByteBuf.from(data);
  }

  static text(str) {
    return new Text(str);
  }

  static hex(hexStr) {
    return new Hex(hexStr);
  }

  static digest(algo, data) {
    return new Digest(algo, data);
  }

  static address(raw) {
    return new Address(raw);
  }

  static signature(raw) {
    return new Signature(raw);
  }
}
