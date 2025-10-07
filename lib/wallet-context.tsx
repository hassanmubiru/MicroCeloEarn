"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import { DEFAULT_NETWORK } from "./celo-config"

interface WalletContextType {
  address: string | null
  balance: {
    cUSD: string
    CELO: string
  }
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState({ cUSD: "0.00", CELO: "0.00" })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConnected = !!address

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", () => window.location.reload())

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  // Fetch balances when address changes
  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  async function checkConnection() {
    if (typeof window === "undefined" || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()

      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()
        setAddress(userAddress)
      }
    } catch (err) {
      console.error("Error checking connection:", err)
    }
  }

  function handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAddress(accounts[0])
    }
  }

  async function connectWallet() {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask or compatible wallet is installed
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or Valora.")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Check if we're on the correct network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== DEFAULT_NETWORK.chainId) {
        await switchNetwork()
      }

      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      setAddress(userAddress)
      console.log("[v0] Wallet connected:", userAddress)
    } catch (err: any) {
      console.error("[v0] Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  async function switchNetwork() {
    if (typeof window === "undefined" || !window.ethereum) return

    try {
      // Try to switch to Celo network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}`,
                chainName: DEFAULT_NETWORK.name,
                nativeCurrency: DEFAULT_NETWORK.nativeCurrency,
                rpcUrls: [DEFAULT_NETWORK.rpcUrl],
                blockExplorerUrls: [DEFAULT_NETWORK.explorerUrl],
              },
            ],
          })
        } catch (addError) {
          throw new Error("Failed to add Celo network")
        }
      } else {
        throw switchError
      }
    }
  }

  async function fetchBalances() {
    if (!address || typeof window === "undefined" || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Fetch CELO balance
      const celoBalance = await provider.getBalance(address)
      const celoFormatted = ethers.formatEther(celoBalance)

      // Fetch cUSD balance
      const cUSDContract = new ethers.Contract(
        DEFAULT_NETWORK.tokens.cUSD,
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      )
      const cUSDBalance = await cUSDContract.balanceOf(address)
      const cUSDFormatted = ethers.formatEther(cUSDBalance)

      setBalance({
        CELO: Number.parseFloat(celoFormatted).toFixed(2),
        cUSD: Number.parseFloat(cUSDFormatted).toFixed(2),
      })

      console.log("[v0] Balances fetched - CELO:", celoFormatted, "cUSD:", cUSDFormatted)
    } catch (err) {
      console.error("[v0] Error fetching balances:", err)
    }
  }

  function disconnectWallet() {
    setAddress(null)
    setBalance({ cUSD: "0.00", CELO: "0.00" })
    setError(null)
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnecting,
        isConnected,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
