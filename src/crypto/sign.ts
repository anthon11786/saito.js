/**
 * Signing and verification utilities
 */

import * as nacl from 'tweetnacl';

/**
 * Sign data with a private key
 */
export function sign(data: Uint8Array, privateKey: string): string {
  const privateKeyBytes = Buffer.from(privateKey, 'hex');
  const signature = nacl.sign.detached(data, privateKeyBytes);
  return Buffer.from(signature).toString('hex');
}

/**
 * Verify a signature
 */
export function verify(
  data: Uint8Array,
  signature: string,
  publicKey: string
): boolean {
  try {
    const signatureBytes = Buffer.from(signature, 'hex');
    const publicKeyBytes = Buffer.from(publicKey, 'hex');
    return nacl.sign.detached.verify(data, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Sign a string message
 */
export function signMessage(message: string, privateKey: string): string {
  const data = Buffer.from(message, 'utf-8');
  return sign(data, privateKey);
}

/**
 * Verify a string message signature
 */
export function verifyMessage(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  const data = Buffer.from(message, 'utf-8');
  return verify(data, signature, publicKey);
}
