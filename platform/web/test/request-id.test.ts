import { afterEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createRequestId } from '../src/request-id';

afterEach(() => vi.unstubAllGlobals());

describe('request IDs on HTTPS and HTTP', () => {
  it('uses the native UUID implementation with the correct receiver', () => {
    const native = { randomUUID() { expect(this).toBe(native); return 'native-uuid'; } };
    vi.stubGlobal('crypto', native);
    expect(createRequestId()).toBe('native-uuid');
  });

  it('sets UUID v4 version and variant bits without randomUUID', () => {
    const fallback = { getRandomValues(bytes: Uint8Array) {
      expect(this).toBe(fallback);
      return bytes.fill(255);
    } };
    vi.stubGlobal('crypto', fallback);
    expect(createRequestId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('pads zero bytes and sets version and variant bits', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => bytes.fill(0) });
    expect(createRequestId()).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('generates distinct valid IDs using real random bytes on the HTTP path', () => {
    vi.stubGlobal('crypto', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) });
    const ids = Array.from({ length: 1000 }, createRequestId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
  });

  it('does not silently use weak randomness when Web Crypto is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(createRequestId).toThrow();
  });
});
