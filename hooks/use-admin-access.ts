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

        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum!)
        
        // Get contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        
        // Check if current address is the contract owner
        const owner = await contract.owner()
        const isContractOwner = owner.toLowerCase() === address.toLowerCase()
        
        setIsAdmin(isContractOwner)
        
        if (!isContractOwner) {
          setError("Access denied. Only the contract owner can access the admin dashboard.")
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
