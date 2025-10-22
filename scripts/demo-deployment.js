const hre = require("hardhat");

// Token addresses for different networks
const TOKEN_ADDRESSES = {
  celo_sepolia: {
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // Same as Alfajores for now
    CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", // Same as Alfajores for now
  },
  alfajores: {
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
  },
  celo: {
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  },
};

async function main() {
  const network = hre.network.name;
  console.log(`🚀 MicroCeloEarn Deployment Setup for ${network}`);
  console.log("=" * 50);

  // Get token addresses for the current network
  const tokenAddresses = TOKEN_ADDRESSES[network];
  if (!tokenAddresses) {
    throw new Error(`Unsupported network: ${network}`);
  }

  console.log("📋 Network Configuration:");
  console.log(`   Network: ${network}`);
  console.log(`   cUSD: ${tokenAddresses.cUSD}`);
  console.log(`   CELO: ${tokenAddresses.CELO}`);

  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    console.log("\n⚠️  SETUP REQUIRED:");
    console.log("1. Get testnet CELO tokens from: https://faucet.celo.org/alfajores");
    console.log("2. Add your private key to .env file:");
    console.log("   PRIVATE_KEY=your_private_key_here");
    console.log("3. Then run: npx hardhat run scripts/deploy-contracts.js --network " + network);
    
    console.log("\n📝 Contract Constructor Parameters:");
    console.log(`   cUSD Address: ${tokenAddresses.cUSD}`);
    console.log(`   CELO Address: ${tokenAddresses.CELO}`);
    
    console.log("\n🔧 Next Steps After Deployment:");
    console.log("1. Copy the deployed contract address");
    console.log("2. Set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file");
    console.log("3. Update your frontend configuration");
    console.log("4. Test the contract functions");
    
    return;
  }

  console.log("\n✅ Private key found! Proceeding with deployment...");
  
  // Get the contract factory
  const MicroCeloEarn = await hre.ethers.getContractFactory("MicroCeloEarn");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const microCeloEarn = await MicroCeloEarn.deploy(
    tokenAddresses.cUSD,
    tokenAddresses.CELO
  );

  // Wait for deployment to complete
  await microCeloEarn.waitForDeployment();

  const contractAddress = await microCeloEarn.getAddress();
  console.log("✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network}`);
  console.log(`🔗 Explorer: https://${network === 'celo' ? 'celoscan.io' : 'alfajores.celoscan.io'}/address/${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network,
    contractAddress,
    cUSD: tokenAddresses.cUSD,
    CELO: tokenAddresses.CELO,
    deployer: await microCeloEarn.runner?.getAddress(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n📝 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔧 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Set it as NEXT_PUBLIC_CONTRACT_ADDRESS in your environment");
  console.log("3. Update your frontend configuration");
  console.log("4. Test the contract functions");

  // Optional: Verify contract on CeloScan
  if (network !== "hardhat") {
    console.log("\n🔍 To verify the contract on CeloScan, run:");
    console.log(`npx hardhat verify --network ${network} ${contractAddress} "${tokenAddresses.cUSD}" "${tokenAddresses.CELO}"`);
  }

  return deploymentInfo;
}

// Execute deployment
main()
  .then((result) => {
    if (result) {
      console.log("\n🎉 Deployment completed successfully!");
    } else {
      console.log("\n📋 Setup instructions displayed above.");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
