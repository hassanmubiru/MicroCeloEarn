# MicroCeloEarn Smart Contracts

## Overview

The MicroCeloEarn smart contract system enables a decentralized micro-task marketplace on the Celo blockchain with the following features:

### Core Features

- **Task Management**: Create, assign, submit, and complete micro-tasks
- **Escrow System**: Automatic fund escrow when tasks are created
- **Multi-Currency Support**: Pay in cUSD (stablecoin) or CELO
- **Worker Ratings**: 5-star rating system for quality assurance
- **Low Fees**: 2.5% platform fee (configurable)
- **Dispute Resolution**: Built-in dispute mechanism

### Contract Architecture

**MicroCeloEarn.sol** - Main contract handling:
- Task lifecycle management
- Payment escrow and distribution
- Worker profile tracking
- Rating system
- Platform fee collection

## Deployment

### Prerequisites

1. Node.js and npm installed
2. Celo wallet with funds (CELO for gas)
3. Private key for deployment wallet

### Testnet Deployment (Alfajores)

\`\`\`bash
# Install dependencies
npm install

# Set environment variables
export CELO_NETWORK=alfajores
export DEPLOYER_PRIVATE_KEY=your_private_key_here

# Deploy contracts
npm run deploy:testnet
\`\`\`

### Mainnet Deployment

\`\`\`bash
# Set environment variables
export CELO_NETWORK=mainnet
export DEPLOYER_PRIVATE_KEY=your_private_key_here

# Deploy contracts
npm run deploy:mainnet
\`\`\`

## Contract Addresses

### Alfajores Testnet
- cUSD: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- CELO: `0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9`

### Mainnet
- cUSD: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- CELO: `0x471EcE3750Da237f93B8E339c536989b8978a438`

## Usage Examples

### Creating a Task

\`\`\`javascript
const reward = ethers.parseUnits("5", 18); // 5 cUSD
const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours

await contract.createTask(
  "Translate 500 words",
  "Translate English to Spanish",
  "Translation",
  reward,
  0, // PaymentToken.cUSD
  deadline
);
\`\`\`

### Accepting a Task

\`\`\`javascript
await contract.acceptTask(taskId);
\`\`\`

### Submitting Completed Work

\`\`\`javascript
await contract.submitTask(taskId);
\`\`\`

### Approving and Paying Worker

\`\`\`javascript
const rating = 5; // 5 stars
await contract.approveTask(taskId, rating);
\`\`\`

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions for platform management
- **Fund Escrow**: Automatic escrow ensures payment security
- **Deadline Enforcement**: Tasks expire after deadline
- **Rating System**: Quality control through peer ratings

## Gas Optimization

The contract is optimized for Celo's low-fee environment:
- Efficient storage patterns
- Minimal external calls
- Batch operations where possible

## Testing

\`\`\`bash
# Run contract tests
npx hardhat test

# Check gas usage
npx hardhat test --gas-reporter
\`\`\`

## License

MIT License
