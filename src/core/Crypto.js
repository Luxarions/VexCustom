/**
 * Vexorion — Cryptographic Primitives Dispatcher
 * Automatically uses WebCrypto or Node.js native crypto when available,
 * gracefully falling back to pure JavaScript (JsSha3.js).
 */

import { ALGORITHMS, RATE_BITS, DELIMITED_SUFFIX, HASH_OUTPUT_SIZES } from './Constants.js';
import { sponge } from './JsSha3.js';
import { assertUint8Array, alloc } from './Utils.js';
import { CryptoError } from './Errors.js';

let _nodeCrypto = null;
let _nodeCryptoChecked = false;

async function getNodeCrypto() {
  if (_nodeCryptoChecked) return _nodeCrypto;
  _nodeCryptoChecked = true;
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      _nodeCrypto = await import('node:crypto');
    } catch {
      _nodeCrypto = null;
    }
  }
  return _nodeCrypto;
}

/**
 * Computes a cryptographic hash across supported algorithms.
 * @param {string} algorithm - One of ALGORITHMS
 * @param {Uint8Array} data - Input data
 * @param {number} [outputLength] - For XOF (SHAKE) functions
 * @returns {Promise<Uint8Array>}
 */
export async function hash(algorithm, data, outputLength) {
  assertUint8Array(data, 'data');

  const supported = Object.values(ALGORITHMS);
  if (!supported.includes(algorithm)) {
    throw new CryptoError(`Unsupported algorithm: ${algorithm}`, 'hash');
  }

  // 1. Check Node.js native crypto for standard SHA3
  const nodeCrypto = await getNodeCrypto();
  if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
    // Map standard SHA3 algorithms to Node's OpenSSL names
    const nodeNameMap = {
      [ALGORITHMS.SHA3_224]: 'sha3-224',
      [ALGORITHMS.SHA3_256]: 'sha3-256',
      [ALGORITHMS.SHA3_384]: 'sha3-384',
      [ALGORITHMS.SHA3_512]: 'sha3-512',
      [ALGORITHMS.SHAKE128]: 'shake128',
      [ALGORITHMS.SHAKE256]: 'shake256',
    };

    const mapped = nodeNameMap[algorithm];
    if (mapped) {
      try {
        if (algorithm === ALGORITHMS.SHAKE128 || algorithm === ALGORITHMS.SHAKE256) {
          const outLen = outputLength ?? (algorithm === ALGORITHMS.SHAKE128 ? 32 : 64);
          const h = nodeCrypto.createHash(mapped, { outputLength: outLen });
          h.update(data);
          return new Uint8Array(h.digest());
        } else {
          const h = nodeCrypto.createHash(mapped);
          h.update(data);
          return new Uint8Array(h.digest());
        }
      } catch {
        // Fall back to pure JS if native crypto throws or doesn't support the algo
      }
    }
  }

  // 2. Pure JS fallback via sponge & Keccak-f[1600]
  const rateBits = RATE_BITS[algorithm];
  let suffix = DELIMITED_SUFFIX.SHA3;

  if (algorithm.startsWith('keccak')) {
    suffix = DELIMITED_SUFFIX.KECCAK;
  } else if (algorithm.startsWith('shake')) {
    suffix = DELIMITED_SUFFIX.SHAKE;
  }

  const outBytes = outputLength ?? HASH_OUTPUT_SIZES[algorithm];
  if (!outBytes || outBytes <= 0) {
    throw new CryptoError(`Output length must be specified for algorithm ${algorithm}`, 'hash');
  }

  return sponge(data, rateBits, outBytes, suffix);
}
