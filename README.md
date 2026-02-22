# @saito/client

Lightweight TypeScript/JavaScript client library for interacting with the Saito Network.

## Why @saito/client?

The full `saito-js` package bundles the entire **6.4MB WASM consensus engine**. Most applications don't need this - they just need to connect to a node, send transactions, and query data.

**@saito/client** is a minimal SDK (~50KB) that provides everything you need without the heavyweight WASM dependency.

## Features

- 🚀 **Lightweight** - ~50KB vs 6.4MB (no WASM consensus engine)
- 🔌 **WebSocket & REST** - Real-time WebSocket + HTTP API
- 💼 **Wallet Management** - Generate, import, and manage wallets
- 📦 **Transaction Builder** - Simple API for creating transactions
- 🔔 **Event Subscriptions** - Listen for transactions, blocks, and custom events
- 📘 **TypeScript** - Full type definitions included
- ⚡ **Framework Agnostic** - Works with Node.js, NestJS, Express, Next.js, etc.

## Installation

```bash
npm install @saito/client
```

## Quick Start

```typescript
import { SaitoClient, Wallet } from '@saito/client';

// 1. Create a wallet
const wallet = Wallet.generate();

// 2. Connect to a Saito node
const client = new SaitoClient({
  endpoint: 'ws://localhost:12101/wsopen',
  wallet: wallet
});

await client.connect();

// 3. Send a payment
await client.sendPayment(
  'recipient-public-key',
  1000000n, // amount in nolan
  { message: 'Hello Saito!' }
);

// 4. Get balance
const balance = await client.getBalance();
console.log(`Balance: ${balance} nolan`);

// 5. Subscribe to events
client.on('transaction', (tx) => {
  console.log('New transaction:', tx);
});

client.on('block', (block) => {
  console.log('New block:', block.id);
});
```

## API Documentation

### SaitoClient

The main client class for connecting to Saito nodes.

#### Constructor

```typescript
const client = new SaitoClient({
  endpoint: 'ws://localhost:12101/wsopen',
  wallet: Wallet.generate(),
  network: 'mainnet', // 'mainnet' | 'testnet' | 'local'
  autoReconnect: true,
  reconnectDelay: 3000
});
```

#### Methods

**Connection**
- `connect(): Promise<void>` - Connect to the node
- `disconnect(): void` - Disconnect from the node
- `isReady(): boolean` - Check if connected and ready

**Transactions**
- `sendTransaction(tx: Transaction): Promise<string>` - Send a transaction
- `sendPayment(to: string, amount: bigint, data?: any): Promise<string>` - Send a payment

**Queries**
- `getBalance(publicKey?: string): Promise<bigint>` - Get balance
- `getBlock(hash: string): Promise<Block>` - Get block by hash
- `getStats(): Promise<NetworkStats>` - Get network statistics
- `getPeers(): Promise<PeerInfo[]>` - Get connected peers
- `getVersion(): Promise<string>` - Get node version

**Events**
- `on('connected', callback)` - Connection established
- `on('disconnected', callback)` - Connection lost
- `on('transaction', callback)` - New transaction
- `on('block', callback)` - New block
- `on('error', callback)` - Error occurred

### Wallet

Wallet management and signing.

```typescript
// Generate new wallet
const wallet = Wallet.generate();

// Import from private key
const wallet = Wallet.fromPrivateKey('your-private-key-hex');

// Get keys
wallet.publicKey;
wallet.getPrivateKey();

// Sign data
const signature = wallet.sign(data);

// Export/Import JSON
const json = wallet.toJSON();
const wallet = Wallet.fromJSON(json);
```

### Transaction

Transaction builder.

```typescript
import { Transaction } from '@saito/client';

const tx = new Transaction()
  .addTo('recipient-public-key', 1000000n)
  .setMessage({
    module: 'Chat',
    message: 'Hello!'
  })
  .sign(wallet);

await client.sendTransaction(tx);
```

## Examples

### Simple Payment

```typescript
const client = new SaitoClient({
  endpoint: 'ws://localhost:12101/wsopen',
  wallet: Wallet.generate()
});

await client.connect();

await client.sendPayment(
  'recipient-public-key',
  1000000n,
  { note: 'Payment for services' }
);
```

### P2P Chat

```typescript
const client = new SaitoClient({
  endpoint: 'ws://localhost:12101/wsopen',
  wallet: Wallet.generate()
});

await client.connect();

// Listen for messages
client.on('transaction', (tx) => {
  const msg = JSON.parse(tx.data.toString());
  if (msg.module === 'Chat') {
    console.log(`${msg.from}: ${msg.message}`);
  }
});

// Send message
await client.sendPayment('friend-public-key', 0n, {
  module: 'Chat',
  message: 'Hello!',
  timestamp: Date.now()
});
```

### Use with NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { SaitoClient, Wallet } from '@saito/client';

@Injectable()
export class SaitoService {
  private client: SaitoClient;

  constructor() {
    this.client = new SaitoClient({
      endpoint: process.env.SAITO_ENDPOINT,
      wallet: Wallet.fromPrivateKey(process.env.SAITO_PRIVATE_KEY)
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async sendTransaction(to: string, amount: bigint) {
    return this.client.sendPayment(to, amount);
  }

  async getBalance(publicKey: string) {
    return this.client.getBalance(publicKey);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint
npm run lint
```

## Comparison: @saito/client vs saito-js

| Feature | @saito/client | saito-js |
|---------|---------------|----------|
| **Size** | ~50KB | ~7MB (6.4MB WASM) |
| **Purpose** | Network client | Full blockchain node |
| **Use Case** | External apps, dApps | Running a node |
| **Dependencies** | Minimal | Full WASM runtime |
| **Consensus** | ❌ No | ✅ Yes |
| **Block Production** | ❌ No | ✅ Yes |
| **Transaction Sending** | ✅ Yes | ✅ Yes |
| **Event Listening** | ✅ Yes | ✅ Yes |
| **Wallet Management** | ✅ Yes | ✅ Yes |

## License

MIT

## Links

- [Saito Network](https://saito.io)
- [Saito Wiki](https://wiki.saito.io)
- [GitHub](https://github.com/saito-network/saito-client)
