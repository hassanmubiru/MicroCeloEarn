# Admin Task Creation Guide

## 🎯 How to Add Initial Tasks as Admin

### Method 1: Using Admin Dashboard (Recommended)

1. **Access Admin Dashboard**
   - Go to: https://v0-micro-celo-earn-web-qndtideya-hassan-mubiru-s-projects.vercel.app/admin
   - Connect your admin wallet (the one that deployed the contract)
   - You should see the admin dashboard

2. **Create Tasks**
   - Click on the "Create Task" tab
   - Use the pre-configured templates or create custom tasks
   - Set low rewards (0.02 - 0.15 CELO) to bootstrap the platform

### Method 2: Using the Script (Automated)

1. **Run the Initial Tasks Script**
   ```bash
   node scripts/add-initial-tasks.js
   ```

2. **What the Script Does**
   - Creates 8 sample tasks automatically
   - Total cost: ~0.5 CELO
   - Tasks range from 0.02 to 0.15 CELO each

## 📋 Sample Tasks to Create

### Low-Cost Tasks (0.02 - 0.05 CELO)
- **Translation**: "Translate 3 sentences from English to Spanish"
- **Social Media**: "Share our platform on social media"
- **Survey**: "Complete our user experience survey"
- **Testing**: "Test our website and report bugs"

### Medium-Cost Tasks (0.06 - 0.10 CELO)
- **Content**: "Write a 200-word blog post about blockchain"
- **Review**: "Review our website and provide feedback"
- **Data Entry**: "Enter 10 contact details into spreadsheet"

### Higher-Cost Tasks (0.11 - 0.15 CELO)
- **Design**: "Create a simple logo for a startup"
- **Development**: "Write a simple HTML page"

## 💰 Cost Breakdown

| Task Type | Reward | Platform Fee (2.5%) | Total Cost |
|-----------|--------|---------------------|------------|
| Translation | 0.05 CELO | 0.00125 CELO | 0.05125 CELO |
| Testing | 0.03 CELO | 0.00075 CELO | 0.03075 CELO |
| Content | 0.08 CELO | 0.002 CELO | 0.082 CELO |
| Marketing | 0.02 CELO | 0.0005 CELO | 0.0205 CELO |
| Data Entry | 0.04 CELO | 0.001 CELO | 0.041 CELO |
| Design | 0.15 CELO | 0.00375 CELO | 0.15375 CELO |
| Review | 0.06 CELO | 0.0015 CELO | 0.0615 CELO |
| Research | 0.03 CELO | 0.00075 CELO | 0.03075 CELO |

**Total Cost: ~0.47 CELO** (to bootstrap the entire platform)

## 🚀 Bootstrap Strategy

### Phase 1: Create 5-8 Initial Tasks
- Use the admin dashboard to create tasks
- Focus on simple, quick tasks
- Set rewards between 0.02 - 0.15 CELO
- This will cost approximately 0.3 - 0.5 CELO total

### Phase 2: Monitor Activity
- Check the admin dashboard for task activity
- See which tasks get accepted first
- Adjust task types based on user interest

### Phase 3: Scale Up
- Create more tasks as users start participating
- Increase rewards for popular task types
- Let users create their own tasks

## 🎯 Quick Start Checklist

- [ ] Access admin dashboard with deployer wallet
- [ ] Create 5-8 low-cost tasks (0.02 - 0.15 CELO each)
- [ ] Use the task templates for quick setup
- [ ] Monitor task acceptance in admin dashboard
- [ ] Adjust strategy based on user activity

## 📱 Admin Dashboard Features

- **Create Task Tab**: Add new tasks with templates
- **Tasks Tab**: View all tasks and their status
- **Users Tab**: Monitor user activity
- **Settings Tab**: Manage platform fees and withdrawals
- **Overview Tab**: See platform statistics

## 🔒 Security Notes

- Only the contract deployer wallet can access admin features
- All admin actions are verified on-chain
- Cannot be bypassed or spoofed
- Real-time verification on every access

## 🌐 URLs

- **Main App**: https://v0-micro-celo-earn-web-qndtideya-hassan-mubiru-s-projects.vercel.app
- **Admin Dashboard**: https://v0-micro-celo-earn-web-qndtideya-hassan-mubiru-s-projects.vercel.app/admin
- **Contract**: 0x508D55343d41e6CCe21e2098A6022F3A14224a9f (Celo Sepolia)
