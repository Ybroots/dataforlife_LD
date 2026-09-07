import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
const KEY_LENGTH = 64;
const FORMAT = 'scrypt-v1';
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function derive(password: string, salt: Buffer, keyLength: number, cost: number, blockSize: number, parallelization: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, {
      N: cost,
      r: blockSize,
      p: parallelization,
      maxmem: 64 * 1024 * 1024,
    }, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derive(password, salt, KEY_LENGTH, COST, BLOCK_SIZE, PARALLELIZATION);
  return `${FORMAT}$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [format, rawCost, rawBlockSize, rawParallelization, encodedSalt, encodedKey, extra] = encodedHash.split('$');
  if (format !== FORMAT || !rawCost || !rawBlockSize || !rawParallelization || !encodedSalt || !encodedKey || extra) return false;
  try {
    const cost = Number(rawCost);
    const blockSize = Number(rawBlockSize);
    const parallelization = Number(rawParallelization);
    if (cost !== COST || blockSize !== BLOCK_SIZE || parallelization !== PARALLELIZATION) return false;
    const salt = Buffer.from(encodedSalt, 'base64url');
    const expected = Buffer.from(encodedKey, 'base64url');
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, salt, expected.length, cost, blockSize, parallelization);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
