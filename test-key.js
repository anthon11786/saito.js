const { Wallet } = require('./dist/index.js');

const privateKey = 'd92774e14f569b123987d33200437fa953b95345267390f0ff187a2269062584';
console.log('Testing private key:', privateKey);
console.log('Length:', privateKey.length, 'characters');

try {
  const wallet = Wallet.fromPrivateKey(privateKey);
  console.log('✓ Valid! Public key:', wallet.publicKey);
} catch (err) {
  console.log('✗ Error:', err.message);
  
  // Try with doubled key (Saito might use seed + pubkey format)
  const doubled = privateKey + privateKey;
  console.log('\nTrying doubled key (128 chars)...');
  try {
    const wallet2 = Wallet.fromPrivateKey(doubled);
    console.log('✓ Valid with doubled! Public key:', wallet2.publicKey);
  } catch (err2) {
    console.log('✗ Also failed:', err2.message);
  }
}
