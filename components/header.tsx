"use client"

import { Wallet, Menu, User, LogOut, ExternalLink, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/lib/wallet-context"
import { WalletDialog } from "@/components/wallet-dialog"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import { ContractWarningBanner } from "@/components/contract-warning-banner"
import { useState } from "react"

export function Header() {
  const { address, balance, isConnected, disconnectWallet } = useWallet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleShowTutorial = () => {
    setShowOnboarding(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-foreground">MicroCeloEarn</span>
              <span className="text-xs text-muted-foreground">Earn crypto, your way</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden font-mono text-sm md:inline">{formatAddress(address!)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-3">
                    <p className="text-sm font-medium">Wallet Balance</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">cUSD</span>
                        <span className="font-mono text-sm font-semibold">{balance.cUSD}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">CELO</span>
                        <span className="font-mono text-sm font-semibold">{balance.CELO}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://alfajores.celoscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex cursor-pointer items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShowTutorial}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    View Tutorial
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="gap-2" onClick={() => setShowWalletDialog(true)}>
                <Wallet className="h-4 w-4" />
                <span className="hidden md:inline">Connect Wallet</span>
                <span className="md:hidden">Connect</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isConnected && (
                  <>
                    <DropdownMenuItem onClick={() => setShowWalletDialog(true)}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShowTutorial}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  View Tutorial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ContractWarningBanner />

      <WalletDialog open={showWalletDialog} onOpenChange={setShowWalletDialog} />

      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={() => {
          localStorage.setItem("microceloearn_onboarding_completed", "true")
          setShowOnboarding(false)
        }}
      />
    </>
  )
}
