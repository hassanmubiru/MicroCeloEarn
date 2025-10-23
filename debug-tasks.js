const { ethers } = require("ethers");

// Contract configuration
const CONTRACT_ADDRESS = "0x508D55343d41e6CCe21e2098A6022F3A14224a9f";
const RPC_URL = "https://rpc.ankr.com/celo_sepolia";

// ABI for MicroCeloEarn contract
const CONTRACT_ABI = [
  "function getOpenTasks() external view returns (uint256[] memory)",
  "function tasks(uint256) external view returns (uint256 id, address poster, address worker, string title, string description, string category, uint256 reward, uint8 paymentToken, uint8 status, uint256 createdAt, uint256 deadline, bool fundsEscrowed)",
  "function taskCounter() external view returns (uint256)",
];

async function debugTasks() {
  try {
    console.log("🔍 Debugging tasks...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("RPC URL:", RPC_URL);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Get task counter
    const taskCounter = await contract.taskCounter();
    console.log("Total tasks:", Number(taskCounter));
    
    // Get open tasks
    const openTaskIds = await contract.getOpenTasks();
    console.log("Open task IDs:", openTaskIds.map(id => Number(id)));
    
    // Get details for each task
    for (let i = 1; i <= Number(taskCounter); i++) {
      try {
        const task = await contract.tasks(i);
        console.log(`\n📋 Task ${i}:`);
        console.log("  ID:", Number(task.id));
        console.log("  Title:", task.title);
        console.log("  Status:", Number(task.status));
        console.log("  Poster:", task.poster);
        console.log("  Worker:", task.worker);
        console.log("  Reward:", ethers.formatEther(task.reward));
        console.log("  Payment Token:", Number(task.paymentToken));
        console.log("  Deadline:", new Date(Number(task.deadline) * 1000).toISOString());
        console.log("  Funds Escrowed:", task.fundsEscrowed);
      } catch (error) {
        console.log(`❌ Error fetching task ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugTasks();
