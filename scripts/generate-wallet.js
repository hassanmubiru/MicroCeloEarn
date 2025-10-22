const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Generating new wallet for deployment...");
  
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("\n📋 New Wallet Details:");
  console.log("=" * 50);
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
  
  console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
  console.log("1. NEVER share your private key with anyone");
  console.log("2. Store the mnemonic phrase safely (12 words)");
  console.log("3. This wallet will be used for deployment only");
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Copy the private key above");
  console.log("2. Add it to your .env file: PRIVATE_KEY=your_private_key_here");
  console.log("3. Get testnet CELO tokens from: https://faucet.celo.org/alfajores");
  console.log("4. Send the testnet CELO to this address:", wallet.address);
  console.log("5. Run deployment: npx hardhat run scripts/deploy-contracts.js --network alfajores");
  
  console.log("\n💡 Tip: You can also use this wallet in MetaMask:");
  console.log("- Import using the private key or mnemonic phrase");
  console.log("- Add Celo Alfajores network (Chain ID: 44787)");
  console.log("- Switch to Alfajores network to see your testnet tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error generating wallet:", error);
    process.exit(1);
  });
