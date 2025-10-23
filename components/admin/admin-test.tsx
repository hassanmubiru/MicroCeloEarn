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
  RefreshCw
} from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { useAdminAccess } from "@/hooks/use-admin-access"

export function AdminTest() {
  const { address, isConnected } = useWallet()
  const { isAdmin, isChecking, error } = useAdminAccess()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"

  const runTests = () => {
    setIsRunning(true)
    const results = []

    // Test 1: Wallet Connection
    results.push({
      name: "Wallet Connection",
      status: isConnected ? 'success' : 'error',
      message: isConnected ? `Connected: ${address}` : 'Not connected'
    })

    // Test 2: Address Match
    const isCorrectAddress = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
    results.push({
      name: "Address Match",
      status: isCorrectAddress ? 'success' : 'error',
      message: isCorrectAddress ? 'Correct admin address' : `Wrong address. Expected: ${ADMIN_ADDRESS}`
    })

    // Test 3: Admin Access Hook
    results.push({
      name: "Admin Access Hook",
      status: isChecking ? 'loading' : (isAdmin ? 'success' : 'error'),
      message: isChecking ? 'Checking...' : (isAdmin ? 'Access granted' : `Access denied: ${error}`)
    })

    // Test 4: Browser Console Check
    results.push({
      name: "Console Logs",
      status: 'info',
      message: 'Check browser console for "[v0]" messages'
    })

    setTestResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [isConnected, address, isAdmin, isChecking, error])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
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
      case 'info':
        return <Badge variant="outline">Info</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Admin Access Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Your Address:</strong> {address || 'Not connected'}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Expected Admin:</strong> {ADMIN_ADDRESS}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Admin Access:</strong> {isChecking ? 'Checking...' : (isAdmin ? '✅ Granted' : '❌ Denied')}
          </p>
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Tests
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Debug Steps:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open browser console (F12)</li>
              <li>Look for "[v0]" messages</li>
              <li>Check for any error messages</li>
              <li>Verify your wallet is connected</li>
              <li>Ensure you're on Celo Sepolia network</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
