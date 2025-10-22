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
  console.log(`🚀 Deploying MicroCeloEarn to ${network}...`);

  // Check deployer configuration
  const deployerAddress = process.env.DEPLOYER_ADDRESS;
  if (deployerAddress) {
    console.log(`👤 Deployer Address: ${deployerAddress}`);
  }

  // Get token addresses for the current network
  const tokenAddresses = TOKEN_ADDRESSES[network];
  if (!tokenAddresses) {
    throw new Error(`Unsupported network: ${network}`);
  }

  console.log("📋 Token addresses:");
  console.log(`   cUSD: ${tokenAddresses.cUSD}`);
  console.log(`   CELO: ${tokenAddresses.CELO}`);

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

  // Get deployer address (use environment variable or fallback to runner address)
  const finalDeployerAddress = process.env.DEPLOYER_ADDRESS || await microCeloEarn.runner?.getAddress();
  
  // Save deployment info
  const deploymentInfo = {
    network,
    contractAddress,
    cUSD: tokenAddresses.cUSD,
    CELO: tokenAddresses.CELO,
    deployer: finalDeployerAddress,
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
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
