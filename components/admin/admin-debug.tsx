"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { isContractConfigured, CONTRACT_ADDRESS, DEFAULT_NETWORK } from "@/lib/celo-config"
import { ethers } from "ethers"

export function AdminDebug() {
  const { address, isConnected } = useWallet()
  const [checks, setChecks] = useState<Record<string, { status: 'loading' | 'success' | 'error', message: string }>>({})
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setChecks({})

    const newChecks: Record<string, { status: 'loading' | 'success' | 'error', message: string }> = {}

    // Check 1: Wallet Connection
    newChecks.wallet = { status: 'loading', message: 'Checking wallet connection...' }
    setChecks({ ...newChecks })
    
    if (!isConnected || !address) {
      newChecks.wallet = { status: 'error', message: 'Wallet not connected' }
    } else {
      newChecks.wallet = { status: 'success', message: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` }
    }
    setChecks({ ...newChecks })

    // Check 2: Contract Configuration
    newChecks.contract = { status: 'loading', message: 'Checking contract configuration...' }
    setChecks({ ...newChecks })
    
    if (!isContractConfigured()) {
      newChecks.contract = { status: 'error', message: 'Contract not configured' }
    } else {
      newChecks.contract = { status: 'success', message: `Contract: ${CONTRACT_ADDRESS}` }
    }
    setChecks({ ...newChecks })

    // Check 3: Network Connection
    newChecks.network = { status: 'loading', message: 'Checking network connection...' }
    setChecks({ ...newChecks })
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const network = await provider.getNetwork()
      const expectedChainId = DEFAULT_NETWORK.chainId
      
      if (Number(network.chainId) !== expectedChainId) {
        newChecks.network = { 
          status: 'error', 
          message: `Wrong network. Expected: ${expectedChainId}, Got: ${network.chainId}` 
        }
      } else {
        newChecks.network = { 
          status: 'success', 
          message: `Connected to ${DEFAULT_NETWORK.name}` 
        }
      }
    } catch (error) {
      newChecks.network = { status: 'error', message: `Network error: ${error.message}` }
    }
    setChecks({ ...newChecks })

    // Check 4: Admin Address Check
    newChecks.adminAddress = { status: 'loading', message: 'Checking admin address...' }
    setChecks({ ...newChecks })
    
    const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"
    const isAdminAddress = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
    
    if (isAdminAddress) {
      newChecks.adminAddress = { status: 'success', message: 'You are the designated admin' }
    } else {
      newChecks.adminAddress = { 
        status: 'error', 
        message: `Not the admin address. Expected: ${ADMIN_ADDRESS.slice(0, 6)}...${ADMIN_ADDRESS.slice(-4)}` 
      }
    }
    setChecks({ ...newChecks })

    // Check 5: Contract Access
    newChecks.contractAccess = { status: 'loading', message: 'Checking contract access...' }
    setChecks({ ...newChecks })
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function owner() external view returns (address)"],
        provider
      )
      
      const owner = await contract.owner()
      const isOwner = owner.toLowerCase() === address?.toLowerCase()
      
      if (isOwner) {
        newChecks.contractAccess = { status: 'success', message: 'You are the contract owner' }
      } else {
        newChecks.contractAccess = { 
          status: 'error', 
          message: `Not the owner. Owner: ${owner.slice(0, 6)}...${owner.slice(-4)}` 
        }
      }
    } catch (error) {
      newChecks.contractAccess = { status: 'error', message: `Contract access error: ${error.message}` }
    }
    setChecks({ ...newChecks })

    // Check 5: Task Functions
    newChecks.tasks = { status: 'loading', message: 'Checking task functions...' }
    setChecks({ ...newChecks })
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        [
          "function taskCounter() external view returns (uint256)",
          "function getOpenTasks() external view returns (uint256[] memory)"
        ],
        provider
      )
      
      const taskCounter = await contract.taskCounter()
      const openTasks = await contract.getOpenTasks()
      
      newChecks.tasks = { 
        status: 'success', 
        message: `Tasks: ${taskCounter} total, ${openTasks.length} open` 
      }
    } catch (error) {
      newChecks.tasks = { status: 'error', message: `Task functions error: ${error.message}` }
    }
    setChecks({ ...newChecks })

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const allChecksPassed = Object.values(checks).every(check => check.status === 'success')
  const hasErrors = Object.values(checks).some(check => check.status === 'error')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Admin Dashboard Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        {Object.keys(checks).length > 0 && (
          <div className="space-y-3">
            {Object.entries(checks).map(([key, check]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>
        )}

        {allChecksPassed && Object.keys(checks).length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All checks passed! The admin dashboard should be working properly.
            </AlertDescription>
          </Alert>
        )}

        {hasErrors && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Some checks failed. Please fix the issues above before using the admin dashboard.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Return to Main App
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
