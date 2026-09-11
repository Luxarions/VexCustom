/**
 * Vexorion — Cryptographically Secure Random Generation
 * Platform-independent: works in Node.js, Web Browsers, and Web Workers.
 */

import { CryptoError, RangeError } from './Errors.js';
import { assertInteger, alloc } from './Utils.js';

let _cryptoInstance = null;

async function getCrypto() {
  if (_cryptoInstance) return _cryptoInstance;

  // 1. Browser / Web Worker standard
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    _cryptoInstance = globalThis.crypto;
    return _cryptoInstance;
  }

  // 2. Node.js dynamic import fallback
  try {
    const nodeCrypto = await import('node:crypto');
    _cryptoInstance = nodeCrypto.webcrypto ?? nodeCrypto;
    return _cryptoInstance;
  } catch {
    // 3. Last-ditch: legacy global require if available
    try {
      // @ts-ignore
      const reqCrypto = typeof require !== 'undefined' ? require('crypto') : null;
      if (reqCrypto) {
        _cryptoInstance = reqCrypto.webcrypto ?? reqCrypto;
        return _cryptoInstance;
      }
    } catch {}
  }

  throw new CryptoError(
    'No cryptographically secure random number generator is available in this environment.',
    'randomBytes'
  );
}

/**
 * Generates an array of cryptographically secure pseudorandom bytes.
 * Handles buffers larger than 65,536 bytes by chunking (browser limit).
 * @param {number} length - Number of bytes to generate
 * @returns {Promise<Uint8Array>}
 */
export async function randomBytes(length) {
  assertInteger(length, 'length');
  if (length === 0) return alloc(0);

  const crypto = await getCrypto();
  const result = alloc(length);

  // Browser crypto.getRandomValues has a 65536 byte quota per call
  const MAX_CHUNK = 65536;

  if (typeof crypto.getRandomValues === 'function') {
    for (let offset = 0; offset < length; offset += MAX_CHUNK) {
      const chunkSize = Math.min(length - offset, MAX_CHUNK);
      const chunk = new Uint8Array(result.buffer, result.byteOffset + offset, chunkSize);
      crypto.getRandomValues(chunk);
    }
  } else if (typeof crypto.randomFillSync === 'function') {
    crypto.randomFillSync(result);
  } else {
    throw new CryptoError('Unable to generate random bytes: unsupported crypto interface.', 'randomBytes');
  }

  return result;
}

/**
 * Generates a random integer within [min, max) using rejection sampling
 * to eliminate modulo bias.
 * @param {number} min - Inclusive lower bound
 * @param {number} max - Exclusive upper bound
 * @returns {Promise<number>}
 */
export async function randomInt(min, max) {
  if (!Number.isSafeInteger(min)) {
    throw new RangeError(`min must be a safe integer, got ${min}`, min, max);
  }
  if (!Number.isSafeInteger(max)) {
    throw new RangeError(`max must be a safe integer, got ${max}`, min, max);
  }
  if (min >= max) {
    throw new RangeError(`min (${min}) must be strictly less than max (${max})`, min, max);
  }

  const range = max - min;
  if (range <= 0 || range > 0xffffffff) {
    throw new RangeError('Range exceeds 32-bit unsigned integer maximum', min, max);
  }

  // Rejection sampling to avoid modulo bias
  const maxUint32 = 0x100000000;
  const limit = maxUint32 - (maxUint32 % range);

  while (true) {
    const bytes = await randomBytes(4);
    const value = (
      (bytes[0] << 24) |
      (bytes[1] << 16) |
      (bytes[2] << 8)  |
       bytes[3]
    ) >>> 0;

    if (value < limit) {
      return min + (value % range);
    }
  }
}
