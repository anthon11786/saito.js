/**
 * Simple P2P chat using @saito/client
 */

import { SaitoClient, Wallet } from '../src';
import * as readline from 'readline';

async function main() {
  const wallet = Wallet.generate();

  const client = new SaitoClient({
    endpoint: 'ws://localhost:12101/wsopen',
    wallet: wallet,
  });

  console.log('🔑 Your public key:', wallet.publicKey);
  console.log('Connecting to Saito network...\n');

  await client.connect();
  console.log('✓ Connected!\n');

  // Listen for incoming messages
  client.on('transaction', (tx) => {
    try {
      const msg = JSON.parse(tx.data.toString());
      if (msg.module === 'Chat' && msg.to === wallet.publicKey) {
        console.log(`\n📨 Message from ${msg.from}: ${msg.message}\n> `);
      }
    } catch (e) {
      // Not a chat message
    }
  });

  // Set up CLI input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Usage: <recipient-public-key> <message>');
  console.log('Example: abc123... Hello there!\n');

  rl.on('line', async (input) => {
    const [recipient, ...messageParts] = input.split(' ');
    const message = messageParts.join(' ');

    if (!recipient || !message) {
      console.log('Invalid format. Use: <recipient> <message>');
      return;
    }

    try {
      await client.sendPayment(recipient, 0n, {
        module: 'Chat',
        from: wallet.publicKey,
        to: recipient,
        message: message,
        timestamp: Date.now(),
      });

      console.log('✓ Message sent');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });
}

main().catch(console.error);
