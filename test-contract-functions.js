// Test specific contract functions with exact ABI
const { ethers } = require('ethers');

async function testContractFunctions() {
  console.log('🧪 Testing Contract Functions with Exact ABI');
  console.log('============================================');
  
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  const rpcUrl = 'https://rpc.ankr.com/celo_sepolia';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log('✅ Connected to Celo Sepolia');
    
    // Exact ABI from the contract
    const exactABI = [
      "function getOpenTasks() external view returns (uint256[] memory)",
      "function taskCounter() external view returns (uint256)",
      "function tasks(uint256) external view returns (uint256 id, address poster, address worker, string title, string description, string category, uint256 reward, uint8 paymentToken, uint8 status, uint256 createdAt, uint256 deadline, bool fundsEscrowed)"
    ];
    
    const contract = new ethers.Contract(contractAddress, exactABI, provider);
    
    console.log('\n📊 Testing Basic Functions:');
    
    // Test taskCounter
    try {
      const taskCounter = await contract.taskCounter();
      console.log(`✅ taskCounter(): ${taskCounter.toString()}`);
    } catch (error) {
      console.log(`❌ taskCounter error: ${error.message}`);
    }
    
    // Test getOpenTasks
    try {
      const openTasks = await contract.getOpenTasks();
      console.log(`✅ getOpenTasks(): [${openTasks.join(', ')}] (length: ${openTasks.length})`);
    } catch (error) {
      console.log(`❌ getOpenTasks error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    }
    
    // Test individual task access
    try {
      const taskCounter = await contract.taskCounter();
      if (taskCounter > 0) {
        const task = await contract.tasks(1);
        console.log(`✅ tasks(1): ID=${task.id}, Title="${task.title}"`);
      } else {
        console.log('ℹ️  No tasks to test (taskCounter = 0)');
      }
    } catch (error) {
      console.log(`❌ tasks() error: ${error.message}`);
    }
    
    // Test with different ABI variations
    console.log('\n🔄 Testing ABI Variations:');
    
    const abiVariations = [
      {
        name: 'With memory keyword',
        abi: ["function getOpenTasks() external view returns (uint256[] memory)"]
      },
      {
        name: 'Without memory keyword', 
        abi: ["function getOpenTasks() external view returns (uint256[])"]
      },
      {
        name: 'With calldata keyword',
        abi: ["function getOpenTasks() external view returns (uint256[] calldata)"]
      }
    ];
    
    for (const variation of abiVariations) {
      try {
        console.log(`\n🧪 Testing ${variation.name}:`);
        const testContract = new ethers.Contract(contractAddress, variation.abi, provider);
        const result = await testContract.getOpenTasks();
        console.log(`  ✅ Success: [${result.join(', ')}]`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testContractFunctions().catch(console.error);
