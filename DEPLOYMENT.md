# MicroCeloEarn Deployment Guide

This guide will help you deploy the MicroCeloEarn smart contract to the Celo blockchain.

## Prerequisites

- A wallet with CELO tokens for gas fees
- For testnet: Get free tokens from [Celo Faucet](https://faucet.celo.org/alfajores)
- For mainnet: Purchase CELO from an exchange
- Node.js and npm installed

## Network Configuration

### Celo Sepolia Testnet (Recommended for Testing)
- **RPC URL**: `https://sepolia-forno.celo-testnet.org`
- **Chain ID**: `111447111`
- **Explorer**: https://sepolia.celoscan.io
- **cUSD Address**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- **CELO Address**: `0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9`
- **Faucet**: https://faucet.celo.org/alfajores

### Alfajores Testnet (Alternative Testnet)
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

### Method 1: Hardhat (Recommended)

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
nano .env
```

Fill in your `.env` file:
```env
PRIVATE_KEY=your_wallet_private_key_here
NETWORK=celo_sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

3. **Get Testnet Funds**
   - Visit https://faucet.celo.org/alfajores
   - Enter your wallet address
   - Request CELO tokens

4. **Compile Contracts**
```bash
npx hardhat compile
```

5. **Deploy to Celo Sepolia**
```bash
npx hardhat run scripts/deploy-contracts.js --network celo_sepolia
```

6. **Verify Contract (Optional)**
```bash
npx hardhat verify --network celo_sepolia DEPLOYED_CONTRACT_ADDRESS "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"
```

### Method 2: Remix IDE (Alternative)

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
   - Ensure you're on Celo Sepolia (Chain ID: 111447111)

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

## Quick Start Commands

For Celo Sepolia deployment:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (copy .env.example to .env and fill in your values)
cp .env.example .env

# 3. Compile contracts
npx hardhat compile

# 4. Deploy to Celo Sepolia
npx hardhat run scripts/deploy-contracts.js --network celo_sepolia

# 5. Verify contract (optional)
npx hardhat verify --network celo_sepolia DEPLOYED_CONTRACT_ADDRESS "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"
```

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
