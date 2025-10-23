// Script to add initial tasks to bootstrap the platform
// Run this script to add sample tasks for users to complete

const { ethers } = require('ethers');
require('dotenv').config();

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x508D55343d41e6CCe21e2098A6022F3A14224a9f';
const RPC_URL = 'https://rpc.ankr.com/celo_sepolia';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract ABI for task creation
const CONTRACT_ABI = [
  "function createTask(string memory _title, string memory _description, string memory _category, uint256 _reward, uint8 _paymentToken, uint256 _deadline) external payable returns (uint256)"
];

// Initial tasks to bootstrap the platform
const INITIAL_TASKS = [
  {
    title: "Translate 3 Sentences",
    description: "Translate the following 3 sentences from English to Spanish: 1) 'Hello, how are you?' 2) 'The weather is nice today.' 3) 'I love learning new languages.'",
    category: "Translation",
    reward: "0.05", // 0.05 CELO
    deadlineHours: 24
  },
  {
    title: "Test Our Website",
    description: "Visit our website, test all the main features, and report any bugs or issues you find. Include screenshots if possible.",
    category: "Testing",
    reward: "0.03", // 0.03 CELO
    deadlineHours: 48
  },
  {
    title: "Write a Short Blog Post",
    description: "Write a 200-word blog post about the benefits of blockchain technology. Make it engaging and informative.",
    category: "Content",
    reward: "0.08", // 0.08 CELO
    deadlineHours: 72
  },
  {
    title: "Social Media Share",
    description: "Share our platform on your social media (Twitter, LinkedIn, or Facebook) with a brief description of what MicroCeloEarn does.",
    category: "Marketing",
    reward: "0.02", // 0.02 CELO
    deadlineHours: 12
  },
  {
    title: "Data Entry Task",
    description: "Enter the following 10 contact details into a spreadsheet: Name, Email, Phone, Company. Create a CSV file with proper headers.",
    category: "Data",
    reward: "0.04", // 0.04 CELO
    deadlineHours: 24
  },
  {
    title: "Logo Design",
    description: "Create a simple logo for a startup called 'EcoTech'. The logo should be clean, modern, and represent sustainability.",
    category: "Design",
    reward: "0.15", // 0.15 CELO
    deadlineHours: 168 // 1 week
  },
  {
    title: "Website Review",
    description: "Review our website and provide detailed feedback on: 1) User experience 2) Design 3) Functionality 4) Suggestions for improvement.",
    category: "Review",
    reward: "0.06", // 0.06 CELO
    deadlineHours: 48
  },
  {
    title: "Survey Completion",
    description: "Complete our user experience survey about the MicroCeloEarn platform. Answer all questions honestly and provide constructive feedback.",
    category: "Research",
    reward: "0.03", // 0.03 CELO
    deadlineHours: 24
  }
];

async function addInitialTasks() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    console.log('Please add your private key to the .env file');
    return;
  }

  console.log('🚀 Adding initial tasks to bootstrap the platform...');
  console.log('================================================');

  try {
    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`👤 Admin Address: ${wallet.address}`);
    console.log(`💰 Total Cost: ${INITIAL_TASKS.reduce((sum, task) => sum + parseFloat(task.reward) * 1.025, 0).toFixed(3)} CELO`);
    console.log('');

    let successCount = 0;
    let totalCost = 0;

    for (let i = 0; i < INITIAL_TASKS.length; i++) {
      const task = INITIAL_TASKS[i];
      console.log(`📝 Creating task ${i + 1}/${INITIAL_TASKS.length}: ${task.title}`);

      try {
        const rewardWei = ethers.parseEther(task.reward);
        const deadline = Math.floor(Date.now() / 1000) + task.deadlineHours * 3600;
        
        // Calculate total amount (reward + 2.5% platform fee)
        const feeAmount = (rewardWei * BigInt(250)) / BigInt(10000);
        const totalAmount = rewardWei + feeAmount;

        const tx = await contract.createTask(
          task.title,
          task.description,
          task.category,
          rewardWei,
          1, // PaymentToken.CELO
          deadline,
          {
            value: totalAmount
          }
        );

        console.log(`⏳ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Task created successfully! Gas used: ${receipt.gasUsed.toString()}`);
        
        successCount++;
        totalCost += parseFloat(task.reward) * 1.025;
        
        // Wait 2 seconds between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to create task: ${task.title}`);
        console.error(`Error: ${error.message}`);
      }
    }

    console.log('');
    console.log('🎉 Task Creation Summary:');
    console.log(`✅ Successfully created: ${successCount}/${INITIAL_TASKS.length} tasks`);
    console.log(`💰 Total CELO spent: ${totalCost.toFixed(3)}`);
    console.log(`🌐 View tasks at: https://v0-micro-celo-earn-web-qndtideya-hassan-mubiru-s-projects.vercel.app`);

  } catch (error) {
    console.error('❌ Error adding initial tasks:', error.message);
  }
}

// Run the script
addInitialTasks().catch(console.error);
