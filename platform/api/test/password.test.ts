import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/password.js';

describe('password hashing', () => {
  it('stores a salted scrypt hash and verifies only the original password', async () => {
    const first = await hashPassword('CongDan@2026');
    const second = await hashPassword('CongDan@2026');
    expect(first).toMatch(/^scrypt-v1\$/);
    expect(first).not.toBe(second);
    await expect(verifyPassword('CongDan@2026', first)).resolves.toBe(true);
    await expect(verifyPassword('sai-mat-khau', first)).resolves.toBe(false);
    await expect(verifyPassword('CongDan@2026', 'not-a-hash')).resolves.toBe(false);
  });
});
