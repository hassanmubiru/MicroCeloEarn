// Local ABI debugging script
const { ethers } = require('ethers');

async function debugABI() {
  console.log('🔍 Debugging Contract ABI Locally');
  console.log('==================================');
  
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  const rpcUrl = 'https://rpc.ankr.com/celo_sepolia';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log('✅ Connected to Celo Sepolia');
    
    // Test different ABI variations
    const abiVariations = [
      {
        name: 'Current ABI',
        abi: [
          "function getOpenTasks() external view returns (uint256[])",
          "function taskCounter() external view returns (uint256)"
        ]
      },
      {
        name: 'Alternative ABI 1',
        abi: [
          "function getOpenTasks() external view returns (uint256[] memory)",
          "function taskCounter() external view returns (uint256)"
        ]
      },
      {
        name: 'Alternative ABI 2', 
        abi: [
          "function getOpenTasks() external view returns (uint256[] calldata)",
          "function taskCounter() external view returns (uint256)"
        ]
      },
      {
        name: 'Minimal ABI',
        abi: [
          "function taskCounter() external view returns (uint256)"
        ]
      }
    ];
    
    for (const variation of abiVariations) {
      console.log(`\n🧪 Testing ${variation.name}:`);
      
      try {
        const contract = new ethers.Contract(contractAddress, variation.abi, provider);
        
        // Test taskCounter first (simpler function)
        if (variation.abi.some(fn => fn.includes('taskCounter'))) {
          const taskCounter = await contract.taskCounter();
          console.log(`  ✅ taskCounter(): ${taskCounter.toString()}`);
        }
        
        // Test getOpenTasks
        if (variation.abi.some(fn => fn.includes('getOpenTasks'))) {
          const openTasks = await contract.getOpenTasks();
          console.log(`  ✅ getOpenTasks(): [${openTasks.join(', ')}]`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    // Test raw contract inspection
    console.log('\n🔍 Raw Contract Inspection:');
    const code = await provider.getCode(contractAddress);
    console.log(`Contract code length: ${code.length}`);
    
    // Try to get contract creation transaction
    console.log('\n📋 Contract Creation Info:');
    try {
      // This might help us understand the contract structure
      const blockNumber = await provider.getBlockNumber();
      console.log(`Current block: ${blockNumber}`);
    } catch (error) {
      console.log(`Block info error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

debugABI().catch(console.error);
