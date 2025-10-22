// Test script to verify contract is accessible
const { ethers } = require('ethers');

async function testContract() {
  try {
    console.log('🔍 Testing contract accessibility...');
    
    // Contract address
    const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
    
    // Celo Sepolia RPC
    const rpcUrl = 'https://rpc.ankr.com/celo_sepolia';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('📡 Connected to Celo Sepolia RPC');
    
    // Check if contract has code
    const code = await provider.getCode(contractAddress);
    console.log('📄 Contract code length:', code.length);
    
    if (code === '0x' || code === '0x0') {
      console.log('❌ No contract found at this address');
    } else {
      console.log('✅ Contract found! Code length:', code.length);
      
      // Try to call a simple function
      const contractABI = [
        "function taskCounter() external view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const taskCounter = await contract.taskCounter();
      console.log('📊 Task counter:', taskCounter.toString());
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testContract();
