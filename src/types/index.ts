/**
 * Core type definitions for Saito client
 */

export interface Slip {
  publicKey: string;
  amount: bigint;
  type: SlipType;
  index?: number;
  blockId?: bigint;
  txOrdinal?: bigint;
}

export enum SlipType {
  Normal = 0,
  ATR = 1,
  VipInput = 2,
  VipOutput = 3,
  MinerInput = 4,
  MinerOutput = 5,
  RouterInput = 6,
  RouterOutput = 7,
}

export enum TransactionType {
  Normal = 0,
  GoldenTicket = 1,
  Fee = 2,
  Issuance = 3,
  ATR = 4,
}

export interface Transaction {
  timestamp: number;
  from: Slip[];
  to: Slip[];
  data: Uint8Array;
  signature: string;
  txs_replacements?: number;
  type?: TransactionType;
}

export interface Block {
  id: bigint;
  hash: string;
  timestamp: number;
  previousBlockHash: string;
  transactions: Transaction[];
  burnFee?: bigint;
  difficulty?: bigint;
}

export interface PeerInfo {
  publicKey: string;
  host: string;
  port: number;
  protocol: string;
  version: number;
  synctype: 'none' | 'lite' | 'full';
  sendblks: 0 | 1;
  sendtxs: 0 | 1;
  sendgts: 0 | 1;
  receiveblks: 0 | 1;
  receivetxs: 0 | 1;
  receivegts: 0 | 1;
  keylist?: string[];
}

export interface HandshakeData {
  step: number;
  ts: number;
  attempts?: number;
  complete?: number;
  challenge_mine: number;
  challenge_peer?: string | number;
  challenge_proof?: string;
  challenge_verified?: number;
  peer: PeerInfo;
  modules?: string[];
  services?: string[];
  blockchain?: {
    last_bid: bigint;
    last_ts: number;
    last_bsh: string;
    last_bf: number;
    fork_id: string;
    genesis_bid: bigint;
  };
}

export interface Message {
  request: string;
  data: any;
}

export interface NetworkStats {
  peers: number;
  blockHeight: bigint;
  difficulty: bigint;
  burnFee: bigint;
}

export interface Balance {
  publicKey: string;
  balance: bigint;
}
