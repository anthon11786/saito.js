/**
 * REST-only test (no WebSocket required)
 *
 * This bypasses the binary WebSocket protocol and uses only HTTP REST API
 *
 * Usage: npm run test:rest
 */

import { Wallet } from '../src/wallet/Wallet';
import { Transaction } from '../src/transaction/Transaction';
import { fetchJson } from '../src/utils/http';

const ENDPOINT = 'http://localhost:12101';

async function restOnlyTest() {
  console.log('🚀 saito.js REST-Only Test\n');
  console.log('='.repeat(50));

  // 1. Create wallet
  console.log('\n📝 Step 1: Creating wallet...');
  const wallet = Wallet.generate();
  console.log('✓ Wallet created');
  console.log('  Public Key:', wallet.publicKey);

  // 2. Get version
  try {
    console.log('\n🏷️  Step 2: Getting node version...');
    const data = await fetchJson<{ wallet_version?: number; saito_js?: string }>(
      `${ENDPOINT}/version`
    );
    console.log('✓ Node wallet version:', data.wallet_version || 'unknown');
    console.log('  Node saito-js (WASM) version:', data.saito_js || 'unknown');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed:', err.message);
    console.log('\n💡 Make sure Saito node is running:');
    console.log('   cd ../saito/node && npm run dev\n');
    process.exit(1);
  }

  // 3. Get balance
  try {
    console.log('\n💰 Step 3: Checking balance...');

    // The /balance endpoint returns plain text, not JSON
    const response = await fetch(`${ENDPOINT}/balance/${wallet.publicKey}`);
    const text = await response.text();

    // Parse the snapshot text format
    const lines = text.split('\n');
    let balance = 0n;

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === wallet.publicKey && parts.length >= 5) {
        balance += BigInt(parts[4]);
      }
    }

    console.log('✓ Balance:', balance.toString(), 'nolan');

    const saito = Number(balance) / 100000000;
    console.log('  =', saito.toFixed(8), 'SAITO');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to get balance:', err.message);
  }

  // 4. Get network stats
  try {
    console.log('\n📊 Step 4: Fetching network stats...');
    const stats = await fetchJson<any>(`${ENDPOINT}/stats`);
    console.log('✓ Network stats:');
    console.log('  ', JSON.stringify(stats, null, 2));
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed:', err.message);
  }

  // 5. Get peers
  try {
    console.log('\n👥 Step 5: Getting connected peers...');
    const data = await fetchJson<{ peers?: any[] }>(`${ENDPOINT}/stats/peers`);
    const peers = data.peers || [];
    console.log('✓ Connected peers:', peers.length);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed:', err.message);
  }

  // 6. Create a transaction (but can't send via REST)
  console.log('\n📦 Step 6: Creating sample transaction...');
  const recipientWallet = Wallet.generate();
  const tx = new Transaction()
    .addFrom(wallet.publicKey, 1000000n)
    .addTo(recipientWallet.publicKey, 1000000n)
    .setMessage({
      module: 'Test',
      message: 'Test from saito.js REST client',
    })
    .sign(wallet);

  console.log('✓ Transaction created');
  console.log('  Signature:', tx.signature.substring(0, 20) + '...');
  console.log('  Size:', tx.serialize().length, 'bytes');
  console.log('\n  ⚠️  Note: Sending transactions requires WebSocket connection');
  console.log('      (or POST endpoint implementation on the node)');

  console.log('\n' + '='.repeat(50));
  console.log('✅ REST API tests completed!\n');
  console.log('📝 Note: This client uses REST API only.');
  console.log('   Full WebSocket support requires WASM deserialization.');
  console.log('   For real-time events, use the full saito-js package.\n');
}

restOnlyTest().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
