// Test the ABI fix
const { ethers } = require('ethers');

async function testABIFix() {
  console.log('🧪 Testing ABI Fix');
  console.log('==================');
  
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  const rpcUrl = 'https://rpc.ankr.com/celo_sepolia';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Updated ABI with memory keyword
    const CONTRACT_ABI = [
      "function getOpenTasks() external view returns (uint256[] memory)",
      "function taskCounter() external view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    
    console.log('✅ Testing updated ABI...');
    
    const taskCounter = await contract.taskCounter();
    console.log(`📊 Task counter: ${taskCounter.toString()}`);
    
    const openTasks = await contract.getOpenTasks();
    console.log(`📋 Open tasks: [${openTasks.join(', ')}] (length: ${openTasks.length})`);
    
    console.log('✅ ABI fix successful!');
    
  } catch (error) {
    console.error('❌ ABI fix failed:', error.message);
  }
}

testABIFix().catch(console.error);
