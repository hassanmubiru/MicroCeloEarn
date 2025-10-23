// Verify contract deployment and accessibility
const { ethers } = require('ethers');

async function verifyContract() {
  console.log('🔍 Verifying Contract Deployment');
  console.log('===============================');
  
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  
  // Test different RPC endpoints
  const rpcEndpoints = [
    'https://rpc.ankr.com/celo_sepolia',
    'https://forno.celo-sepolia.celo-testnet.org',
    'https://sepolia-forno.celo-testnet.org'
  ];
  
  for (const rpcUrl of rpcEndpoints) {
    console.log(`\n🌐 Testing RPC: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Get network info
      const network = await provider.getNetwork();
      console.log(`  Chain ID: ${network.chainId}`);
      
      // Check if contract has code
      const code = await provider.getCode(contractAddress);
      console.log(`  Contract code length: ${code.length}`);
      
      if (code.length > 2) {
        console.log(`  ✅ Contract found!`);
        
        // Try to call basic functions
        const basicABI = [
          "function taskCounter() external view returns (uint256)"
        ];
        
        const contract = new ethers.Contract(contractAddress, basicABI, provider);
        const taskCounter = await contract.taskCounter();
        console.log(`  📊 Task counter: ${taskCounter.toString()}`);
        
        // Try getOpenTasks with different ABI variations
        const abiVariations = [
          "function getOpenTasks() external view returns (uint256[] memory)",
          "function getOpenTasks() external view returns (uint256[])",
          "function getOpenTasks() external view returns (uint256[] calldata)"
        ];
        
        for (const abi of abiVariations) {
          try {
            const testContract = new ethers.Contract(contractAddress, [abi], provider);
            const openTasks = await testContract.getOpenTasks();
            console.log(`  ✅ getOpenTasks (${abi.split(' ')[4]}): [${openTasks.join(', ')}]`);
            break; // If one works, stop testing
          } catch (error) {
            console.log(`  ❌ getOpenTasks (${abi.split(' ')[4]}): ${error.message}`);
          }
        }
        
      } else {
        console.log(`  ❌ No contract found at this address`);
      }
      
    } catch (error) {
      console.log(`  ❌ Connection error: ${error.message}`);
    }
  }
  
  // Check if this might be a network issue
  console.log('\n🔍 Network Analysis:');
  console.log('Expected: Celo Sepolia (Chain ID: 11142220)');
  console.log('Contract Address: 0x508D55343d41e6CCe21e2098A6022F3A14224a9f');
}

verifyContract().catch(console.error);
