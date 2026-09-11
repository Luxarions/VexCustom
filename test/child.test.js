/**
 * Test: Fluent Child & Builder Architecture
 */

import { Vex } from '../src/core/child/Vex.js';
import { assert, assertEqual, assertDeepEqual } from './_assert.js';

async function run() {
  console.log('Testing fluent Vex builder API...');

  // 1. Vex.text -> ByteBuf -> Hex
  const t = Vex.text('vexorion');
  const buf = t.toBytes();
  assertEqual(buf.toHex(), '7665786f72696f6e');

  // 2. Append in ByteBuf
  const appended = buf.append('!');
  assertEqual(appended.toUtf8(), 'vexorion!');

  // 3. Vex.hex -> ByteBuf
  const h = Vex.hex('deadbeef');
  assertDeepEqual(h.toBytes().raw, new Uint8Array([0xde, 0xad, 0xbe, 0xef]));

  // 4. Vex.digest (lazy & caching)
  const dig = Vex.digest('sha3-256', new Uint8Array([1, 2, 3]));
  const resHex1 = await dig.toHex();
  const resHex2 = await dig.toHex();
  assertEqual(resHex1, resHex2);

  // 5. Vex.address
  const addr = Vex.address(new Uint8Array([0, 1, 2, 3]));
  const b58 = addr.toBase58();
  const recovered = Vex.address(new Uint8Array([0, 1, 2, 3]));
  assertEqual(b58, recovered.toBase58());

  console.log('✓ All fluent builder tests passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
