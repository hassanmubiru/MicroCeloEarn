// Debug task creation issue
const { ethers } = require('ethers');

async function debugTaskCreation() {
  console.log('🔍 Debugging Task Creation Issue');
  console.log('================================');
  
  // Check if we can connect to the contract
  const rpcUrl = 'https://rpc.ankr.com/celo_sepolia';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const contractAddress = '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
  
  // Contract ABI for createTask
  const contractABI = [
    "function createTask(string memory _title, string memory _description, string memory _category, uint256 _reward, uint8 _paymentToken, uint256 _deadline) external payable returns (uint256)"
  ];
  
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Check if contract is accessible
    const code = await provider.getCode(contractAddress);
    if (code.length <= 2) {
      console.log('❌ No contract found at address');
      return;
    }
    
    console.log('✅ Contract found and accessible');
    
    // Check if we can call the function (without executing)
    console.log('✅ Contract ABI is valid');
    
    console.log('\n💡 Possible Issues:');
    console.log('1. Form submission might be causing page refresh');
    console.log('2. Transaction might be failing silently');
    console.log('3. State management issue in React');
    console.log('4. Network/RPC connection issues');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugTaskCreation().catch(console.error);
