"use client"

import { useAdminAccess } from "@/hooks/use-admin-access"
import { useWallet } from "@/lib/wallet-context"
import { Loader2, Shield, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminAccessGuardProps {
  children: React.ReactNode
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const { isConnected, connectWallet, address } = useWallet()
  
  // Your specific admin address - direct check
  const ADMIN_ADDRESS = "0x50625608E728cad827066dD78F5B4e8d203619F3"
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Please connect your wallet to access the admin dashboard.
            </p>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Only the designated admin can access the admin dashboard.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Your Address:</strong> {address}</p>
              <p><strong>Expected Admin:</strong> {ADMIN_ADDRESS}</p>
              <p><strong>Match:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
            </div>

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
      </div>
    )
  }

  // Show admin dashboard if access is granted
  return <>{children}</>
}
