/**
 * Vexorion — Constants
 * Freezes all exported constant objects at runtime.
 */

export const ALGORITHMS = Object.freeze({
  SHA3_224: 'sha3-224',
  SHA3_256: 'sha3-256',
  SHA3_384: 'sha3-384',
  SHA3_512: 'sha3-512',
  KECCAK_224: 'keccak-224',
  KECCAK_256: 'keccak-256',
  KECCAK_384: 'keccak-384',
  KECCAK_512: 'keccak-512',
  SHAKE128:   'shake128',
  SHAKE256:   'shake256',
});

export const HASH_OUTPUT_SIZES = Object.freeze({
  [ALGORITHMS.SHA3_224]:   28,
  [ALGORITHMS.SHA3_256]:   32,
  [ALGORITHMS.SHA3_384]:   48,
  [ALGORITHMS.SHA3_512]:   64,
  [ALGORITHMS.KECCAK_224]: 28,
  [ALGORITHMS.KECCAK_256]: 32,
  [ALGORITHMS.KECCAK_384]: 48,
  [ALGORITHMS.KECCAK_512]: 64,
});

export const RATE_BITS = Object.freeze({
  [ALGORITHMS.SHA3_224]:   1152,
  [ALGORITHMS.SHA3_256]:   1088,
  [ALGORITHMS.SHA3_384]:    832,
  [ALGORITHMS.SHA3_512]:    576,
  [ALGORITHMS.KECCAK_224]: 1152,
  [ALGORITHMS.KECCAK_256]: 1088,
  [ALGORITHMS.KECCAK_384]:  832,
  [ALGORITHMS.KECCAK_512]:  576,
  [ALGORITHMS.SHAKE128]:   1344,
  [ALGORITHMS.SHAKE256]:   1088,
});

export const DELIMITED_SUFFIX = Object.freeze({
  SHA3:   0x06,
  KECCAK: 0x01,
  RAW_SHAKE: 0x1f,
  SHAKE:  0x1f,
});

export const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const HEX_REGEX = /^[0-9a-fA-F]*$/;
export const HEX_STRICT_REGEX = /^(?:[0-9a-fA-F]{2})*$/;
