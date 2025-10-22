require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Celo Sepolia Testnet
    celo_sepolia: {
      url: "https://sepolia-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 111447111,
      gasPrice: 20000000000, // 20 gwei
    },
    // Celo Alfajores Testnet (alternative)
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787,
    },
    // Celo Mainnet
    celo: {
      url: "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220,
    },
    // Local development
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      celo_sepolia: "your-celoscan-api-key", // Optional: for contract verification
      alfajores: "your-celoscan-api-key",
      celo: "your-celoscan-api-key",
    },
  },
  sourcify: {
    enabled: true,
  },
};
