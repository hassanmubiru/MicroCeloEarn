"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isContractConfigured, getContractAddressError, CONTRACT_ADDRESS } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"
import Link from "next/link"

export function ContractWarningBanner() {
  const { address } = useWallet()

  if (isContractConfigured()) {
    if (address && CONTRACT_ADDRESS.toLowerCase() === address.toLowerCase()) {
      return (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Contract Configuration</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3">
            <p>
              The contract address is set to your wallet address ({address.slice(0, 6)}...{address.slice(-4)}). This is
              incorrect - you need to deploy the MicroCeloEarn smart contract and use the deployed contract address.
            </p>
            <Link href="/setup">
              <Button variant="outline" size="sm">
                Go to Setup Guide
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }

  const error = getContractAddressError()

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Contract Not Configured</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p>{error}</p>
        <Link href="/setup">
          <Button variant="outline" size="sm">
            Go to Setup Guide
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
