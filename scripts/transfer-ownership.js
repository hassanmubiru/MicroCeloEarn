const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`🔄 Transferring ownership on ${network}...`);

  // Contract address (the deployed contract)
  const contractAddress = "0x508D55343d41e6CCe21e2098A6022F3A14224a9f";
  
  // New owner address
  const newOwnerAddress = "0x50625608E728cad827066dD78F5B4e8d203619F3";
  
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`👤 New Owner: ${newOwnerAddress}`);

  // Get the contract instance
  const MicroCeloEarn = await hre.ethers.getContractFactory("MicroCeloEarn");
  const contract = MicroCeloEarn.attach(contractAddress);

  try {
    // Check current owner
    const currentOwner = await contract.owner();
    console.log(`👤 Current Owner: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() === newOwnerAddress.toLowerCase()) {
      console.log("✅ You are already the owner of this contract!");
      return;
    }

    // Transfer ownership
    console.log("⏳ Transferring ownership...");
    const tx = await contract.transferOwnership(newOwnerAddress);
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("✅ Ownership transferred successfully!");
    console.log(`🔗 Transaction Receipt: ${receipt.hash}`);
    
    // Verify new owner
    const newOwner = await contract.owner();
    console.log(`👤 New Owner: ${newOwner}`);
    
    if (newOwner.toLowerCase() === newOwnerAddress.toLowerCase()) {
      console.log("🎉 Ownership transfer confirmed!");
    } else {
      console.log("❌ Ownership transfer failed!");
    }
    
  } catch (error) {
    console.error("❌ Error transferring ownership:", error);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("\n💡 Solution:");
      console.log("1. Connect with the wallet that deployed the contract");
      console.log("2. Or redeploy the contract with your address as owner");
    }
  }
}

main()
  .then(() => {
    console.log("\n🎉 Ownership transfer completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ownership transfer failed:", error);
    process.exit(1);
  });
