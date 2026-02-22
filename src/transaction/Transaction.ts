/**
 * Transaction builder and management
 */

import { Transaction as ITransaction, Slip, TransactionType } from '../types';
import { Wallet } from '../wallet/Wallet';

export class Transaction {
  public timestamp: number;
  public from: Slip[];
  public to: Slip[];
  public data: Uint8Array;
  public signature: string;
  public type: TransactionType;
  public txs_replacements: number;

  constructor() {
    this.timestamp = Date.now();
    this.from = [];
    this.to = [];
    this.data = new Uint8Array(0);
    this.signature = '';
    this.type = TransactionType.Normal;
    this.txs_replacements = 1;
  }

  /**
   * Add a recipient to the transaction
   */
  addTo(publicKey: string, amount: bigint): this {
    this.to.push({
      publicKey,
      amount,
      type: 0, // Normal slip
    });
    return this;
  }

  /**
   * Add a sender (input) to the transaction
   */
  addFrom(publicKey: string, amount: bigint): this {
    this.from.push({
      publicKey,
      amount,
      type: 0, // Normal slip
    });
    return this;
  }

  /**
   * Attach arbitrary data to the transaction
   */
  setData(data: any): this {
    if (typeof data === 'string') {
      this.data = Buffer.from(data, 'utf-8');
    } else if (data instanceof Uint8Array) {
      this.data = data;
    } else {
      this.data = Buffer.from(JSON.stringify(data), 'utf-8');
    }
    return this;
  }

  /**
   * Set message data (for module routing)
   */
  setMessage(msg: any): this {
    return this.setData(msg);
  }

  /**
   * Sign the transaction with a wallet
   */
  sign(wallet: Wallet): this {
    const buffer = this.serialize(false);
    this.signature = wallet.sign(buffer);
    return this;
  }

  /**
   * Serialize transaction to bytes
   */
  serialize(includeSignature = true): Uint8Array {
    // Simplified serialization - in production, match Saito's exact format
    const parts: Uint8Array[] = [];

    // Timestamp (8 bytes)
    const tsBuffer = Buffer.allocUnsafe(8);
    tsBuffer.writeBigUInt64BE(BigInt(this.timestamp));
    parts.push(tsBuffer);

    // From slips count (4 bytes)
    const fromCountBuffer = Buffer.allocUnsafe(4);
    fromCountBuffer.writeUInt32BE(this.from.length);
    parts.push(fromCountBuffer);

    // From slips
    for (const slip of this.from) {
      parts.push(this.serializeSlip(slip));
    }

    // To slips count (4 bytes)
    const toCountBuffer = Buffer.allocUnsafe(4);
    toCountBuffer.writeUInt32BE(this.to.length);
    parts.push(toCountBuffer);

    // To slips
    for (const slip of this.to) {
      parts.push(this.serializeSlip(slip));
    }

    // Data length (4 bytes)
    const dataLenBuffer = Buffer.allocUnsafe(4);
    dataLenBuffer.writeUInt32BE(this.data.length);
    parts.push(dataLenBuffer);

    // Data
    parts.push(this.data);

    // Type (1 byte)
    parts.push(Buffer.from([this.type]));

    // Signature (if included)
    if (includeSignature && this.signature) {
      parts.push(Buffer.from(this.signature, 'hex'));
    }

    // Concatenate all parts
    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }

    return result;
  }

  /**
   * Serialize a slip
   */
  private serializeSlip(slip: Slip): Uint8Array {
    const parts: Uint8Array[] = [];

    // Public key (32 bytes hex -> 32 bytes)
    parts.push(Buffer.from(slip.publicKey, 'hex'));

    // Amount (8 bytes)
    const amountBuffer = Buffer.allocUnsafe(8);
    amountBuffer.writeBigUInt64BE(slip.amount);
    parts.push(amountBuffer);

    // Type (1 byte)
    parts.push(Buffer.from([slip.type]));

    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }

    return result;
  }

  /**
   * Convert to JSON
   */
  toJSON(): ITransaction {
    return {
      timestamp: this.timestamp,
      from: this.from,
      to: this.to,
      data: this.data,
      signature: this.signature,
      type: this.type,
      txs_replacements: this.txs_replacements,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: ITransaction): Transaction {
    const tx = new Transaction();
    tx.timestamp = json.timestamp;
    tx.from = json.from;
    tx.to = json.to;
    tx.data = json.data;
    tx.signature = json.signature;
    tx.type = json.type || TransactionType.Normal;
    tx.txs_replacements = json.txs_replacements || 1;
    return tx;
  }
}
