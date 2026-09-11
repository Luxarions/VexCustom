# Vexorion

> Deterministic cryptographic primitives, sponge constructions, and data encoding toolkit with zero external runtime dependencies.

## Features

- **Pure JavaScript & Zero Runtime Dependencies**: High-performance Keccak-f[1600] and SHA-3 implementation.
- **Side-Channel Resistant**: Constant-time comparison, conditional byte selection, and bit-level assertions.
- **Crypto Agnostic**: Native `node:crypto` / `WebCrypto` speedups when available, seamless pure-JS fallback everywhere else.
- **Bitcoin/IPFS Base58**: High-performance base conversion preserving arbitrary leading zero bytes.
- **Fluent Builder Architecture**: Ergonomic `Vex` chaining API for bytes, digests, hex, text, signatures, and addresses.
- **Strict Error Hierarchy**: Fine-grained error classes for input validation, encoding, and crypto operations.

## Installation

```bash
npm install vexorion
```

## Quick Start

```javascript
import { Vex, Hash } from 'vexorion';

// 1. Fluent Builder
const hex = Vex.text('Hello World').toBytes().append('!').toHex();
console.log(hex);

// 2. High-Level Hashing
const digest = await Hash.sha3_256Hex('vexorion');
console.log(digest);
```

## Running Tests

```bash
npm test
npm run typecheck
```

## License

MIT
