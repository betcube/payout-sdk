"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signXml = signXml;
const node_crypto_1 = require("node:crypto");
const ALGORITHM_MAP = {
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
function signXml(xml, derPrivateKey, algorithm) {
    const signer = (0, node_crypto_1.createSign)(ALGORITHM_MAP[algorithm]);
    signer.update(xml);
    signer.end();
    const signature = signer.sign({
        key: derPrivateKey,
        format: 'der',
        type: 'pkcs1',
    });
    return signature.toString('base64');
}
//# sourceMappingURL=signature.js.map