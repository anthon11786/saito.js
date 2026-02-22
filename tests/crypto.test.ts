import {
  generateKeyPair,
  getPublicKey,
  isValidPublicKey,
  isValidPrivateKey,
  sign,
  verify,
  signMessage,
  verifyMessage,
} from '../src/crypto';

describe('Crypto', () => {
  describe('generateKeyPair', () => {
    it('should generate valid key pair', () => {
      const keyPair = generateKeyPair();

      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey.length).toBe(64);
      expect(keyPair.privateKey.length).toBe(128);
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe('getPublicKey', () => {
    it('should derive public key from private key', () => {
      const keyPair = generateKeyPair();
      const derivedPublicKey = getPublicKey(keyPair.privateKey);

      expect(derivedPublicKey).toBe(keyPair.publicKey);
    });
  });

  describe('isValidPublicKey', () => {
    it('should validate correct public key', () => {
      const keyPair = generateKeyPair();
      expect(isValidPublicKey(keyPair.publicKey)).toBe(true);
    });

    it('should reject invalid public key', () => {
      expect(isValidPublicKey('invalid')).toBe(false);
      expect(isValidPublicKey('')).toBe(false);
      expect(isValidPublicKey('abc123')).toBe(false);
    });
  });

  describe('isValidPrivateKey', () => {
    it('should validate correct private key', () => {
      const keyPair = generateKeyPair();
      expect(isValidPrivateKey(keyPair.privateKey)).toBe(true);
    });

    it('should reject invalid private key', () => {
      expect(isValidPrivateKey('invalid')).toBe(false);
      expect(isValidPrivateKey('')).toBe(false);
      expect(isValidPrivateKey('abc123')).toBe(false);
    });
  });

  describe('sign and verify', () => {
    it('should sign and verify data correctly', () => {
      const keyPair = generateKeyPair();
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      const signature = sign(data, keyPair.privateKey);
      const isValid = verify(data, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong public key', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      const signature = sign(data, keyPair1.privateKey);
      const isValid = verify(data, signature, keyPair2.publicKey);

      expect(isValid).toBe(false);
    });

    it('should fail verification with modified data', () => {
      const keyPair = generateKeyPair();
      const data1 = new Uint8Array([1, 2, 3, 4, 5]);
      const data2 = new Uint8Array([1, 2, 3, 4, 6]);

      const signature = sign(data1, keyPair.privateKey);
      const isValid = verify(data2, signature, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should fail verification with invalid signature', () => {
      const keyPair = generateKeyPair();
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      const isValid = verify(data, 'invalid-signature', keyPair.publicKey);

      expect(isValid).toBe(false);
    });
  });

  describe('signMessage and verifyMessage', () => {
    it('should sign and verify string messages', () => {
      const keyPair = generateKeyPair();
      const message = 'Hello, Saito!';

      const signature = signMessage(message, keyPair.privateKey);
      const isValid = verifyMessage(message, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should fail verification with modified message', () => {
      const keyPair = generateKeyPair();
      const message1 = 'Hello, Saito!';
      const message2 = 'Hello, World!';

      const signature = signMessage(message1, keyPair.privateKey);
      const isValid = verifyMessage(message2, signature, keyPair.publicKey);

      expect(isValid).toBe(false);
    });
  });
});
