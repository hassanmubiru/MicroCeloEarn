// Comprehensive contract detection debugging
const { ethers } = require('ethers');

async function debugContractDetection() {
  console.log('🔍 Comprehensive Contract Detection Debug');
  console.log('==========================================');
  
  // Test contract address
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  
  // Test different scenarios
  const scenarios = [
    {
      name: 'Ankr RPC',
      rpcUrl: 'https://rpc.ankr.com/celo_sepolia',
      chainId: 11142220
    },
    {
      name: 'Celo Forno RPC',
      rpcUrl: 'https://forno.celo-sepolia.celo-testnet.org',
      chainId: 11142220
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n🌐 Testing ${scenario.name}:`);
    console.log(`   RPC: ${scenario.rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(scenario.rpcUrl);
      
      // Test basic connection
      const network = await provider.getNetwork();
      console.log(`   ✅ Connected - Chain ID: ${network.chainId}`);
      
      // Test contract code
      const code = await provider.getCode(contractAddress);
      console.log(`   📄 Contract code length: ${code.length}`);
      
      if (code.length > 2) {
        console.log(`   ✅ Contract found!`);
        
        // Test contract functions
        const contractABI = [
          "function taskCounter() external view returns (uint256)",
          "function getOpenTasks() external view returns (uint256[])"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        try {
          const taskCounter = await contract.taskCounter();
          console.log(`   📊 Task counter: ${taskCounter.toString()}`);
          
          const openTasks = await contract.getOpenTasks();
          console.log(`   📋 Open tasks: ${openTasks.length}`);
          
        } catch (contractError) {
          console.log(`   ⚠️  Contract call error: ${contractError.message}`);
        }
        
      } else {
        console.log(`   ❌ No contract found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Connection error: ${error.message}`);
    }
  }
  
  // Test environment variable loading
  console.log('\n📋 Environment Variables:');
  console.log(`   NEXT_PUBLIC_NETWORK: ${process.env.NEXT_PUBLIC_NETWORK || 'undefined'}`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS: ${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'undefined'}`);
  
  // Test contract address validation
  console.log('\n🔍 Contract Address Validation:');
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractAddress;
  console.log(`   Address: ${address}`);
  console.log(`   Starts with 0x: ${address.startsWith('0x')}`);
  console.log(`   Length: ${address.length} (should be 42)`);
  console.log(`   Valid format: ${address.startsWith('0x') && address.length === 42}`);
}

debugContractDetection().catch(console.error);
