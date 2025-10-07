"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isContractConfigured, getContractAddressError, CONTRACT_ADDRESS } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"

export function ContractWarningBanner() {
  const { address } = useWallet()

  if (isContractConfigured()) {
    if (address && CONTRACT_ADDRESS.toLowerCase() === address.toLowerCase()) {
      return (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Contract Configuration</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-2">
            <p>
              The contract address is set to your wallet address ({address.slice(0, 6)}...{address.slice(-4)}). This is
              incorrect - you need to deploy the MicroCeloEarn smart contract and use the deployed contract address.
            </p>
            <div className="flex flex-col gap-1 text-sm mt-2">
              <p className="font-medium">To deploy the contract:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Run the deployment script in v0:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">scripts/deploy-contracts.js</code>
                </li>
                <li>Copy the deployed contract address from the output</li>
                <li>Go to Project Settings (gear icon) → Environment Variables</li>
                <li>
                  Update <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> with the
                  deployed address
                </li>
                <li>Refresh the page</li>
              </ol>
            </div>
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
      <AlertDescription className="mt-2 flex flex-col gap-2">
        <p>{error}</p>
        <div className="flex flex-col gap-1 text-sm mt-2">
          <p className="font-medium">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>
              Run the deployment script in v0:{" "}
              <code className="bg-muted px-1 py-0.5 rounded">scripts/deploy-contracts.js</code>
            </li>
            <li>Copy the deployed contract address from the output</li>
            <li>Go to Project Settings (gear icon) → Environment Variables</li>
            <li>
              Add <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> with your contract
              address
            </li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  )
}
