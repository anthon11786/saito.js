# @saito/client

Lightweight TypeScript/JavaScript client library for interacting with the Saito Network.

## Features

- 🚀 **Lightweight** - ~50KB vs 6.4MB WASM (no consensus engine bundled)
- 🔌 **WebSocket & REST** - Real-time and HTTP API support
- 💼 **Wallet Management** - Create, import, and manage wallets
- 📦 **Transaction Builder** - Simple API for creating and sending transactions
- 🔔 **Event Subscriptions** - Listen for transactions, blocks, and custom events
- 📘 **TypeScript** - Full type definitions included

## Installation

```bash
npm install @saito/client
```

## Quick Start

```typescript
import { SaitoClient, Wallet } from '@saito/client';

// Connect to a Saito node
const client = new SaitoClient({
  endpoint: 'ws://localhost:12101/wsopen'
});

await client.connect();

// Create or import wallet
const wallet = Wallet.generate();

// Send a transaction
const tx = await client.sendTransaction({
  from: wallet,
  to: 'recipient-public-key',
  amount: 1000000n,
  data: { message: 'Hello Saito!' }
});

// Get balance
const balance = await client.getBalance(wallet.publicKey);

// Subscribe to events
client.on('transaction', (tx) => {
  console.log('New transaction:', tx);
});
```

## Documentation

See [docs/](./docs) for full API documentation.

## License

MIT
