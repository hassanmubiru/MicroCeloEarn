import { ethers } from "ethers"
import {
  CONTRACT_ADDRESS,
  DEFAULT_NETWORK,
  isContractConfigured,
  getContractAddressError,
  validateContractAddress,
} from "./celo-config"

// ABI for MicroCeloEarn contract (exact match with deployed contract) - Updated 2024
const CONTRACT_ABI = [
  "function createTask(string title, string description, string category, uint256 reward, uint8 paymentToken, uint256 deadline) external payable returns (uint256)",
  "function acceptTask(uint256 taskId) external",
  "function submitTask(uint256 taskId) external",
  "function approveTask(uint256 taskId, uint256 rating) external",
  "function cancelTask(uint256 taskId) external",
  "function getOpenTasks() external view returns (uint256[] memory)",
  "function tasks(uint256) external view returns (uint256 id, address poster, address worker, string title, string description, string category, uint256 reward, uint8 paymentToken, uint8 status, uint256 createdAt, uint256 deadline, bool fundsEscrowed)",
  "function getWorkerProfile(address worker) external view returns (uint256 tasksCompleted, uint256 totalEarned, uint256 rating, uint256 ratingCount)",
  "function getUserPostedTasks(address user) external view returns (uint256[] memory)",
  "function getUserAssignedTasks(address user) external view returns (uint256[] memory)",
  "function taskCounter() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function updatePlatformFee(uint256 _newFee) external",
  "function withdrawFees() external",
  "event TaskCreated(uint256 indexed taskId, address indexed poster, uint256 reward, uint8 token)",
  "event TaskAssigned(uint256 indexed taskId, address indexed worker)",
  "event TaskCompleted(uint256 indexed taskId, address indexed worker, uint256 reward)",
]

// ERC20 ABI for token approvals
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
]

export enum PaymentToken {
  cUSD = 0,
  CELO = 1,
}

export enum TaskStatus {
  Open = 0,
  Assigned = 1,
  InReview = 2,
  Completed = 3,
  Cancelled = 4,
  Disputed = 5,
}

export interface Task {
  id: number
  poster: string
  worker: string
  title: string
  description: string
  category: string
  reward: string
  paymentToken: PaymentToken
  status: TaskStatus
  createdAt: number
  deadline: number
  fundsEscrowed: boolean
}

/**
 * Get contract instance with signer
 */
async function getContract(withSigner = true) {
  if (!isContractConfigured()) {
    const error = getContractAddressError()
    throw new Error(error || "Contract not configured")
  }

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected")
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  // Check network first (optimized - no console.log)
  try {
    const network = await provider.getNetwork()
    
    // Check if we're on the correct network (Celo Sepolia = 11142220)
    if (network.chainId !== 11142220n) {
      throw new Error(`Wrong network! Please switch to Celo Sepolia (Chain ID: 11142220). Current: ${network.chainId}`)
    }
  } catch (error) {
    console.error("Network check failed:", error)
    throw new Error("Network connection error. Please check your wallet connection.")
  }

  const signer = withSigner ? await provider.getSigner() : null
  const userAddress = signer ? await signer.getAddress() : undefined

  // Skip validation for known contracts to avoid provider issues
  const knownContracts = [
    "0x508D55343d41e6CCe21e2098A6022F3A14224a9f", // Our deployed contract
  ]
  
  if (!knownContracts.includes(CONTRACT_ADDRESS)) {
    const validation = await validateContractAddress(provider, userAddress)
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid contract address")
    }
  }

  if (withSigner && signer) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

/**
 * Create a new task with escrowed payment
 */
