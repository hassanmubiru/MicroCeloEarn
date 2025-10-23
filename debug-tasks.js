const { ethers } = require("ethers");

async function debugTasks() {
  console.log("🔍 Debugging task statuses...");
  
  try {
    // Connect to Celo Sepolia
    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/celo_sepolia");
    const contractAddress = "0x508D55343d41e6CCe21e2098A6022F3A14224a9f";
    
    // Contract ABI for basic functions
    const contractABI = [
      "function taskCounter() external view returns (uint256)",
      "function tasks(uint256) external view returns (uint256 id, address poster, address worker, string title, string description, string category, uint256 reward, uint8 paymentToken, uint8 status, uint256 createdAt, uint256 deadline, bool fundsEscrowed)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Get total task count
    const taskCounter = await contract.taskCounter();
    console.log(`📊 Total tasks: ${taskCounter}`);
    
    // Check each task
    for (let i = 1; i <= Number(taskCounter); i++) {
      try {
        const task = await contract.tasks(i);
        const status = Number(task.status);
        const statusNames = ["Open", "Assigned", "InReview", "Completed", "Cancelled", "Disputed"];
        
        console.log(`\n📋 Task #${i}:`);
        console.log(`   Title: ${task.title}`);
        console.log(`   Status: ${status} (${statusNames[status] || "Unknown"})`);
        console.log(`   Poster: ${task.poster}`);
        console.log(`   Worker: ${task.worker}`);
        console.log(`   Reward: ${ethers.formatEther(task.reward)} ${task.paymentToken === 0 ? 'cUSD' : 'CELO'}`);
        
        if (status === 2) { // InReview
          console.log(`   ✅ This task is IN REVIEW!`);
        }
      } catch (error) {
        console.log(`❌ Error fetching task ${i}:`, error.message);
      }
    }
    
    console.log("\n🎯 Summary:");
    console.log("- Status 0: Open");
    console.log("- Status 1: Assigned"); 
    console.log("- Status 2: InReview");
    console.log("- Status 3: Completed");
    console.log("- Status 4: Cancelled");
    console.log("- Status 5: Disputed");
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugTasks();
