"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updatePlatformFee, withdrawPlatformFees, getPlatformFee, getContractOwner } from "@/lib/contract-interactions"
import { PaymentToken } from "@/lib/contract-interactions"
import { Loader2, Settings, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react"

export function AdminSettings() {
  const [platformFee, setPlatformFee] = useState<number>(0)
  const [newFee, setNewFee] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [contractOwner, setContractOwner] = useState<string>("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const [fee, owner] = await Promise.all([
          getPlatformFee(),
          getContractOwner()
        ])
        setPlatformFee(fee)
        setContractOwner(owner)
      } catch (err) {
        console.error("[v0] Error loading admin settings:", err)
        setError("Failed to load platform settings")
      }
    }

    loadSettings()
  }, [])

  const handleUpdateFee = async () => {
    if (!newFee || isNaN(Number(newFee))) {
      setError("Please enter a valid fee amount")
      return
    }

    const feeValue = Number(newFee)
    if (feeValue < 0 || feeValue > 1000) {
      setError("Fee must be between 0 and 1000 basis points (0-10%)")
      return
    }

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      await updatePlatformFee(feeValue)
      setPlatformFee(feeValue)
      setNewFee("")
      setSuccess("Platform fee updated successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to update platform fee")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleWithdrawFees = async (token: PaymentToken) => {
    setIsWithdrawing(true)
    setError(null)
    setSuccess(null)

    try {
      await withdrawPlatformFees(token)
      setSuccess(`Platform fees withdrawn successfully!`)
    } catch (err: any) {
      setError(err.message || "Failed to withdraw platform fees")
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentFee">Current Platform Fee</Label>
            <div className="flex items-center gap-2">
              <Input
                id="currentFee"
                value={`${platformFee} basis points (${(platformFee / 100).toFixed(2)}%)`}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Contract Owner: {contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newFee">Update Platform Fee</Label>
            <div className="flex gap-2">
              <Input
                id="newFee"
                type="number"
                placeholder="Enter new fee (basis points)"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                min="0"
                max="1000"
              />
              <Button 
                onClick={handleUpdateFee} 
                disabled={isUpdating || !newFee}
                className="min-w-[120px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Fee"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Fee range: 0-1000 basis points (0-10%). Current: {platformFee} bp
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Withdraw Platform Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Withdraw accumulated platform fees from the contract.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleWithdrawFees(PaymentToken.cUSD)}
              disabled={isWithdrawing}
              variant="outline"
              className="flex-1"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Withdraw cUSD Fees
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleWithdrawFees(PaymentToken.CELO)}
              disabled={isWithdrawing}
              variant="outline"
              className="flex-1"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Withdraw CELO Fees
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