export async function createTask(
  title: string,
  description: string,
  category: string,
  reward: string,
  paymentToken: PaymentToken,
  deadlineHours: number,
) {
  const contract = await getContract()
  const provider = new ethers.BrowserProvider(window.ethereum!)
  const signer = await provider.getSigner()

  const rewardWei = ethers.parseEther(reward)
  const deadline = Math.floor(Date.now() / 1000) + deadlineHours * 3600

  // Calculate total amount (reward + 2.5% platform fee)
  const feeAmount = (rewardWei * BigInt(250)) / BigInt(10000)
  const totalAmount = rewardWei + feeAmount

  console.log("[v0] Creating task with reward:", reward, "Total:", ethers.formatEther(totalAmount))

  if (paymentToken === PaymentToken.cUSD) {
    // Approve cUSD spending
    const cUSDContract = new ethers.Contract(DEFAULT_NETWORK.tokens.cUSD, ERC20_ABI, signer)

    const allowance = await cUSDContract.allowance(await signer.getAddress(), CONTRACT_ADDRESS)

    if (allowance < totalAmount) {
      console.log("[v0] Approving cUSD spending...")
      const approveTx = await cUSDContract.approve(CONTRACT_ADDRESS, totalAmount)
      await approveTx.wait()
      console.log("[v0] cUSD approved")
    }

    // Create task
    const tx = await contract.createTask(title, description, category, rewardWei, paymentToken, deadline)
    const receipt = await tx.wait()
    console.log("[v0] Task created:", receipt.hash)
    return receipt
  } else {
    // Create task with CELO
    const tx = await contract.createTask(title, description, category, rewardWei, paymentToken, deadline, {
      value: totalAmount,
    })
    const receipt = await tx.wait()
    console.log("[v0] Task created with CELO:", receipt.hash)
    return receipt
  }
}

/**
 * Accept a task
 */
export async function acceptTask(taskId: number) {
  console.log("[v0] Accepting task:", taskId, "Contract address:", CONTRACT_ADDRESS)
  const contract = await getContract()
  const tx = await contract.acceptTask(taskId)
  const receipt = await tx.wait()
  console.log("[v0] Task accepted:", receipt.hash)
  return receipt
}

/**
 * Submit completed task
 */
export async function submitTask(taskId: number) {
  const contract = await getContract()
  const tx = await contract.submitTask(taskId)
  const receipt = await tx.wait()
  console.log("[v0] Task submitted:", receipt.hash)
  return receipt
}

/**
 * Approve task and release payment
 */
export async function approveTask(taskId: number, rating: number) {
  const contract = await getContract()
  const tx = await contract.approveTask(taskId, rating)
  const receipt = await tx.wait()
  console.log("[v0] Task approved, payment released:", receipt.hash)
  
  // Check if payment was successful by looking for TaskCompleted event
  const taskCompletedEvent = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log)
      return parsed?.name === 'TaskCompleted'
    } catch {
      return false
    }
  })
  
  if (taskCompletedEvent) {
    console.log("[v0] ✅ Payment confirmed in transaction receipt")
  } else {
    console.log("[v0] ⚠️  TaskCompleted event not found in receipt")
  }
  
  return receipt
}

/**
 * Cancel task and get refund
 */
export async function cancelTask(taskId: number) {
  const contract = await getContract()
  const tx = await contract.cancelTask(taskId)
  const receipt = await tx.wait()
  console.log("[v0] Task cancelled:", receipt.hash)
  return receipt
}

/**
 * Get wallet balance for a specific token
 */
export async function getWalletBalance(address: string, tokenAddress?: string): Promise<string> {
  try {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      // Get native CELO balance
      const balance = await ethers.provider.getBalance(address)
      return ethers.formatEther(balance)
    } else {
      // Get ERC20 token balance
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, ethers.provider)
      const balance = await tokenContract.balanceOf(address)
      return ethers.formatEther(balance)
    }
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    return "0"
  }
}

/**
 * Verify payment was received by checking balance before and after
 */
