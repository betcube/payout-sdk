import type { HashAlgorithm } from '../interfaces/common.types';
/**
 * Sign an XML string with an RSA private key in DER format (PKCS#1).
 *
 * Replicates PHP:
 *   cat xml | openssl dgst -<alg> -binary -keyform DER -sign secret.key | openssl base64 -A
 */
export declare function signXml(xml: string, derPrivateKey: Buffer, algorithm: HashAlgorithm): string;
//# sourceMappingURL=signature.d.ts.map