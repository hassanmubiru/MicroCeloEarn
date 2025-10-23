const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`🔍 Checking contract owner on ${network}...`);

  // Contract address (the deployed contract)
  const contractAddress = "0x508D55343d41e6CCe21e2098A6022F3A14224a9f";
  const yourAddress = "0x50625608E728cad827066dD78F5B4e8d203619F3";
  
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`👤 Your Address: ${yourAddress}`);

  try {
    // Get the contract instance
    const MicroCeloEarn = await hre.ethers.getContractFactory("MicroCeloEarn");
    const contract = MicroCeloEarn.attach(contractAddress);

    // Check current owner
    const currentOwner = await contract.owner();
    console.log(`👤 Current Owner: ${currentOwner}`);
    
    // Check if you're the owner
    const isOwner = currentOwner.toLowerCase() === yourAddress.toLowerCase();
    console.log(`✅ Are you the owner? ${isOwner ? 'YES' : 'NO'}`);
    
    if (isOwner) {
      console.log("\n🎉 You are already the owner of this contract!");
      console.log("✅ You should have admin access to the dashboard");
    } else {
      console.log("\n❌ You are not the owner of this contract");
      console.log("\n💡 Solutions:");
      console.log("1. Transfer ownership (if you have access to current owner's wallet)");
      console.log("2. Redeploy the contract with your address as owner");
      console.log("3. Update the frontend to recognize your address as admin");
      
      console.log("\n🔧 To transfer ownership, run:");
      console.log("npx hardhat run scripts/transfer-ownership.js --network celo_sepolia");
      
      console.log("\n🔧 To redeploy with your address as owner, run:");
      console.log("npx hardhat run scripts/redeploy-with-owner.js --network celo_sepolia");
    }
    
  } catch (error) {
    console.error("❌ Error checking contract owner:", error);
  }
}

main()
  .then(() => {
    console.log("\n🔍 Owner check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Owner check failed:", error);
    process.exit(1);
  });
