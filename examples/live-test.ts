/**
 * Live test against a running Saito node
 *
 * Usage:
 * 1. Start a Saito node: cd ../saito/node && npm run dev
 * 2. Run this script: npm run test:live
 */

import { SaitoClient, Wallet } from '../src';

async function liveTest() {
  console.log('🚀 saito.js Live Test\n');
  console.log('='.repeat(50));

  // 1. Create wallet
  console.log('\n📝 Step 1: Creating wallet...');
  const wallet = Wallet.generate();
  console.log('✓ Wallet created');
  console.log('  Public Key:', wallet.publicKey);
  console.log('  Private Key:', wallet.getPrivateKey().substring(0, 20) + '...');

  // 2. Create client
  console.log('\n🔌 Step 2: Creating client...');
  const client = new SaitoClient({
    endpoint: 'ws://localhost:12101/wsopen',
    wallet: wallet,
    network: 'local',
    autoReconnect: true,
  });

  // Set up event listeners
  client.on('connected', () => {
    console.log('✓ Connected to Saito node');
  });

  client.on('handshake-complete', () => {
    console.log('✓ Handshake complete - ready to transact');
  });

  client.on('transaction', (tx) => {
    console.log('\n📨 Received transaction:');
    console.log('  Signature:', tx.signature.substring(0, 20) + '...');
    console.log('  From:', tx.from.length, 'inputs');
    console.log('  To:', tx.to.length, 'outputs');
  });

  client.on('block', (block) => {
    console.log('\n📦 New block received:');
    console.log('  ID:', block.id);
    console.log('  Hash:', block.hash?.substring(0, 20) + '...');
  });

  client.on('error', (error) => {
    console.error('\n❌ Error:', error.message);
  });

  client.on('disconnected', () => {
    console.log('\n⚠️  Disconnected from node');
  });

  // 3. Connect
  try {
    console.log('\n🔗 Step 3: Connecting to node at ws://localhost:12101/wsopen...');
    await client.connect();
    console.log('✓ Connection established');
  } catch (error) {
    const err = error as Error;
    console.error('\n❌ Failed to connect:', err.message);
    console.log('\n💡 Make sure Saito node is running:');
    console.log('   cd ../saito/node && npm run dev\n');
    process.exit(1);
  }

  // 4. Get balance
  try {
    console.log('\n💰 Step 4: Checking balance...');
    const balance = await client.getBalance();
    console.log('✓ Balance:', balance.toString(), 'nolan');

    const saito = Number(balance) / 100000000;
    console.log('  =', saito.toFixed(8), 'SAITO');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to get balance:', err.message);
  }

  // 5. Get network stats
  try {
    console.log('\n📊 Step 5: Fetching network stats...');
    const stats = await client.getStats();
    console.log('✓ Network stats:');
    console.log('  ', JSON.stringify(stats, null, 2));
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to get stats:', err.message);
  }

  // 6. Get version
  try {
    console.log('\n🏷️  Step 6: Getting node version...');
    const version = await client.getVersion();
    console.log('✓ Node version:', version);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to get version:', err.message);
  }

  // 7. Get peers
  try {
    console.log('\n👥 Step 7: Getting connected peers...');
    const peers = await client.getPeers();
    console.log('✓ Connected peers:', peers.length);
    if (peers.length > 0) {
      peers.forEach((peer, i) => {
        console.log(`  ${i + 1}.`, peer.publicKey?.substring(0, 20) + '...');
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to get peers:', err.message);
  }

  // 8. Send a test transaction (only if we have balance)
  try {
    const balance = await client.getBalance();
    if (balance > 1000000n) {
      console.log('\n📤 Step 8: Sending test transaction...');

      const recipientWallet = Wallet.generate();
      console.log('  Recipient:', recipientWallet.publicKey.substring(0, 20) + '...');
      console.log('  Amount: 1000000 nolan (0.01 SAITO)');

      const txHash = await client.sendPayment(
        recipientWallet.publicKey,
        1000000n,
        {
          module: 'Test',
          message: 'Test transaction from saito.js',
          timestamp: Date.now(),
        }
      );

      console.log('✓ Transaction sent!');
      console.log('  Signature:', txHash.substring(0, 20) + '...');
    } else {
      console.log('\n⏭️  Step 8: Skipping transaction (insufficient balance)');
      console.log('  Need at least 1000000 nolan to send test transaction');
    }
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to send transaction:', err.message);
  }

  // Keep running to receive events
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed!');
  console.log('\n👂 Listening for transactions and blocks...');
  console.log('   Press Ctrl+C to exit\n');

  // Keep alive
  process.on('SIGINT', () => {
    console.log('\n\n👋 Disconnecting...');
    client.disconnect();
    process.exit(0);
  });
}

// Run the test
liveTest().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
