/**
 * Cryptographic key generation and management
 */

import * as nacl from 'tweetnacl';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a new Ed25519 key pair
 */
export function generateKeyPair(): KeyPair {
  const keyPair = nacl.sign.keyPair();

  return {
    publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
  };
}

/**
 * Derive public key from private key
 */
export function getPublicKey(privateKey: string): string {
  const privateKeyBytes = Buffer.from(privateKey, 'hex');
  const keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);
  return Buffer.from(keyPair.publicKey).toString('hex');
}

/**
 * Validate a public key
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    const bytes = Buffer.from(publicKey, 'hex');
    return bytes.length === 32;
  } catch {
    return false;
  }
}

/**
 * Validate a private key
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    const bytes = Buffer.from(privateKey, 'hex');
    return bytes.length === 64;
  } catch {
    return false;
  }
}
