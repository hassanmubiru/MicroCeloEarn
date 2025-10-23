const { ethers } = require("hardhat");

async function debugPayment() {
  console.log("🔍 Debugging Payment Issues...\n");

  // Contract address
  const contractAddress = "0x508D55343d41e6CCe21e2098A6022F3A14224a9f";
  
  // Token addresses from deployment script
  const tokenAddresses = {
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // From deployment script
    CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", // From deployment script
  };

  try {
    // Get contract instance
    const MicroCeloEarn = await ethers.getContractFactory("MicroCeloEarn");
    const contract = MicroCeloEarn.attach(contractAddress);

    console.log("📋 Contract Information:");
    console.log(`   Address: ${contractAddress}`);
    console.log(`   cUSD Token: ${tokenAddresses.cUSD}`);
    console.log(`   CELO Token: ${tokenAddresses.cUSD}`);

    // Check contract's token addresses
    const contractCUSD = await contract.cUSD();
    const contractCELO = await contract.CELO();
    
    console.log("\n🔍 Contract Token Addresses:");
    console.log(`   Contract cUSD: ${contractCUSD}`);
    console.log(`   Contract CELO: ${contractCELO}`);
    
    // Check if addresses match
    const cUSDMatch = contractCUSD.toLowerCase() === tokenAddresses.cUSD.toLowerCase();
    const CELOMatch = contractCELO.toLowerCase() === tokenAddresses.CELO.toLowerCase();
    
    console.log(`\n✅ Address Verification:`);
    console.log(`   cUSD Match: ${cUSDMatch ? '✅' : '❌'}`);
    console.log(`   CELO Match: ${CELOMatch ? '✅' : '❌'}`);

    if (!cUSDMatch || !CELOMatch) {
      console.log("\n⚠️  WARNING: Token address mismatch detected!");
      console.log("   This could cause payment issues.");
    }

    // Check contract balance
    const contractBalance = await ethers.provider.getBalance(contractAddress);
    console.log(`\n💰 Contract Balance: ${ethers.formatEther(contractBalance)} CELO`);

    // Check if cUSD token exists and has balance
    if (tokenAddresses.cUSD !== "0x0000000000000000000000000000000000000000") {
      try {
        const cUSDContract = new ethers.Contract(
          tokenAddresses.cUSD,
          ["function balanceOf(address) view returns (uint256)"],
          ethers.provider
        );
        const cUSDBalance = await cUSDContract.balanceOf(contractAddress);
        console.log(`   cUSD Balance: ${ethers.formatEther(cUSDBalance)} cUSD`);
      } catch (error) {
        console.log(`   cUSD Balance: Error checking - ${error.message}`);
      }
    } else {
      console.log(`   cUSD: Not available on this network`);
    }

    // Get recent task events
    console.log("\n📊 Recent Task Events:");
    try {
      const filter = contract.filters.TaskCompleted();
      const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
      
      if (events.length > 0) {
        console.log(`   Found ${events.length} completed tasks:`);
        events.slice(-5).forEach((event, index) => {
          const { taskId, worker, reward } = event.args;
          console.log(`   ${index + 1}. Task ${taskId}: ${ethers.formatEther(reward)} to ${worker}`);
        });
      } else {
        console.log("   No completed tasks found in recent blocks");
      }
    } catch (error) {
      console.log(`   Error fetching events: ${error.message}`);
    }

    // Check task counter
    try {
      const taskCounter = await contract.taskCounter();
      console.log(`\n📈 Total Tasks Created: ${taskCounter}`);
    } catch (error) {
      console.log(`   Error getting task counter: ${error.message}`);
    }

  } catch (error) {
    console.error("❌ Error during debugging:", error.message);
  }
}

debugPayment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
