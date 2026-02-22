# Testing saito.js

## Prerequisites

You need a running Saito node to test against.

## Setup

### 1. Start a Saito Node

In a separate terminal:

```bash
cd /Users/anthonyperaza/Documents/Code/saito/node
npm run dev
```

Wait for the node to start. You should see output indicating it's running on port 12101.

### 2. Build saito.js

```bash
cd /Users/anthonyperaza/Documents/Code/saito.js
npm install
npm run build
```

## Running Tests

### Unit Tests (No node required)

```bash
npm test
```

Runs all unit tests with mocked dependencies.

### Live Integration Test

```bash
npm run test:live
```

This will:
- ✓ Connect to your local node at ws://localhost:12101
- ✓ Generate a new wallet
- ✓ Complete the handshake protocol
- ✓ Query balance
- ✓ Get network stats
- ✓ Fetch connected peers
- ✓ Send a test transaction (if balance > 0)
- ✓ Listen for real-time events

### Basic Usage Example

```bash
npm run test:basic
```

### Chat Example

```bash
npm run test:chat
```

## Troubleshooting

### Connection Failed

```
❌ Failed to connect
💡 Make sure Saito node is running:
   cd ../saito/node && npm run dev
```

**Solution:** Start the Saito node first.

### Port Already in Use

If port 12101 is already in use, update the endpoint in `examples/live-test.ts`.

### Handshake Timeout

If handshake fails, check:
1. Node is running on correct port
2. WebSocket endpoint is `/wsopen`
3. No firewall blocking localhost connections
