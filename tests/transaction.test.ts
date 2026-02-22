import { Transaction } from '../src/transaction/Transaction';
import { Wallet } from '../src/wallet/Wallet';
import { TransactionType } from '../src/types';

describe('Transaction', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = Wallet.generate();
  });

  describe('constructor', () => {
    it('should create empty transaction with defaults', () => {
      const tx = new Transaction();

      expect(tx.from).toEqual([]);
      expect(tx.to).toEqual([]);
      expect(tx.data.length).toBe(0);
      expect(tx.signature).toBe('');
      expect(tx.type).toBe(TransactionType.Normal);
      expect(tx.timestamp).toBeGreaterThan(0);
    });
  });

  describe('addTo', () => {
    it('should add recipient to transaction', () => {
      const tx = new Transaction();
      const recipientKey = 'abc123';
      const amount = 1000000n;

      tx.addTo(recipientKey, amount);

      expect(tx.to.length).toBe(1);
      expect(tx.to[0].publicKey).toBe(recipientKey);
      expect(tx.to[0].amount).toBe(amount);
    });

    it('should allow chaining', () => {
      const tx = new Transaction();

      const result = tx
        .addTo('recipient1', 100n)
        .addTo('recipient2', 200n);

      expect(result).toBe(tx);
      expect(tx.to.length).toBe(2);
    });
  });

  describe('addFrom', () => {
    it('should add sender to transaction', () => {
      const tx = new Transaction();
      const senderKey = wallet.publicKey;
      const amount = 1000000n;

      tx.addFrom(senderKey, amount);

      expect(tx.from.length).toBe(1);
      expect(tx.from[0].publicKey).toBe(senderKey);
      expect(tx.from[0].amount).toBe(amount);
    });
  });

  describe('setData', () => {
    it('should set data from string', () => {
      const tx = new Transaction();
      const message = 'Hello, Saito!';

      tx.setData(message);

      expect(tx.data).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(tx.data).toString('utf-8')).toBe(message);
    });

    it('should set data from Uint8Array', () => {
      const tx = new Transaction();
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      tx.setData(data);

      expect(tx.data).toBe(data);
    });

    it('should set data from object (JSON)', () => {
      const tx = new Transaction();
      const obj = { module: 'Chat', message: 'Hello!' };

      tx.setData(obj);

      const parsed = JSON.parse(Buffer.from(tx.data).toString('utf-8'));
      expect(parsed).toEqual(obj);
    });
  });

  describe('sign', () => {
    it('should sign transaction with wallet', () => {
      const tx = new Transaction()
        .addTo('recipient', 1000n)
        .addFrom(wallet.publicKey, 1000n);

      tx.sign(wallet);

      expect(tx.signature).toBeDefined();
      expect(tx.signature.length).toBe(128);
    });

    it('should allow chaining', () => {
      const tx = new Transaction();
      const result = tx.sign(wallet);

      expect(result).toBe(tx);
    });
  });

  describe('serialize', () => {
    it('should serialize transaction to bytes', () => {
      const tx = new Transaction()
        .addTo('recipient-key', 1000n)
        .addFrom(wallet.publicKey, 1000n)
        .setData('test message');

      const serialized = tx.serialize(false);

      expect(serialized).toBeInstanceOf(Uint8Array);
      expect(serialized.length).toBeGreaterThan(0);
    });

    it('should include signature when requested', () => {
      const tx = new Transaction()
        .addTo('recipient-key', 1000n)
        .sign(wallet);

      const withoutSig = tx.serialize(false);
      const withSig = tx.serialize(true);

      expect(withSig.length).toBeGreaterThan(withoutSig.length);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('should serialize and deserialize transaction', () => {
      const tx1 = new Transaction()
        .addTo('recipient', 1000n)
        .addFrom(wallet.publicKey, 1000n)
        .setData({ message: 'test' })
        .sign(wallet);

      const json = tx1.toJSON();
      const tx2 = Transaction.fromJSON(json);

      expect(tx2.timestamp).toBe(tx1.timestamp);
      expect(tx2.to).toEqual(tx1.to);
      expect(tx2.from).toEqual(tx1.from);
      expect(tx2.signature).toBe(tx1.signature);
      expect(tx2.type).toBe(tx1.type);
    });
  });

  describe('complete transaction flow', () => {
    it('should create, sign, and serialize a payment transaction', () => {
      const recipientWallet = Wallet.generate();

      const tx = new Transaction()
        .addFrom(wallet.publicKey, 1000000n)
        .addTo(recipientWallet.publicKey, 1000000n)
        .setData({
          module: 'Payment',
          note: 'Test payment',
        })
        .sign(wallet);

      expect(tx.from.length).toBe(1);
      expect(tx.to.length).toBe(1);
      expect(tx.signature).toBeDefined();

      const serialized = tx.serialize();
      expect(serialized.length).toBeGreaterThan(0);
    });
  });
});
