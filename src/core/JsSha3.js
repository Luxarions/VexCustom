/**
 * Vexorion — Pure JavaScript Keccak / SHA-3 / SHAKE Permutation
 * Based on Keccak-f[1600] state permutation.
 * Implements 64-bit lane math via high/low 32-bit pairs for maximum portability.
 */

import { assertUint8Array, alloc } from './Utils.js';
import { CryptoError } from './Errors.js';

// Round constants (24 rounds) as [low, high] pairs of 32-bit words
const RC = [
  [0x00000001, 0x00000000], [0x00008082, 0x00000000],
  [0x0000808a, 0x80000000], [0x80008000, 0x80000000],
  [0x0000808b, 0x00000000], [0x80000001, 0x00000000],
  [0x80008081, 0x80000000], [0x00008009, 0x80000000],
  [0x0000008a, 0x00000000], [0x00000088, 0x00000000],
  [0x80008009, 0x00000000], [0x8000000a, 0x00000000],
  [0x8000808b, 0x00000000], [0x0000008b, 0x80000000],
  [0x00008089, 0x80000000], [0x00008003, 0x80000000],
  [0x00008002, 0x80000000], [0x00000080, 0x80000000],
  [0x0000800a, 0x00000000], [0x8000000a, 0x80000000],
  [0x80008081, 0x80000000], [0x00008080, 0x80000000],
  [0x80000001, 0x00000000], [0x80008008, 0x80000000],
];

// Rotation offsets for each lane (x, y)
const RHO_OFFSETS = [
   0,  1, 62, 28, 27,
  36, 44,  6, 55, 20,
   3, 10, 43, 25, 39,
  41, 45, 15, 21,  8,
  18,  2, 61, 56, 14,
];

// Pi permutation indices
const PI_INDICES = [
   0, 10, 20,  5, 15,
  16,  1, 11, 21,  6,
   7, 17,  2, 12, 22,
  23,  8, 18,  3, 13,
  14, 24,  9, 19,  4,
];

function rotl64(low, high, offset) {
  offset %= 64;
  if (offset === 0) return [low, high];
  if (offset === 32) return [high, low];
  if (offset < 32) {
    const nLow  = (low  << offset) | (high >>> (32 - offset));
    const nHigh = (high << offset) | (low  >>> (32 - offset));
    return [nLow >>> 0, nHigh >>> 0];
  }
  const nOffset = offset - 32;
  const nLow  = (high << nOffset) | (low  >>> (32 - nOffset));
  const nHigh = (low  << nOffset) | (high >>> (32 - nOffset));
  return [nLow >>> 0, nHigh >>> 0];
}

/**
 * Keccak-f[1600] permutation operating on 25 lanes (represented as 50 x 32-bit integers).
 * @param {Uint32Array} state - 50 elements (25 lanes * [low, high])
 */
export function keccakF1600(state) {
  const C_low  = new Uint32Array(5);
  const C_high = new Uint32Array(5);
  const D_low  = new Uint32Array(5);
  const D_high = new Uint32Array(5);
  const B_low  = new Uint32Array(25);
  const B_high = new Uint32Array(25);

  for (let round = 0; round < 24; round++) {
    // 1. Theta step
    for (let x = 0; x < 5; x++) {
      C_low[x]  = state[2 * x]      ^ state[2 * (x + 5)]  ^ state[2 * (x + 10)]  ^ state[2 * (x + 15)]  ^ state[2 * (x + 20)];
      C_high[x] = state[2 * x + 1]  ^ state[2 * (x + 5) + 1] ^ state[2 * (x + 10) + 1] ^ state[2 * (x + 15) + 1] ^ state[2 * (x + 20) + 1];
    }
    for (let x = 0; x < 5; x++) {
      const [rLow, rHigh] = rotl64(C_low[(x + 1) % 5], C_high[(x + 1) % 5], 1);
      D_low[x]  = C_low[(x + 4) % 5]  ^ rLow;
      D_high[x] = C_high[(x + 4) % 5] ^ rHigh;
    }
    for (let i = 0; i < 25; i++) {
      const x = i % 5;
      state[2 * i]     ^= D_low[x];
      state[2 * i + 1] ^= D_high[x];
    }

    // 2. Rho and Pi steps
    for (let i = 0; i < 25; i++) {
      const [rLow, rHigh] = rotl64(
        state[2 * i],
        state[2 * i + 1],
        RHO_OFFSETS[i]
      );
      const piIdx = PI_INDICES[i];
      B_low[piIdx]  = rLow;
      B_high[piIdx] = rHigh;
    }

    // 3. Chi step
    for (let y = 0; y < 5; y++) {
      const base = 5 * y;
      for (let x = 0; x < 5; x++) {
        const i  = base + x;
        const i1 = base + ((x + 1) % 5);
        const i2 = base + ((x + 2) % 5);
        state[2 * i]     = B_low[i]  ^ ((~B_low[i1])  & B_low[i2]);
        state[2 * i + 1] = B_high[i] ^ ((~B_high[i1]) & B_high[i2]);
      }
    }

    // 4. Iota step
    const [rcLow, rcHigh] = RC[round];
    state[0] ^= rcLow;
    state[1] ^= rcHigh;
  }
}

/**
 * Sponge construction for Keccak/SHA-3/SHAKE.
 * @param {Uint8Array} msg - Input byte array
 * @param {number} rateBits - Rate in bits (e.g. 1088 for SHA3-256)
 * @param {number} outputBytes - Length of output in bytes
 * @param {number} delimitedSuffix - Suffix bits (0x06 for SHA-3, 0x01 for Keccak, 0x1F for SHAKE)
 * @returns {Uint8Array}
 */
export function sponge(msg, rateBits, outputBytes, delimitedSuffix) {
  assertUint8Array(msg, 'msg');
  if (rateBits <= 0 || rateBits % 8 !== 0 || rateBits > 1600) {
    throw new CryptoError(`Invalid rate in bits: ${rateBits}`, 'sponge');
  }

  const rateBytes = rateBits / 8;
  // State: 25 lanes of 64 bits = 50 uint32s = 200 bytes
  const state = new Uint32Array(50);
  const stateBytes = new Uint8Array(state.buffer);

  let offset = 0;
  const len = msg.length;

  // Absorb complete blocks
  while (len - offset >= rateBytes) {
    for (let i = 0; i < rateBytes; i++) {
      stateBytes[i] ^= msg[offset + i];
    }
    keccakF1600(state);
    offset += rateBytes;
  }

  // Absorb remainder and apply multi-rate padding pad10*1
  const remainder = len - offset;
  for (let i = 0; i < remainder; i++) {
    stateBytes[i] ^= msg[offset + i];
  }

  // Delimited suffix + pad bit 1
  stateBytes[remainder] ^= delimitedSuffix;

  // Final pad bit (MSB of rate block)
  stateBytes[rateBytes - 1] ^= 0x80;

  // Final absorption round
  keccakF1600(state);

  // Squeeze phase
  const output = alloc(outputBytes);
  let squeezed = 0;

  while (squeezed < outputBytes) {
    const toCopy = Math.min(rateBytes, outputBytes - squeezed);
    output.set(stateBytes.subarray(0, toCopy), squeezed);
    squeezed += toCopy;
    if (squeezed < outputBytes) {
      keccakF1600(state);
    }
  }

  return output;
}
