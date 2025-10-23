"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"

interface AdminBypassProps {
  children: React.ReactNode
}

export function AdminBypass({ children }: AdminBypassProps) {
  const { address, isConnected } = useWallet()
  const [bypassEnabled, setBypassEnabled] = useState(false)
  
  const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"
  const isCorrectAddress = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  // If bypass is enabled or correct address, show admin dashboard
  if (bypassEnabled || isCorrectAddress) {
    return <>{children}</>
  }

  // Show bypass option for debugging
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Admin Access Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Connected Address:</strong> {address || 'Not connected'}
            </p>
            <p className="text-sm">
              <strong>Expected Admin:</strong> {ADMIN_ADDRESS}
            </p>
            <p className="text-sm">
              <strong>Address Match:</strong> {isCorrectAddress ? '✅ Yes' : '❌ No'}
            </p>
          </div>

          {!isCorrectAddress && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your address doesn't match the expected admin address.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => setBypassEnabled(true)}
              className="w-full"
              variant="outline"
            >
              <Shield className="mr-2 h-4 w-4" />
              Enable Admin Bypass (Debug)
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              This bypass is for debugging only. Use with caution.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Main App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
