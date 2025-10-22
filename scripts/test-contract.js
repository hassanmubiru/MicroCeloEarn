const hre = require("hardhat");

async function main() {
  const contractAddress = "0xc9e6407a8B0cA330ffE3A9eCE20a792aEbb9C1B4";
  
  console.log("🔍 Testing deployed contract...");
  console.log(`📍 Contract Address: ${contractAddress}`);
  
  // Get contract instance
  const MicroCeloEarn = await hre.ethers.getContractFactory("MicroCeloEarn");
  const contract = MicroCeloEarn.attach(contractAddress);
  
  try {
    // Test contract state
    console.log("\n📋 Contract State:");
    console.log("=" * 50);
    
    const cUSD = await contract.cUSD();
    const CELO = await contract.CELO();
    const platformFee = await contract.platformFee();
    const taskCounter = await contract.taskCounter();
    
    console.log(`cUSD Token: ${cUSD}`);
    console.log(`CELO Token: ${CELO}`);
    console.log(`Platform Fee: ${platformFee} (${platformFee / 100}%)`);
    console.log(`Task Counter: ${taskCounter}`);
    
    // Test getting open tasks
    console.log("\n📝 Open Tasks:");
    const openTasks = await contract.getOpenTasks();
    console.log(`Number of open tasks: ${openTasks.length}`);
    
    if (openTasks.length > 0) {
      console.log(`Open task IDs: ${openTasks.join(', ')}`);
    }
    
    console.log("\n✅ Contract is working correctly!");
    console.log("🔗 View on explorer: https://alfajores.celoscan.io/address/" + contractAddress);
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
