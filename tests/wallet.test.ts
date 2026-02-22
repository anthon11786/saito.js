import { Wallet } from '../src/wallet/Wallet';

describe('Wallet', () => {
  describe('generate', () => {
    it('should generate a new wallet with valid keys', () => {
      const wallet = Wallet.generate();

      expect(wallet.publicKey).toBeDefined();
      expect(wallet.publicKey.length).toBe(64); // 32 bytes hex
      expect(wallet.getPrivateKey()).toBeDefined();
      expect(wallet.getPrivateKey().length).toBe(128); // 64 bytes hex
    });

    it('should generate unique wallets', () => {
      const wallet1 = Wallet.generate();
      const wallet2 = Wallet.generate();

      expect(wallet1.publicKey).not.toBe(wallet2.publicKey);
      expect(wallet1.getPrivateKey()).not.toBe(wallet2.getPrivateKey());
    });
  });

  describe('fromPrivateKey', () => {
    it('should create wallet from valid private key', () => {
      const wallet1 = Wallet.generate();
      const privateKey = wallet1.getPrivateKey();

      const wallet2 = Wallet.fromPrivateKey(privateKey);

      expect(wallet2.publicKey).toBe(wallet1.publicKey);
      expect(wallet2.getPrivateKey()).toBe(wallet1.getPrivateKey());
    });

    it('should throw error for invalid private key', () => {
      expect(() => {
        Wallet.fromPrivateKey('invalid-key');
      }).toThrow('Invalid private key');
    });

    it('should throw error for empty private key', () => {
      expect(() => {
        Wallet.fromPrivateKey('');
      }).toThrow('Invalid private key');
    });
  });

  describe('sign', () => {
    it('should sign data and produce valid signature', () => {
      const wallet = Wallet.generate();
      const data = Buffer.from('test message', 'utf-8');

      const signature = wallet.sign(data);

      expect(signature).toBeDefined();
      expect(signature.length).toBe(128); // 64 bytes hex
    });

    it('should produce different signatures for different data', () => {
      const wallet = Wallet.generate();
      const data1 = Buffer.from('message 1', 'utf-8');
      const data2 = Buffer.from('message 2', 'utf-8');

      const sig1 = wallet.sign(data1);
      const sig2 = wallet.sign(data2);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce same signature for same data', () => {
      const wallet = Wallet.generate();
      const data = Buffer.from('test message', 'utf-8');

      const sig1 = wallet.sign(data);
      const sig2 = wallet.sign(data);

      expect(sig1).toBe(sig2);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('should serialize and deserialize wallet', () => {
      const wallet1 = Wallet.generate();
      const json = wallet1.toJSON();

      expect(json.publicKey).toBe(wallet1.publicKey);
      expect(json.privateKey).toBe(wallet1.getPrivateKey());

      const wallet2 = Wallet.fromJSON(json);

      expect(wallet2.publicKey).toBe(wallet1.publicKey);
      expect(wallet2.getPrivateKey()).toBe(wallet1.getPrivateKey());
    });
  });

  describe('getPublicKey', () => {
    it('should return the public key', () => {
      const wallet = Wallet.generate();
      const publicKey = wallet.getPublicKey();

      expect(publicKey).toBe(wallet.publicKey);
      expect(publicKey.length).toBe(64);
    });
  });
});
