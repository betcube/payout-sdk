import { createSign } from 'node:crypto';
import type { HashAlgorithm } from '../interfaces/common.types';

const ALGORITHM_MAP: Record<HashAlgorithm, string> = {
  md5: 'RSA-MD5',
  sha1: 'RSA-SHA1',
  sha256: 'RSA-SHA256',
};

/**
 * Sign an XML string with an RSA private key in DER format (PKCS#1).
 *
 * Replicates PHP:
 *   cat xml | openssl dgst -<alg> -binary -keyform DER -sign secret.key | openssl base64 -A
 */
export function signXml(
  xml: string,
  derPrivateKey: Buffer,
  algorithm: HashAlgorithm,
): string {
  const signer = createSign(ALGORITHM_MAP[algorithm]);
  signer.update(xml);
  signer.end();

  const signature = signer.sign({
    key: derPrivateKey,
    format: 'der',
    type: 'pkcs1',
  });

  return signature.toString('base64');
}
