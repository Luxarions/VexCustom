/**
 * Minimal zero-dependency assert utility for Vexorion tests.
 */

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}", but got "${actual}"`);
  }
}

export function assertDeepEqual(a, b, message) {
  if (a instanceof Uint8Array && b instanceof Uint8Array) {
    if (a.length !== b.length) {
      throw new Error(message || `Byte array lengths differ: ${a.length} vs ${b.length}`);
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        throw new Error(message || `Mismatch at byte ${i}: ${a[i]} !== ${b[i]}`);
      }
    }
    return;
  }

  const strA = JSON.stringify(a);
  const strB = JSON.stringify(b);
  if (strA !== strB) {
    throw new Error(message || `Expected ${strB}, got ${strA}`);
  }
}

export function assertThrows(fn, expectedErrorClass, message) {
  let thrown = false;
  try {
    fn();
  } catch (err) {
    thrown = true;
    if (expectedErrorClass && !(err instanceof expectedErrorClass)) {
      throw new Error(
        `Expected error of class ${expectedErrorClass.name}, but caught ${err.constructor.name}: ${err.message}`
      );
    }
  }
  if (!thrown) {
    throw new Error(message || `Expected function to throw, but it returned normally.`);
  }
}

export async function assertThrowsAsync(fn, expectedErrorClass, message) {
  let thrown = false;
  try {
    await fn();
  } catch (err) {
    thrown = true;
    if (expectedErrorClass && !(err instanceof expectedErrorClass)) {
      throw new Error(
        `Expected error of class ${expectedErrorClass.name}, but caught ${err.constructor.name}: ${err.message}`
      );
    }
  }
  if (!thrown) {
    throw new Error(message || `Expected async function to throw, but it resolved normally.`);
  }
}
