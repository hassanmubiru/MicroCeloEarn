"use client"

import { useState } from "react"
import { Wallet, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet-context"

interface WalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const { connectWallet, isConnecting, error } = useWallet()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletType: string) => {
    setSelectedWallet(walletType)
    await connectWallet()
    if (!error) {
      onOpenChange(false)
    }
  }

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask browser extension",
      icon: "🦊",
    },
    {
      id: "valora",
      name: "Valora",
      description: "Mobile-first Celo wallet",
      icon: "📱",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Scan QR code with your mobile wallet",
      icon: "🔗",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>Choose a wallet to connect to MicroCeloEarn and start earning</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="h-auto w-full justify-start gap-3 p-4 text-left bg-transparent"
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
            >
              <span className="text-2xl">{wallet.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">{wallet.description}</p>
              </div>
              {isConnecting && selectedWallet === wallet.id && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          ))}
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <p className="font-medium">New to crypto wallets?</p>
          <p className="mt-1 text-xs">
            We recommend starting with Valora for mobile or MetaMask for desktop. Both are free and easy to set up.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
