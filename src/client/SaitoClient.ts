/**
 * Main Saito client for connecting to nodes and interacting with the network
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import * as JSON from 'json-bigint';
import { Transaction } from '../transaction/Transaction';
import { Wallet } from '../wallet/Wallet';
import {
  Block,
  HandshakeData,
  Message,
  NetworkStats,
  PeerInfo,
} from '../types';
import { fetchJson } from '../utils/http';

export interface SaitoClientConfig {
  endpoint: string;
  network?: 'mainnet' | 'testnet' | 'local';
  wallet?: Wallet;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  synctype?: 'none' | 'lite' | 'full';
}

export class SaitoClient extends EventEmitter {
  private config: Required<SaitoClientConfig>;
  private socket: WebSocket | null = null;
  private connected: boolean = false;
  private handshakeComplete: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor(config: SaitoClientConfig) {
    super();

    this.config = {
      network: 'mainnet',
      wallet: config.wallet || Wallet.generate(),
      autoReconnect: true,
      reconnectDelay: 3000,
      synctype: 'none',
      ...config,
    };
  }

  /**
   * Connect to a Saito node
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.endpoint);

        this.socket.on('open', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          console.log('[SaitoClient] Connected to:', this.config.endpoint);
        });

        this.socket.on('message', (data: Buffer) => {
          this.handleMessage(data);
        });

        this.socket.on('error', (error) => {
          console.error('[SaitoClient] WebSocket error:', error);
          this.emit('error', error);
          if (!this.connected) {
            reject(error);
          }
        });

        this.socket.on('close', () => {
          this.connected = false;
          this.handshakeComplete = false;
          this.emit('disconnected');
          console.log('[SaitoClient] Disconnected');

          if (this.config.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[SaitoClient] Reconnecting... (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), this.config.reconnectDelay);
          }
        });

        // Wait for handshake to complete
        this.once('handshake-complete', () => {
          resolve();
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!this.handshakeComplete) {
            reject(new Error('Handshake timeout'));
          }
        }, 30000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the node
   */
  disconnect(): void {
    this.config.autoReconnect = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send a transaction to the network
   */
  async sendTransaction(tx: Transaction): Promise<string> {
    if (!this.connected || !this.handshakeComplete) {
      throw new Error('Not connected to node');
    }

    const message: Message = {
      request: 'transaction',
      data: tx.serialize(),
    };

    this.sendMessage(message);

    return tx.signature;
  }

  /**
   * Create and send a simple payment transaction
   */
  async sendPayment(to: string, amount: bigint, data?: any): Promise<string> {
    const tx = new Transaction()
      .addTo(to, amount)
      .addFrom(this.config.wallet.publicKey, amount);

    if (data) {
      tx.setData(data);
    }

    tx.sign(this.config.wallet);

    return this.sendTransaction(tx);
  }

  /**
   * Get balance for a public key
   */
  async getBalance(publicKey?: string): Promise<bigint> {
    const key = publicKey || this.config.wallet.publicKey;
    const data = await fetchJson<{ balance?: string | number }>(
      `${this.getHttpEndpoint()}/balance/${key}`
    );
    return BigInt(data.balance || 0);
  }

  /**
   * Get a block by hash
   */
  async getBlock(hash: string, publicKey?: string): Promise<Block> {
    const key = publicKey || this.config.wallet.publicKey;
    return await fetchJson<Block>(
      `${this.getHttpEndpoint()}/lite-block/${hash}/${key}`
    );
  }

  /**
   * Get network statistics
   */
  async getStats(): Promise<NetworkStats> {
    return await fetchJson<NetworkStats>(`${this.getHttpEndpoint()}/stats`);
  }

  /**
   * Get connected peers
   */
  async getPeers(): Promise<PeerInfo[]> {
    const data = await fetchJson<{ peers?: PeerInfo[] }>(
      `${this.getHttpEndpoint()}/stats/peers`
    );
    return data.peers || [];
  }

  /**
   * Get node version
   */
  async getVersion(): Promise<string> {
    const data = await fetchJson<{ version: string }>(
      `${this.getHttpEndpoint()}/version`
    );
    return data.version;
  }

  /**
   * Subscribe to transactions
   */
  onTransaction(callback: (tx: Transaction) => void): void {
    this.on('transaction', callback);
  }

  /**
   * Subscribe to new blocks
   */
  onBlock(callback: (block: Block) => void): void {
    this.on('block', callback);
  }

  /**
   * Send a custom message
   */
  sendCustomMessage(type: string, data: any): void {
    const message: Message = {
      request: type,
      data,
    };
    this.sendMessage(message);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: Buffer): void {
    try {
      const message: Message = JSON.parse(data.toString());

      switch (message.request) {
        case 'handshake':
          this.handleHandshake(message.data);
          break;
        case 'transaction':
          this.emit('transaction', Transaction.fromJSON(message.data));
          break;
        case 'block':
          this.emit('block', message.data);
          break;
        default:
          this.emit(`message:${message.request}`, message.data);
      }
    } catch (error) {
      console.error('[SaitoClient] Error parsing message:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle handshake protocol
   */
  private handleHandshake(data: HandshakeData): void {
    console.log('[SaitoClient] Handshake step:', data.step);

    if (data.step === 1) {
      // Server initiated handshake - respond
      const response: Message = {
        request: 'handshake',
        data: {
          step: 2,
          ts: Date.now(),
          challenge_mine: Math.random(),
          challenge_peer: data.challenge_mine,
          challenge_proof: this.signChallenge(data.challenge_mine),
          peer: {
            publicKey: this.config.wallet.publicKey,
            host: '',
            port: 0,
            protocol: '',
            version: 5.677,
            synctype: this.config.synctype,
            sendblks: 0,
            sendtxs: 1,
            sendgts: 0,
            receiveblks: this.config.synctype !== 'none' ? 1 : 0,
            receivetxs: 1,
            receivegts: 0,
            keylist: [this.config.wallet.publicKey],
          },
          modules: [],
          services: [],
        } as HandshakeData,
      };

      this.sendMessage(response);
    } else if (data.step >= 3) {
      // Handshake complete
      this.handshakeComplete = true;
      console.log('[SaitoClient] Handshake complete');
      this.emit('handshake-complete');
    }
  }

  /**
   * Sign a challenge with the wallet
   */
  private signChallenge(challenge: number): string {
    const challengeStr = challenge.toString();
    const data = Buffer.from(challengeStr, 'utf-8');
    return this.config.wallet.sign(data);
  }

  /**
   * Send a message via WebSocket
   */
  private sendMessage(message: Message): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Get HTTP endpoint from WebSocket endpoint
   */
  private getHttpEndpoint(): string {
    return this.config.endpoint
      .replace('ws://', 'http://')
      .replace('wss://', 'https://')
      .replace('/wsopen', '');
  }

  /**
   * Check if connected and ready
   */
  isReady(): boolean {
    return this.connected && this.handshakeComplete;
  }

  /**
   * Get the wallet being used
   */
  getWallet(): Wallet {
    return this.config.wallet;
  }
}
