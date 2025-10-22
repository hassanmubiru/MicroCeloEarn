"use client"

import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function AdminHeader() {
  const { address, disconnect } = useWallet()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold text-foreground">MicroCeloEarn Admin</h2>
          </div>

          <div className="flex items-center gap-3">
            {address && (
              <>
                <div className="text-sm text-muted-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
