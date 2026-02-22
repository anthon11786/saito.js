import * as Base58 from 'base-58';

/**
 * Converts base58 string to hex string
 */
export function fromBase58(base58String: string): string {
  return Buffer.from(Base58.decode(base58String)).toString('hex');
}

/**
 * Converts hex string to base58 string
 */
export function toBase58(hexString: string): string {
  return Base58.encode(Buffer.from(hexString, 'hex'));
}

/**
 * Checks if a string is valid base58
 */
export function isBase58(str: string): boolean {
  return /^[A-HJ-NP-Za-km-z1-9]+$/.test(str);
}

/**
 * Checks if a string is a valid public key (either hex or base58)
 */
export function isPublicKey(key: string): boolean {
  // Hex format: 64 characters, 0-9a-fA-F
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return true;
  }

  // Base58 format: typically 43-44 characters
  if (isBase58(key) && key.length >= 32 && key.length <= 44) {
    return true;
  }

  return false;
}
