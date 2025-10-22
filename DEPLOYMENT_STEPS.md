# 🚀 MicroCeloEarn Deployment Steps

## ✅ Setup Complete

Your MicroCeloEarn project is now ready for deployment! Here's what has been configured:

### 📁 Files Created/Updated:
- ✅ `hardhat.config.js` - Hardhat configuration for Celo networks
- ✅ `scripts/deploy-contracts.js` - Main deployment script
- ✅ `scripts/demo-deployment.js` - Demo script showing setup requirements
- ✅ `.env` - Environment variables template
- ✅ `package.json` - Updated with all required dependencies
- ✅ `contracts/MicroCeloEarn.sol` - Updated for OpenZeppelin v5 compatibility

### 🔧 Dependencies Installed:
- ✅ Hardhat and all required plugins
- ✅ OpenZeppelin contracts v5
- ✅ Ethers.js v6
- ✅ All compilation dependencies

## 🎯 Next Steps to Deploy

### 1. Get Testnet Tokens
Visit the Celo Faucet and get testnet CELO tokens:
- **Faucet**: https://faucet.celo.org/alfajores
- Enter your wallet address
- Request CELO tokens for gas fees

### 2. Configure Your Wallet
Add your private key to the `.env` file:

```bash
# Edit the .env file
nano .env

# Add your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

### 3. Deploy the Contract

**For Celo Alfajores (Recommended):**
```bash
npx hardhat run scripts/deploy-contracts.js --network alfajores
```

**For Celo Sepolia:**
```bash
npx hardhat run scripts/deploy-contracts.js --network celo_sepolia
```

### 4. After Deployment
1. **Copy the contract address** from the deployment output
2. **Update your .env file** with the contract address:
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here
   ```
3. **Update your frontend** to use the new contract address
4. **Test the contract** functions

## 🌐 Network Information

### Celo Alfajores (Recommended for Testing)
- **RPC URL**: `https://alfajores-forno.celo-testnet.org`
- **Chain ID**: `44787`
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org/alfajores

### Celo Sepolia
- **RPC URL**: `https://sepolia-forno.celo-testnet.org`
- **Chain ID**: `111447111`
- **Explorer**: https://sepolia.celoscan.io

## 🔍 Contract Verification (Optional)

After deployment, verify your contract on CeloScan:

```bash
# For Alfajores
npx hardhat verify --network alfajores DEPLOYED_CONTRACT_ADDRESS "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"

# For Celo Sepolia
npx hardhat verify --network celo_sepolia DEPLOYED_CONTRACT_ADDRESS "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"
```

## 🛠️ Troubleshooting

### "Insufficient funds for gas"
- Get more CELO from the faucet
- Check your wallet has enough balance

### "Private key not found"
- Make sure you've added your private key to `.env`
- Ensure the private key is correct (without 0x prefix)

### "Contract deployment failed"
- Check your internet connection
- Verify the RPC endpoint is accessible
- Try using Alfajores instead of Sepolia

## 📞 Support

- **Celo Documentation**: https://docs.celo.org
- **Celo Discord**: https://discord.gg/celo
- **Hardhat Documentation**: https://hardhat.org/docs

---

**Ready to deploy?** Just add your private key to `.env` and run the deployment command! 🚀
