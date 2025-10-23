"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/lib/wallet-context"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, DEFAULT_NETWORK } from "@/lib/celo-config"

// Contract ABI for owner check
const CONTRACT_ABI = [
  "function owner() external view returns (address)"
]

export function useAdminAccess() {
  const { address, isConnected } = useWallet()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Your specific admin address
  const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"

  useEffect(() => {
    async function checkAdminAccess() {
      if (!isConnected || !address) {
        setIsAdmin(false)
        setIsChecking(false)
        return
      }

      try {
        setIsChecking(true)
        setError(null)

        // First check if it's your specific admin address
        const isYourAddress = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
        
        if (isYourAddress) {
          console.log("[v0] ✅ Admin access granted - you are the designated admin")
          setIsAdmin(true)
          setIsChecking(false)
          return
        }

        // Fallback: Check contract owner
        const provider = new ethers.BrowserProvider(window.ethereum!)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        
        // Check if current address is the contract owner
        const owner = await contract.owner()
        const isContractOwner = owner.toLowerCase() === address.toLowerCase()
        
        setIsAdmin(isContractOwner)
        
        if (!isContractOwner) {
          setError(`Access denied. Only the contract owner (${owner.slice(0, 6)}...${owner.slice(-4)}) or the designated admin (${ADMIN_ADDRESS.slice(0, 6)}...${ADMIN_ADDRESS.slice(-4)}) can access the admin dashboard.`)
        }
      } catch (err) {
        console.error("[v0] Error checking admin access:", err)
        setError("Failed to verify admin access. Please check your connection.")
        setIsAdmin(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [isConnected, address])

  return {
    isAdmin,
    isChecking,
    error,
    address
  }
}
