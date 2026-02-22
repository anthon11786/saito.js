import { SaitoClient } from '../src/client/SaitoClient';
import { Wallet } from '../src/wallet/Wallet';

// Mock WebSocket
jest.mock('ws', () => {
  return class MockWebSocket {
    static OPEN = 1;
    readyState = 1;

    constructor(public url: string) {}

    on(event: string, callback: Function) {}
    send(data: any) {}
    close() {}
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ balance: 1000000 }),
  } as Response)
);

describe('SaitoClient', () => {
  let client: SaitoClient;
  let wallet: Wallet;

  beforeEach(() => {
    wallet = Wallet.generate();
    client = new SaitoClient({
      endpoint: 'ws://localhost:12101/wsopen',
      wallet: wallet,
      network: 'local',
    });
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
      expect(client.getWallet()).toBe(wallet);
    });

    it('should create wallet if not provided', () => {
      const clientWithoutWallet = new SaitoClient({
        endpoint: 'ws://localhost:12101/wsopen',
      });

      expect(clientWithoutWallet.getWallet()).toBeDefined();
    });

    it('should set default config values', () => {
      const defaultClient = new SaitoClient({
        endpoint: 'ws://localhost:12101/wsopen',
      });

      expect(defaultClient).toBeDefined();
    });
  });

  describe('isReady', () => {
    it('should return false when not connected', () => {
      expect(client.isReady()).toBe(false);
    });
  });

  describe('getWallet', () => {
    it('should return the wallet', () => {
      expect(client.getWallet()).toBe(wallet);
    });
  });

  describe('getBalance', () => {
    it('should fetch balance from REST API', async () => {
      const balance = await client.getBalance();
      expect(balance).toBe(1000000n);
    });

    it('should use provided public key', async () => {
      const otherKey = 'other-public-key';
      await client.getBalance(otherKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(otherKey)
      );
    });
  });

  describe('getVersion', () => {
    it('should fetch version from REST API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ version: '5.677' }),
      } as Response);

      const version = await client.getVersion();
      expect(version).toBe('5.677');
    });
  });

  describe('getStats', () => {
    it('should fetch stats from REST API', async () => {
      const mockStats = { peers: 5, blockHeight: 1000n };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockStats),
      } as Response);

      const stats = await client.getStats();
      expect(stats).toEqual(mockStats);
    });
  });

  describe('getPeers', () => {
    it('should fetch peers from REST API', async () => {
      const mockPeers = [{ publicKey: 'peer1' }, { publicKey: 'peer2' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ peers: mockPeers }),
      } as Response);

      const peers = await client.getPeers();
      expect(peers).toEqual(mockPeers);
    });
  });

  describe('event listeners', () => {
    it('should register transaction listener', () => {
      const callback = jest.fn();
      client.onTransaction(callback);

      expect(client.listenerCount('transaction')).toBe(1);
    });

    it('should register block listener', () => {
      const callback = jest.fn();
      client.onBlock(callback);

      expect(client.listenerCount('block')).toBe(1);
    });
  });
});
