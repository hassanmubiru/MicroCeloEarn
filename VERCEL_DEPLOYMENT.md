# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

- ✅ Vercel CLI installed
- ✅ Next.js application ready
- ✅ Smart contract deployed
- ✅ Environment variables configured

## 🔧 Deployment Steps

### Step 1: Login to Vercel
```bash
vercel login
```

### Step 2: Set Environment Variables
```bash
# Set your contract address
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
# Enter: 0x508D55343d41e6CCe21e2098A6022F3A14224a9f

# Set your network
vercel env add NEXT_PUBLIC_NETWORK
# Enter: celo_sepolia
```

### Step 3: Deploy to Vercel
```bash
# Deploy to production
npm run deploy

# Or deploy preview
npm run deploy:preview
```

### Step 4: Configure Domain (Optional)
- Go to your Vercel dashboard
- Select your project
- Go to Settings > Domains
- Add your custom domain

## 🌐 Environment Variables

Make sure these are set in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x508D55343d41e6CCe21e2098A6022F3A14224a9f` | Your deployed contract address |
| `NEXT_PUBLIC_NETWORK` | `celo_sepolia` | Celo Sepolia testnet |

## 🔗 Deployment URLs

After deployment, you'll get:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URL**: `https://your-project-git-branch.vercel.app`

## 🛠️ Troubleshooting

### Build Errors
```bash
# Check build locally
npm run build

# Fix any TypeScript errors
npm run lint
```

### Environment Variables
```bash
# List current environment variables
vercel env ls

# Update environment variable
vercel env rm NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
```

### Redeploy
```bash
# Force redeploy
vercel --prod --force
```

## 📱 Mobile Configuration

For mobile wallet connections, ensure:
- MetaMask mobile app is installed
- WalletConnect is configured
- Celo Sepolia network is added to wallet

## 🔒 Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure CORS properly

## 🎯 Next Steps After Deployment

1. **Test the application** on the deployed URL
2. **Connect wallet** and test contract interactions
3. **Create test tasks** to verify functionality
4. **Monitor performance** in Vercel dashboard
5. **Set up custom domain** if needed

---

**🚀 Your MicroCeloEarn platform will be live on Vercel!**
