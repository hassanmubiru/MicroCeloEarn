"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/lib/wallet-context"
import { isContractConfigured, CONTRACT_ADDRESS, CELO_NETWORK } from "@/lib/celo-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SetupPage() {
  const { address, connect } = useWallet()
  const { toast } = useToast()
  const [contractDeployed, setContractDeployed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkDeployment = async () => {
      setChecking(true)
      try {
        const configured = await isContractConfigured()
        setContractDeployed(configured)
      } catch (error) {
        setContractDeployed(false)
      } finally {
        setChecking(false)
      }
    }

    checkDeployment()
  }, [mounted])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  if (!mounted) {
    return null
  }

  const networkConfig = {
    alfajores: {
      name: "Celo Alfajores Testnet",
      rpcUrl: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      explorer: "https://alfajores.celoscan.io",
      cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
      faucet: "https://faucet.celo.org/alfajores",
    },
    mainnet: {
      name: "Celo Mainnet",
      rpcUrl: "https://forno.celo.org",
      chainId: 42220,
      explorer: "https://celoscan.io",
      cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
  }

  const network = networkConfig[CELO_NETWORK as keyof typeof networkConfig] || networkConfig.alfajores

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">MicroCeloEarn Setup</h1>
          <p className="text-slate-400">Deploy your smart contract to start earning on Celo</p>
        </div>

        {/* Status Card */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Deployment Status</CardTitle>
            <CardDescription>Check if your contract is deployed and configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Smart Contract</p>
                <p className="text-xs text-slate-400">{CONTRACT_ADDRESS || "Not configured"}</p>
              </div>
              {checking ? (
                <Badge variant="secondary">Checking...</Badge>
              ) : contractDeployed ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Deployed
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Deployed
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Network</p>
                <p className="text-xs text-slate-400">{network.name}</p>
              </div>
              <Badge variant="outline" className="text-celo-green border-celo-green/30">
                {CELO_NETWORK}
              </Badge>
            </div>

            {contractDeployed && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Your contract is deployed and ready! You can now{" "}
                  <Link href="/" className="underline font-medium">
                    start using the platform
                  </Link>
                  .
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Deployment Guide */}
        {!contractDeployed && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Deployment Guide</CardTitle>
              <CardDescription>Follow these steps to deploy your contract</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="remix" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="remix">Remix IDE (Easiest)</TabsTrigger>
                  <TabsTrigger value="hardhat">Hardhat (Advanced)</TabsTrigger>
                </TabsList>

                <TabsContent value="remix" className="space-y-6 mt-6">
                  {/* Step 1 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Get Testnet Funds</h3>
                        <p className="text-sm text-slate-400">
                          Get free CELO tokens from the faucet to pay for deployment gas fees
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => window.open(network.faucet, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Celo Faucet
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Open Remix IDE</h3>
                        <p className="text-sm text-slate-400">
                          Remix is a browser-based Solidity IDE for deploying smart contracts
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => window.open("https://remix.ethereum.org", "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Remix
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Create Contract File</h3>
                        <p className="text-sm text-slate-400">
                          In Remix, create a new file called <code className="text-celo-green">MicroCeloEarn.sol</code>{" "}
                          and paste the contract code
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => window.open("/contracts/MicroCeloEarn.sol", "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Contract Code
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Compile Contract</h3>
                        <p className="text-sm text-slate-400">
                          Go to the Solidity Compiler tab and click "Compile MicroCeloEarn.sol"
                        </p>
                        <Alert className="bg-slate-800/50 border-slate-700">
                          <AlertDescription className="text-xs text-slate-400">
                            Make sure compiler version is set to 0.8.20 or higher
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Connect Wallet</h3>
                        <p className="text-sm text-slate-400">
                          Go to Deploy & Run tab, select "Injected Provider - MetaMask", and connect your wallet
                        </p>
                        <Alert className="bg-slate-800/50 border-slate-700">
                          <AlertDescription className="text-xs text-slate-400">
                            Make sure your wallet is connected to {network.name} (Chain ID: {network.chainId})
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        6
                      </div>
                      <div className="flex-1 space-y-3">
                        <h3 className="font-semibold text-white">Deploy with Constructor Parameters</h3>
                        <p className="text-sm text-slate-400">Enter these addresses as constructor parameters:</p>
                        <div className="space-y-2">
                          <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">cUSD Address:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => copyToClipboard(network.cUSD, "cUSD address")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <code className="text-xs text-celo-green break-all">{network.cUSD}</code>
                          </div>
                          <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">CELO Address:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => copyToClipboard(network.CELO, "CELO address")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <code className="text-xs text-celo-green break-all">{network.CELO}</code>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">
                          Click "Deploy" and confirm the transaction in your wallet
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        7
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Copy Contract Address</h3>
                        <p className="text-sm text-slate-400">
                          After deployment, copy the deployed contract address from Remix
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 8 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        8
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Set Environment Variable</h3>
                        <p className="text-sm text-slate-400">
                          In v0, go to Project Settings → Environment Variables and add:
                        </p>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <code className="text-xs text-celo-green">
                            NEXT_PUBLIC_CONTRACT_ADDRESS = your_deployed_contract_address
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 9 */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celo-green/20 text-celo-green flex items-center justify-center font-bold">
                        9
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">Refresh and Start Using</h3>
                        <p className="text-sm text-slate-400">
                          Refresh this page to verify deployment, then start using MicroCeloEarn!
                        </p>
                        <Button
                          className="bg-celo-green hover:bg-celo-green/90 text-slate-950"
                          onClick={() => window.location.reload()}
                        >
                          Refresh Page
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hardhat" className="space-y-4 mt-6">
                  <Alert className="bg-slate-800/50 border-slate-700">
                    <AlertDescription className="text-slate-400">
                      For advanced users familiar with Hardhat development environment
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4 text-sm text-slate-400">
                    <div>
                      <h4 className="font-semibold text-white mb-2">1. Install Dependencies</h4>
                      <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-xs">
                        npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
                        <br />
                        npm install @openzeppelin/contracts @celo/contractkit
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">2. Configure Hardhat</h4>
                      <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-xs overflow-x-auto">
                        {`// hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: "${network.rpcUrl}",
      accounts: [process.env.PRIVATE_KEY],
      chainId: ${network.chainId}
    }
  }
}`}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">3. Deploy Script</h4>
                      <p className="mb-2">
                        Use the provided deployment script in{" "}
                        <code className="text-celo-green">scripts/deploy-contracts.js</code>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">4. Deploy</h4>
                      <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-xs">
                        npx hardhat run scripts/deploy-contracts.js --network alfajores
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start gap-2 bg-transparent"
              onClick={() => window.open(network.explorer, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              {network.name} Explorer
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 bg-transparent"
              onClick={() => window.open("https://docs.celo.org", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Celo Documentation
            </Button>
            {network.faucet && (
              <Button
                variant="outline"
                className="justify-start gap-2 bg-transparent"
                onClick={() => window.open(network.faucet, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Testnet Faucet
              </Button>
            )}
            <Button
              variant="outline"
              className="justify-start gap-2 bg-transparent"
              onClick={() => window.open("https://remix.ethereum.org", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Remix IDE
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
