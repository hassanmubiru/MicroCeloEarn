// Debug script to check network configuration
const { ethers } = require('ethers');

async function debugNetwork() {
  try {
    console.log('🔍 Debugging network configuration...');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  NEXT_PUBLIC_NETWORK:', process.env.NEXT_PUBLIC_NETWORK);
    console.log('  NEXT_PUBLIC_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    
    // Test different RPC endpoints
    const rpcUrls = [
      'https://rpc.ankr.com/celo_sepolia',
      'https://forno.celo-sepolia.celo-testnet.org',
      'https://sepolia-forno.celo-testnet.org'
    ];
    
    for (const rpcUrl of rpcUrls) {
      try {
        console.log(`\n🌐 Testing RPC: ${rpcUrl}`);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Get network info
        const network = await provider.getNetwork();
        console.log(`  Chain ID: ${network.chainId}`);
        console.log(`  Name: ${network.name}`);
        
        // Test contract access
        const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
        const code = await provider.getCode(contractAddress);
        console.log(`  Contract code length: ${code.length}`);
        
        if (code.length > 2) {
          console.log('  ✅ Contract accessible!');
        } else {
          console.log('  ❌ Contract not found');
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugNetwork();
