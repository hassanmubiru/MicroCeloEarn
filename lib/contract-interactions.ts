import { ethers } from "ethers"
import {
  CONTRACT_ADDRESS,
  DEFAULT_NETWORK,
  isContractConfigured,
  getContractAddressError,
  validateContractAddress,
} from "./celo-config"

// ABI for MicroCeloEarn contract (simplified for key functions)
const CONTRACT_ABI = [
  "function createTask(string title, string description, string category, uint256 reward, uint8 paymentToken, uint256 deadline) external payable returns (uint256)",
  "function acceptTask(uint256 taskId) external",
  "function submitTask(uint256 taskId) external",
  "function approveTask(uint256 taskId, uint256 rating) external",
  "function cancelTask(uint256 taskId) external",
  "function getOpenTasks() external view returns (uint256[])",
  "function tasks(uint256) external view returns (uint256 id, address poster, address worker, string title, string description, string category, uint256 reward, uint8 paymentToken, uint8 status, uint256 createdAt, uint256 deadline, bool fundsEscrowed)",
  "function getWorkerProfile(address worker) external view returns (uint256 tasksCompleted, uint256 totalEarned, uint256 rating, uint256 ratingCount)",
  "function getUserPostedTasks(address user) external view returns (uint256[])",
  "function getUserAssignedTasks(address user) external view returns (uint256[])",
  "function taskCounter() external view returns (uint256)",
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

  const signer = withSigner ? await provider.getSigner() : null
  const userAddress = signer ? await signer.getAddress() : undefined

  const validation = await validateContractAddress(provider, userAddress)
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid contract address")
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
 * Get all open tasks
 */
export async function getOpenTasks(): Promise<number[]> {
  const contract = await getContract(false)
  const taskIds = await contract.getOpenTasks()
  return taskIds.map((id: bigint) => Number(id))
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
    status: task.status,
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

  // Calculate total volume
  const totalVolume = allTasks.reduce((sum, task) => {
    return sum + Number.parseFloat(task.reward)
  }, 0)

  return {
    totalTasks,
    activeTasks,
    completedTasks,
    disputedTasks,
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
