/**
 * Wallet class for managing keys and signing transactions
 */

import { generateKeyPair, getPublicKey, isValidPrivateKey } from '../crypto';

export class Wallet {
  public publicKey: string;
  private privateKey: string;

  constructor(privateKey: string) {
    if (!isValidPrivateKey(privateKey)) {
      throw new Error('Invalid private key');
    }

    this.privateKey = privateKey;
    this.publicKey = getPublicKey(privateKey);
  }

  /**
   * Generate a new random wallet
   */
  static generate(): Wallet {
    const keyPair = generateKeyPair();
    return new Wallet(keyPair.privateKey);
  }

  /**
   * Create wallet from existing private key
   */
  static fromPrivateKey(privateKey: string): Wallet {
    return new Wallet(privateKey);
  }

  /**
   * Get the private key (use with caution)
   */
  getPrivateKey(): string {
    return this.privateKey;
  }

  /**
   * Get the public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Sign data with this wallet's private key
   */
  sign(data: Uint8Array): string {
    const nacl = require('tweetnacl');
    const privateKeyBytes = Buffer.from(this.privateKey, 'hex');
    const signature = nacl.sign.detached(data, privateKeyBytes);
    return Buffer.from(signature).toString('hex');
  }

  /**
   * Export wallet as JSON
   */
  toJSON(): { publicKey: string; privateKey: string } {
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    };
  }

  /**
   * Import wallet from JSON
   */
  static fromJSON(json: { privateKey: string }): Wallet {
    return new Wallet(json.privateKey);
  }
}
