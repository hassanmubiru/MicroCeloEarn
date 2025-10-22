# MicroCeloEarn Deployment Guide

This guide will help you deploy the MicroCeloEarn smart contract to the Celo blockchain.

## Prerequisites

- A wallet with CELO tokens for gas fees
- For testnet: Get free tokens from [Celo Faucet](https://faucet.celo.org/alfajores)
- For mainnet: Purchase CELO from an exchange

## Network Configuration

### Alfajores Testnet (Recommended for Testing)
- **RPC URL**: `https://alfajores-forno.celo-testnet.org`
- **Chain ID**: `44787`
- **Explorer**: https://alfajores.celoscan.io
- **cUSD Address**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- **CELO Address**: `0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9`
- **Faucet**: https://faucet.celo.org/alfajores

### Celo Mainnet
- **RPC URL**: `https://forno.celo.org`
- **Chain ID**: `42220`
- **Explorer**: https://celoscan.io
- **cUSD Address**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **CELO Address**: `0x471EcE3750Da237f93B8E339c536989b8978a438`

## Deployment Methods

### Method 1: Remix IDE (Easiest)

1. **Get Testnet Funds**
   - Visit https://faucet.celo.org/alfajores
   - Enter your wallet address
   - Request CELO tokens

2. **Open Remix**
   - Go to https://remix.ethereum.org
   - Create a new file: `MicroCeloEarn.sol`
   - Copy the contract code from `contracts/MicroCeloEarn.sol`

3. **Compile Contract**
   - Go to "Solidity Compiler" tab
   - Select compiler version `0.8.20` or higher
   - Click "Compile MicroCeloEarn.sol"

4. **Connect Wallet**
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - Connect your wallet
   - Ensure you're on Celo Alfajores (Chain ID: 44787)

5. **Deploy Contract**
   - Select `MicroCeloEarn` contract
   - Enter constructor parameters:
     - `_cUSD`: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
     - `_cELO`: `0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9`
   - Click "Deploy"
   - Confirm transaction in wallet

6. **Copy Contract Address**
   - After deployment, copy the contract address from Remix
   - Save it for the next step

7. **Configure Environment Variable**
   - In v0, go to Project Settings (gear icon)
   - Navigate to Environment Variables
   - Add: `NEXT_PUBLIC_CONTRACT_ADDRESS` = `your_deployed_contract_address`
   - Save and refresh the app

### Method 2: Hardhat (Advanced)

1. **Install Dependencies**
\`\`\`bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts @celo/contractkit ethers
\`\`\`

2. **Initialize Hardhat**
\`\`\`bash
npx hardhat init
\`\`\`

3. **Configure Hardhat**

Create `hardhat.config.js`:
\`\`\`javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220,
    },
  },
};
\`\`\`

4. **Create Deployment Script**

Create `scripts/deploy.js`:
\`\`\`javascript
const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`Deploying to ${network}...`);

  // Token addresses
  const addresses = {
    alfajores: {
      cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
    },
    celo: {
      cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
  };

  const { cUSD, CELO } = addresses[network] || addresses.alfajores;

  // Deploy contract
  const MicroCeloEarn = await hre.ethers.getContractFactory("MicroCeloEarn");
  const contract = await MicroCeloEarn.deploy(cUSD, CELO);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`MicroCeloEarn deployed to: ${address}`);
  console.log(`\nAdd this to your environment variables:`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

5. **Deploy**
\`\`\`bash
# Testnet
npx hardhat run scripts/deploy.js --network alfajores

# Mainnet
npx hardhat run scripts/deploy.js --network celo
\`\`\`

6. **Verify Contract (Optional)**
\`\`\`bash
npx hardhat verify --network alfajores DEPLOYED_CONTRACT_ADDRESS "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"
\`\`\`

## Post-Deployment

1. **Set Environment Variable**
   - Copy the deployed contract address
   - In v0: Settings → Environment Variables
   - Add: `NEXT_PUBLIC_CONTRACT_ADDRESS` = `your_contract_address`

2. **Verify Deployment**
   - Visit `/setup` in your app
   - Check that the contract status shows "Deployed"
   - View your contract on the explorer

3. **Test the Platform**
   - Connect your wallet
   - Create a test task
   - Accept and complete tasks
   - Verify transactions on the explorer

## Troubleshooting

### "Insufficient funds for gas"
- Get more CELO from the faucet (testnet) or purchase (mainnet)

### "Contract not found at address"
- Verify the contract address is correct
- Check you're on the right network (testnet vs mainnet)
- Ensure the contract was successfully deployed

### "Transaction failed"
- Check you have enough CELO for gas
- Verify constructor parameters are correct
- Try increasing gas limit

## Security Notes

- **Never share your private key**
- Test thoroughly on Alfajores before mainnet deployment
- Consider getting a security audit for mainnet
- Start with small amounts to test functionality

## Support

- [Celo Documentation](https://docs.celo.org)
- [Celo Discord](https://discord.gg/celo)
- [Remix Documentation](https://remix-ide.readthedocs.io)
