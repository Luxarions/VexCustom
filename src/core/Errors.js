/**
 * Vexorion — Custom Error Hierarchy
 */

export class VexorionError extends Error {
  /**
   * @param {string} message
   * @param {string} [code='VEX_GENERIC']
   */
  constructor(message, code = 'VEX_GENERIC') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends VexorionError {
  /**
   * @param {string} message
   * @param {string} [field]
   */
  constructor(message, field) {
    super(message, 'VEX_VALIDATION_ERROR');
    this.field = field;
  }
}

export class EncodingError extends VexorionError {
  /**
   * @param {string} message
   * @param {string} [encoding]
   */
  constructor(message, encoding) {
    super(message, 'VEX_ENCODING_ERROR');
    this.encoding = encoding;
  }
}

export class CryptoError extends VexorionError {
  /**
   * @param {string} message
   * @param {string} [operation]
   */
  constructor(message, operation) {
    super(message, 'VEX_CRYPTO_ERROR');
    this.operation = operation;
  }
}

export class RangeError extends VexorionError {
  /**
   * @param {string} message
   * @param {number} [min]
   * @param {number} [max]
   */
  constructor(message, min, max) {
    super(message, 'VEX_RANGE_ERROR');
    this.min = min;
    this.max = max;
  }
}
