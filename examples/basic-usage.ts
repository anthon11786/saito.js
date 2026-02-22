/**
 * Basic usage example for @saito/client
 */

import { SaitoClient, Wallet, Transaction } from '../src';

async function main() {
  // 1. Create or load a wallet
  const wallet = Wallet.generate();
  console.log('Wallet created:');
  console.log('Public Key:', wallet.publicKey);
  console.log('Private Key:', wallet.getPrivateKey());

  // 2. Connect to a Saito node
  const client = new SaitoClient({
    endpoint: 'ws://localhost:12101/wsopen',
    wallet: wallet,
    network: 'local',
  });

  // 3. Set up event listeners
  client.on('connected', () => {
    console.log('✓ Connected to Saito node');
  });

  client.on('handshake-complete', () => {
    console.log('✓ Handshake complete - ready to transact');
  });

  client.on('transaction', (tx) => {
    console.log('📨 New transaction received:', tx);
  });

  client.on('block', (block) => {
    console.log('📦 New block:', block.id);
  });

  client.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  // 4. Connect
  await client.connect();

  // 5. Get balance
  const balance = await client.getBalance();
  console.log(`Balance: ${balance} nolan`);

  // 6. Send a simple payment
  if (balance > 0n) {
    const recipientKey = 'recipient-public-key-here';
    const txHash = await client.sendPayment(recipientKey, 1000000n, {
      module: 'Payment',
      message: 'Hello from @saito/client!',
    });
    console.log('Transaction sent:', txHash);
  }

  // 7. Create a custom transaction
  const customTx = new Transaction()
    .addTo('recipient-public-key', 500000n)
    .setMessage({
      module: 'Chat',
      request: 'chat message',
      message: 'Hello Saito!',
    })
    .sign(wallet);

  await client.sendTransaction(customTx);

  // 8. Get network stats
  const stats = await client.getStats();
  console.log('Network stats:', stats);

  // Keep running
  console.log('\nClient running... Press Ctrl+C to exit');
}

main().catch(console.error);