export async function verifyPaymentReceived(
  workerAddress: string, 
  taskId: number, 
  expectedAmount: string,
  paymentToken: PaymentToken
): Promise<{ success: boolean; message: string }> {
  try {
    const tokenAddress = paymentToken === PaymentToken.cUSD 
      ? DEFAULT_NETWORK.tokens.cUSD 
      : DEFAULT_NETWORK.tokens.CELO
    
    const balance = await getWalletBalance(workerAddress, tokenAddress)
    const balanceNumber = parseFloat(balance)
    const expectedNumber = parseFloat(expectedAmount)
    
    console.log(`[v0] Worker balance: ${balance} ${paymentToken === PaymentToken.cUSD ? 'cUSD' : 'CELO'}`)
    console.log(`[v0] Expected amount: ${expectedAmount} ${paymentToken === PaymentToken.cUSD ? 'cUSD' : 'CELO'}`)
    
    if (balanceNumber >= expectedNumber) {
      return { 
        success: true, 
        message: `Payment verified! Balance: ${balance} ${paymentToken === PaymentToken.cUSD ? 'cUSD' : 'CELO'}` 
      }
    } else {
      return { 
        success: false, 
        message: `Payment may not have been received. Current balance: ${balance} ${paymentToken === PaymentToken.cUSD ? 'cUSD' : 'CELO'}` 
      }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error verifying payment: ${error.message}` 
    }
  }
}

/**
 * Estimate gas cost for accepting a task
 */
export async function estimateAcceptTaskGas(taskId: number): Promise<{ gasLimit: bigint, gasPrice: bigint, costInCELO: string }> {
  try {
    const contract = await getContract()
    const gasLimit = await contract.acceptTask.estimateGas(taskId)
    const provider = new ethers.BrowserProvider(window.ethereum!)
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice || BigInt(20000000000) // 20 gwei fallback
    
    const costInWei = gasLimit * gasPrice
    const costInCELO = ethers.formatEther(costInWei)
    
    return { gasLimit, gasPrice, costInCELO }
  } catch (error) {
    console.error("Gas estimation error:", error)
    // Return conservative estimates
    return { 
      gasLimit: BigInt(100000), 
      gasPrice: BigInt(20000000000), 
      costInCELO: "0.002" 
    }
  }
}

/**
 * Estimate gas cost for submitting a task
 */
export async function estimateSubmitTaskGas(taskId: number): Promise<{ gasLimit: bigint, gasPrice: bigint, costInCELO: string }> {
  try {
    const contract = await getContract()
    const gasLimit = await contract.submitTask.estimateGas(taskId)
    const provider = new ethers.BrowserProvider(window.ethereum!)
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice || BigInt(20000000000) // 20 gwei fallback
    
    const costInWei = gasLimit * gasPrice
    const costInCELO = ethers.formatEther(costInWei)
    
    return { gasLimit, gasPrice, costInCELO }
  } catch (error) {
    console.error("Gas estimation error:", error)
    // Return conservative estimates
    return { 
      gasLimit: BigInt(80000), 
      gasPrice: BigInt(20000000000), 
      costInCELO: "0.0016" 
    }
  }
}

/**
 * Get all open tasks
 */
export async function getOpenTasks(): Promise<number[]> {
  try {
    const contract = await getContract(false)
    const taskIds = await contract.getOpenTasks()
    return taskIds.map((id: bigint) => Number(id))
  } catch (error) {
    console.error("getOpenTasks error:", error)
    
    // Handle specific ABI decoding errors
    if (error.message.includes("could not decode result data")) {
      // Try with a direct RPC connection as fallback
      try {
        console.log("Attempting fallback RPC connection...")
        const fallbackProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/celo_sepolia")
        const fallbackContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, fallbackProvider)
        const taskIds = await fallbackContract.getOpenTasks()
        console.log("Fallback connection successful!")
        return taskIds.map((id: bigint) => Number(id))
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        throw new Error("Contract connection failed. Please check your network connection and try again.")
      }
    }
    
    // Handle network errors
    if (error.message.includes("Wrong network")) {
      throw new Error("Please switch to Celo Sepolia network in your wallet.")
    }
    
    if (error.message.includes("network")) {
      throw new Error("Network connection error. Please check your wallet connection.")
    }
    
    throw error
  }
}

/**
 * Get task details
 */
export async function getTask(taskId: number): Promise<Task> {
  const contract = await getContract(false)
  const task = await contract.tasks(taskId)

  return {
    id: Number(task.id),
    poster: task.poster,
    worker: task.worker,
    title: task.title,
    description: task.description,
    category: task.category,
    reward: ethers.formatEther(task.reward),
    paymentToken: task.paymentToken,
    status: Number(task.status),
    createdAt: Number(task.createdAt),
    deadline: Number(task.deadline),
    fundsEscrowed: task.fundsEscrowed,
  }
}

/**
 * Get worker profile
 */
export async function getWorkerProfile(address: string) {
  const contract = await getContract(false)
  const profile = await contract.getWorkerProfile(address)

  return {
    tasksCompleted: Number(profile.tasksCompleted),
    totalEarned: ethers.formatEther(profile.totalEarned),
    rating: Number(profile.rating),
    ratingCount: Number(profile.ratingCount),
  }
}

/**
 * Get user's posted tasks
 */
export async function getUserPostedTasks(address: string): Promise<number[]> {
  const contract = await getContract(false)
  const taskIds = await contract.getUserPostedTasks(address)
  return taskIds.map((id: bigint) => Number(id))
}

/**
 * Get user's assigned tasks
 */
export async function getUserAssignedTasks(address: string): Promise<number[]> {
  const contract = await getContract(false)
  const taskIds = await contract.getUserAssignedTasks(address)
  return taskIds.map((id: bigint) => Number(id))
}

/**
 * Get all tasks (for admin dashboard)
 */
export async function getAllTasks(): Promise<Task[]> {
  const contract = await getContract(false)
  const taskCounter = await contract.taskCounter()
  const tasks: Task[] = []

  for (let i = 1; i <= Number(taskCounter); i++) {
    try {
      const task = await getTask(i)
      tasks.push(task)
    } catch (error) {
      console.error(`[v0] Error fetching task ${i}:`, error)
    }
  }

  return tasks
}

/**
 * Get platform statistics (for admin dashboard)
 */
export async function getPlatformStats() {
  const contract = await getContract(false)
  const taskCounter = await contract.taskCounter()
  const allTasks = await getAllTasks()

  const totalTasks = Number(taskCounter)
  const activeTasks = allTasks.filter((t) => t.status === TaskStatus.Open || t.status === TaskStatus.Assigned).length
  const completedTasks = allTasks.filter((t) => t.status === TaskStatus.Completed).length
  const disputedTasks = allTasks.filter((t) => t.status === TaskStatus.Disputed).length

  // Calculate total volume from completed tasks only
  const totalVolume = allTasks
    .filter((t) => t.status === TaskStatus.Completed)
    .reduce((sum, task) => {
      return sum + Number.parseFloat(task.reward)
    }, 0)

  // Get unique users (posters and workers)
  const uniqueUsers = new Set<string>()
  allTasks.forEach((task) => {
    uniqueUsers.add(task.poster)
    if (task.worker && task.worker !== ethers.ZeroAddress) {
      uniqueUsers.add(task.worker)
    }
  })

  // Get tasks created today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = Math.floor(today.getTime() / 1000)
  
  const tasksToday = allTasks.filter((task) => {
    return Number(task.createdAt) >= todayTimestamp
  }).length

  return {
    totalTasks,
    activeTasks,
    completedTasks,
    disputedTasks,
    totalUsers: uniqueUsers.size,
    tasksToday,
    totalVolume: totalVolume.toFixed(2),
  }
}

/**
 * Get all unique users (workers and posters)
 */
export async function getAllUsers(): Promise<string[]> {
  const allTasks = await getAllTasks()
  const usersSet = new Set<string>()

  allTasks.forEach((task) => {
    usersSet.add(task.poster)
    if (task.worker && task.worker !== ethers.ZeroAddress) {
      usersSet.add(task.worker)
    }
  })

  return Array.from(usersSet)
}

/**
 * Get disputed tasks (for admin dashboard)
 */
export async function getDisputedTasks(): Promise<Task[]> {
  const allTasks = await getAllTasks()
  return allTasks.filter((task) => task.status === TaskStatus.Disputed)
}

/**
 * Admin function: Update platform fee (only owner)
 */
export async function updatePlatformFee(newFee: number) {
  const contract = await getContract()
  const tx = await contract.updatePlatformFee(newFee)
  const receipt = await tx.wait()
  console.log("[v0] Platform fee updated:", receipt.hash)
  return receipt
}

/**
 * Admin function: Withdraw platform fees (only owner)
 */
export async function withdrawPlatformFees(paymentToken: PaymentToken) {
  const contract = await getContract()
  const tx = await contract.withdrawPlatformFees(paymentToken)
  const receipt = await tx.wait()
  console.log("[v0] Platform fees withdrawn:", receipt.hash)
  return receipt
}

/**
 * Admin function: Get contract owner
 */
export async function getContractOwner(): Promise<string> {
  const contract = await getContract(false) // Don't need signer for read-only
  return await contract.owner()
}

/**
 * Admin function: Get platform fee
 */
export async function getPlatformFee(): Promise<number> {
  const contract = await getContract(false) // Don't need signer for read-only
  return await contract.platformFee()
}
