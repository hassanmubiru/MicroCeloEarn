# MicroCeloEarn

A decentralized micro-earning platform built on the Celo blockchain where users can complete small digital tasks and earn cryptocurrency payments in cUSD or CELO with very low fees.

## Features

- **Task Marketplace**: Browse and complete micro-tasks across various categories
- **Wallet Integration**: Connect with Valora, MetaMask, or WalletConnect
- **Smart Contract Escrow**: Automatic payment protection and release
- **Multi-Currency Support**: Earn in cUSD (stablecoin) or CELO
- **Low Fees**: Only 2.5% platform fee
- **Instant Payments**: Get paid immediately upon task approval
- **Worker Ratings**: Build reputation through quality work
- **Mobile-First Design**: Optimized for mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Blockchain**: Celo blockchain (Alfajores testnet)
- **Smart Contracts**: Solidity with OpenZeppelin
- **Web3**: ethers.js v6
- **Wallet**: Valora, MetaMask, WalletConnect support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Celo wallet (Valora or MetaMask)
- Testnet CELO and cUSD from [Celo Alfajores Faucet](https://faucet.celo.org)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd micro-celo-earn
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Deploy the smart contract (see Smart Contract Deployment section below)

4. Set up environment variables in **Project Settings** (click the gear icon in the top right):
\`\`\`bash
NEXT_PUBLIC_CELO_NETWORK=alfajores
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-contract-address>
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Smart Contract Deployment

### Option 1: Deploy via v0 (Recommended)

1. The smart contract files are already in the `contracts/` directory
2. Run the deployment script directly in v0:
   - Navigate to `scripts/deploy-contracts.js`
   - Click the "Run Script" button in v0
3. Copy the deployed contract address from the output
4. Add it to your environment variables in **Project Settings**

### Option 2: Deploy Manually

1. Navigate to the contracts directory:
\`\`\`bash
cd contracts
\`\`\`

2. Install contract dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the contracts directory:
\`\`\`bash
PRIVATE_KEY=your_private_key_here
CELO_NETWORK=alfajores
\`\`\`

4. Deploy to Alfajores testnet:
\`\`\`bash
npm run deploy:testnet
\`\`\`

5. Copy the deployed contract address and add it to your project's environment variables

## Environment Variables Setup

**IMPORTANT**: You must set these environment variables in **Project Settings** (gear icon in top right):

- `NEXT_PUBLIC_CELO_NETWORK`: Set to `alfajores` for testnet or `mainnet` for production
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed MicroCeloEarn contract address (must be a valid 42-character address starting with 0x)

Without these variables, you'll see a warning banner and won't be able to interact with the blockchain.

## Troubleshooting

### "Contract not configured" error

**Problem**: You see a red warning banner saying "Contract address not configured"

**Solution**: 
1. Make sure you've deployed the smart contract (see Smart Contract Deployment above)
2. Add the contract address to your environment variables in **Project Settings**
3. The address must be exactly 42 characters and start with `0x`
4. Refresh the page after adding the environment variable

### "External transactions to internal accounts cannot include data" error

**Problem**: This error occurs when trying to accept or create tasks

**Solution**: This means the contract address is not set correctly. Follow these steps:
1. Check that `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in **Project Settings**
2. Verify the address is the actual deployed contract address (not your wallet address)
3. Make sure the address is 42 characters long and starts with `0x`
4. Redeploy the contract if needed and update the environment variable

### Wallet connection issues

**Problem**: Can't connect wallet or transactions fail

**Solution**:
1. Make sure you're on the Alfajores testnet
2. Get testnet tokens from [Celo Faucet](https://faucet.celo.org)
3. Try disconnecting and reconnecting your wallet
4. Clear browser cache and reload

### Transaction failures

**Problem**: Transactions fail or get stuck

**Solution**:
1. Ensure you have enough CELO for gas fees
2. For cUSD tasks, make sure you have enough cUSD balance
3. Check that the contract address is correct
4. View transaction details on [Alfajores Explorer](https://alfajores.celoscan.io)

## Usage

### For Workers

1. **Connect Wallet**: Click "Connect Wallet" and choose your wallet provider
2. **Browse Tasks**: Explore available tasks in the marketplace
3. **Accept Task**: Click "Accept Task" to claim a task
4. **Complete Work**: Follow the task instructions and complete the work
5. **Submit**: Submit your completed work for review
6. **Get Paid**: Receive payment automatically when approved

### For Task Posters

1. **Connect Wallet**: Connect your Celo wallet
2. **Post Task**: Click "Post a Task" and fill in the details
3. **Escrow Payment**: Approve the token spending and escrow payment
4. **Review Work**: Review submitted work from workers
5. **Approve & Rate**: Approve work and rate the worker (1-5 stars)

## Project Structure

\`\`\`
micro-celo-earn/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main marketplace page
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles and theme
├── components/            # React components
│   ├── header.tsx         # Navigation header
│   ├── task-marketplace.tsx
│   ├── task-card.tsx
│   ├── wallet-dialog.tsx
│   ├── onboarding-dialog.tsx
│   ├── contract-warning-banner.tsx
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── wallet-context.tsx # Wallet state management
│   ├── contract-interactions.ts
│   └── celo-config.ts
├── contracts/             # Smart contracts
│   ├── MicroCeloEarn.sol
│   └── scripts/
└── public/               # Static assets
\`\`\`

## Smart Contract Functions

- `createTask()`: Create a new task with escrowed payment
- `acceptTask()`: Accept an available task
- `submitTask()`: Submit completed work
- `approveTask()`: Approve work and release payment
- `cancelTask()`: Cancel task and get refund (if not assigned)
- `getOpenTasks()`: Get all available tasks
- `getWorkerProfile()`: Get worker statistics and rating

## Security

- Smart contracts use OpenZeppelin's audited libraries
- ReentrancyGuard protection on payment functions
- Escrow system ensures payment security
- No private keys stored in frontend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub or contact support.

## Acknowledgments

- Built on [Celo](https://celo.org) blockchain
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [Next.js](https://nextjs.org)
