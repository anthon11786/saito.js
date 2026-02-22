# saito.js

[![npm version](https://img.shields.io/npm/v/saito.js.svg)](https://www.npmjs.com/package/saito.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/saito-network/saito.js/workflows/Tests/badge.svg)](https://github.com/saito-network/saito.js/actions)

A **lightweight, REST-only JavaScript library** for interacting with the Saito Network.

Inspired by [ethers.js](https://github.com/ethers-io/ethers.js/) - simple, complete, and powerful.

---

## ⚠️ Important: REST-Only Client

**saito.js is a REST-only client.** The Saito node uses a binary WebSocket protocol that requires WASM deserialization. This lightweight library **does not include WASM** and focuses on the **HTTP REST API**.

### ✅ What Works

- **Query blockchain data** (balances, blocks, stats, peers)
- **Wallet management** (generate, import, sign, export)
- **Transaction creation** (build and sign transactions locally)
- **Crypto utilities** (Ed25519 signing, verification, hashing)

### ❌ What Doesn't Work (Without WASM)

- **WebSocket real-time events** (new blocks, live transactions)
- **Transaction broadcasting** (no REST POST endpoint on node yet)
- **Running a full node**

### 💡 Use This For

- Block explorers
- Wallet applications (read-only for now)
- Analytics dashboards
- Transaction signing services
- Portfolio trackers
- Address validators

### 🔄 For Full WebSocket Support

Use the full [saito-js](https://www.npmjs.com/package/saito-js) package (includes 6.4MB WASM).

---

## Why saito.js?

Most applications don't need a full blockchain node. They just need to:
- Check balances
- Create wallets
- Sign transactions
- Query blockchain data

**saito.js** provides this at **~50KB** vs **7MB** (saito-js with WASM).

---

## Installation

```bash
npm install saito.js
```

Or with yarn:
```bash
yarn add saito.js
```

---

## Quick Start

### 1. Generate a Wallet

```typescript
import { Wallet } from 'saito.js';

const wallet = Wallet.generate();

console.log('Public Key:', wallet.publicKey);
console.log('Private Key:', wallet.getPrivateKey());
```

### 2. Check Balance

```typescript
// The /balance endpoint returns plain text, parse it:
const response = await fetch(`http://localhost:12101/balance/${wallet.publicKey}`);
const text = await response.text();

// Parse snapshot format: "publicKey nonce index type amount uuid"
let balance = 0n;
for (const line of text.split('\n')) {
  const parts = line.trim().split(/\s+/);
  if (parts[0] === wallet.publicKey && parts.length >= 5) {
    balance += BigInt(parts[4]);
  }
}

console.log('Balance:', balance.toString(), 'nolan');
```

### 3. Create & Sign Transaction

```typescript
import { Transaction } from 'saito.js';

const tx = new Transaction()
  .addFrom(wallet.publicKey, 1000000n)
  .addTo('recipient-public-key', 1000000n)
  .setMessage({
    module: 'Payment',
    note: 'Invoice #123'
  })
  .sign(wallet);

console.log('Signature:', tx.signature);
console.log('Serialized:', tx.serialize());
```

### 4. Query Network Stats

```typescript
import { fetchJson } from 'saito.js/dist/utils/http';

const stats = await fetchJson('http://localhost:12101/stats');

console.log('Block Height:', stats.current_blockchain_state.longest_chain_length);
console.log('Mempool Size:', stats.current_mempool_state.mempool_size);
```

---

## API Reference

### Wallet

```typescript
// Generate new wallet
const wallet = Wallet.generate();

// Import from private key (hex string)
const wallet = Wallet.fromPrivateKey('your-private-key-hex');

// Get public key
const publicKey = wallet.publicKey; // hex string, 64 chars

// Get private key (use with caution!)
const privateKey = wallet.getPrivateKey(); // hex string, 128 chars

// Sign data
const signature = wallet.sign(Buffer.from('data')); // returns hex signature

// Export to JSON
const json = wallet.toJSON();
// { publicKey: '...', privateKey: '...' }

// Import from JSON
const wallet2 = Wallet.fromJSON(json);
```

### Transaction

```typescript
import { Transaction } from 'saito.js';

// Create transaction
const tx = new Transaction()
  .addFrom(senderPublicKey, amountInNolan)
  .addTo(recipientPublicKey, amountInNolan)
  .setMessage({
    module: 'YourModule',
    custom: 'data'
  })
  .sign(wallet);

// Serialize to bytes
const bytes = tx.serialize(); // Uint8Array

// Export to JSON
const json = tx.toJSON();

// Import from JSON
const tx2 = Transaction.fromJSON(json);
```

### REST API Endpoints

```typescript
import { fetchJson } from 'saito.js/dist/utils/http';

const endpoint = 'http://localhost:12101';

// 1. Get version
const version = await fetchJson(`${endpoint}/version`);
// { wallet_version: 5.677, saito_js: "0.2.182", build_number: 1771794914 }

// 2. Get balance (plain text response, parse manually)
const response = await fetch(`${endpoint}/balance/${publicKey}`);
const text = await response.text();
// Returns: "publicKey nonce index type amount uuid\n..."

// 3. Get network stats
const stats = await fetchJson(`${endpoint}/stats`);
// {
//   current_blockchain_state: { longest_chain_length: 96, ... },
//   current_wallet_state: { wallet_balance: 70000000000, ... },
//   current_mempool_state: { mempool_size: 0 },
//   current_mining_state: { mining_difficulty: 0 }
// }

// 4. Get peers
const peers = await fetchJson(`${endpoint}/stats/peers`);
// { peers: [...] }

// 5. Get block (requires public key for lite block)
const block = await fetchJson(`${endpoint}/lite-block/${blockHash}/${publicKey}`);
```

### Crypto Utilities

```typescript
import {
  generateKeyPair,
  sign,
  verify,
  signMessage,
  verifyMessage
} from 'saito.js';

// Generate key pair
const { publicKey, privateKey } = generateKeyPair();

// Sign raw bytes
const signature = sign(dataBytes, privateKey);

// Verify signature
const isValid = verify(dataBytes, signature, publicKey);

// Sign string message
const sig = signMessage('Hello Saito', privateKey);

// Verify string message
const valid = verifyMessage('Hello Saito', sig, publicKey);
```

---

## Examples

### Complete Wallet App

```typescript
import { Wallet } from 'saito.js';
import { fetchJson } from 'saito.js/dist/utils/http';

async function walletApp() {
  // Generate wallet
  const wallet = Wallet.generate();

  // Save to localStorage (browser)
  localStorage.setItem('wallet', JSON.stringify(wallet.toJSON()));

  // Load from localStorage
  const saved = JSON.parse(localStorage.getItem('wallet')!);
  const loadedWallet = Wallet.fromJSON(saved);

  // Check balance
  const response = await fetch(`http://localhost:12101/balance/${wallet.publicKey}`);
  const text = await response.text();

  let balance = 0n;
  for (const line of text.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === wallet.publicKey && parts.length >= 5) {
      balance += BigInt(parts[4]);
    }
  }

  console.log(`Balance: ${Number(balance) / 100000000} SAITO`);
}
```

---

## Testing

### Unit Tests (No Node Required)

```bash
npm test
```

Runs 42 unit tests covering:
- Wallet generation and signing
- Transaction building
- Crypto utilities
- Type definitions

### REST API Integration Test

Requires a running Saito node:

```bash
# Terminal 1: Start Saito node
cd path/to/saito/node
npm run dev

# Terminal 2: Run REST test
cd path/to/saito.js
npm run test:rest
```

**Expected Output:**
```
🚀 saito.js REST-Only Test
==================================================
📝 Step 1: Creating wallet...
✓ Wallet created
🏷️  Step 2: Getting node version...
✓ Node wallet version: 5.677
💰 Step 3: Checking balance...
✓ Balance: 0 nolan
📊 Step 4: Fetching network stats...
✓ Network stats: { ... }
👥 Step 5: Getting connected peers...
✓ Connected peers: 0
📦 Step 6: Creating sample transaction...
✓ Transaction created
==================================================
✅ REST API tests completed!
```

---

## Comparison

| Feature | saito.js | saito-js (WASM) |
|---------|----------|-----------------|
| **Size** | ~50KB | ~7MB |
| **Purpose** | REST client + wallet utils | Full blockchain node |
| **WebSocket** | ❌ No (binary protocol) | ✅ Yes |
| **Transaction Broadcast** | ❌ No REST endpoint yet | ✅ Yes |
| **Balance Queries** | ✅ Yes (REST) | ✅ Yes |
| **Wallet Management** | ✅ Yes | ✅ Yes |
| **Transaction Signing** | ✅ Yes | ✅ Yes |
| **Block Production** | ❌ No | ✅ Yes |
| **Consensus** | ❌ No | ✅ Yes |
| **Use Case** | Wallets, explorers, dashboards | Running a node |

---

## Roadmap

- [ ] Helper functions for balance parsing
- [ ] Optional WASM peer dependency for WebSocket
- [ ] Transaction POST endpoint (requires node-side changes)
- [ ] Mnemonic phrase support (BIP39)
- [ ] Hardware wallet integration
- [ ] React hooks (`useWallet`, `useBalance`)
- [ ] Vue composables
- [ ] CLI tool for wallet management

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run unit tests
npm test

# Run REST integration test (requires running node)
npm run test:rest

# Format code
npm run format

# Lint
npm run lint
```

---

## Contributing

Contributions welcome! Please open an issue or PR.

---

## License

MIT

---

## Links

- [Saito Network](https://saito.io)
- [Saito Wiki](https://wiki.saito.io)
- [GitHub](https://github.com/saito-network/saito.js)
- [NPM](https://www.npmjs.com/package/saito.js)
- [Full saito-js (WASM)](https://www.npmjs.com/package/saito-js)
