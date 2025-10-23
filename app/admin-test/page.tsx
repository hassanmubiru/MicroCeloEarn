"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/lib/wallet-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function AdminTestPage() {
  const { address, isConnected, connectWallet } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  
  const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Admin Access Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Connection Status</h3>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Address Match</h3>
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{isAdmin ? 'Match' : 'No Match'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Address Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Your Address:</strong> {address || 'Not connected'}</p>
                  <p><strong>Expected Admin:</strong> {ADMIN_ADDRESS}</p>
                  <p><strong>Match Status:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>

              {!isConnected && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet to test admin access.
                  </AlertDescription>
                </Alert>
              )}

              {isConnected && !isAdmin && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your address doesn't match the expected admin address.
                  </AlertDescription>
                </Alert>
              )}

              {isConnected && isAdmin && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ You are the admin! You should have access to the admin dashboard.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-4">
              {!isConnected && (
                <Button onClick={connectWallet} className="flex-1">
                  Connect Wallet
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin'}
                className="flex-1"
              >
                Go to Admin Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Return to Main App
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Debug Information</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• This is a simplified test page</p>
                <p>• No complex contract interactions</p>
                <p>• Direct address comparison only</p>
                <p>• If this works, the issue is in the main admin dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
