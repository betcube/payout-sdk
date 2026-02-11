import { describe, it, expect } from 'vitest';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import { signXml } from '../src/core/signature';
import type { HashAlgorithm } from '../src/interfaces/common.types';

function generateTestKeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'pkcs1', format: 'der' },
    privateKeyEncoding: { type: 'pkcs1', format: 'der' },
  });
  return { privateKey, publicKey };
}

const ALGORITHM_MAP: Record<HashAlgorithm, string> = {
  md5: 'RSA-MD5',
  sha1: 'RSA-SHA1',
  sha256: 'RSA-SHA256',
};

describe('signXml', () => {
  const { privateKey, publicKey } = generateTestKeyPair();
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?><request><action id="Agents.getBalance" /></request>';

  it.each(['md5', 'sha1', 'sha256'] as HashAlgorithm[])(
    'produces a valid base64 RSA signature with %s',
    (alg) => {
      const signature = signXml(xml, privateKey, alg);

      expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);

      const verifier = createVerify(ALGORITHM_MAP[alg]);
      verifier.update(xml);
      verifier.end();
      const isValid = verifier.verify(
        { key: publicKey, format: 'der', type: 'pkcs1' },
        Buffer.from(signature, 'base64'),
      );
      expect(isValid).toBe(true);
    },
  );

  it('produces different signatures for different XML content', () => {
    const sig1 = signXml(xml, privateKey, 'sha256');
    const sig2 = signXml(xml + '<extra/>', privateKey, 'sha256');
    expect(sig1).not.toBe(sig2);
  });

  it('produces different signatures with different keys', () => {
    const { privateKey: otherKey } = generateTestKeyPair();
    const sig1 = signXml(xml, privateKey, 'sha256');
    const sig2 = signXml(xml, otherKey, 'sha256');
    expect(sig1).not.toBe(sig2);
  });
});
