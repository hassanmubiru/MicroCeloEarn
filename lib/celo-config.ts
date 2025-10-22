// Celo network configurations
export const CELO_NETWORKS = {
  mainnet: {
    chainId: 42220,
    name: "Celo Mainnet",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    tokens: {
      cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
  },
  alfajores: {
    chainId: 44787,
    name: "Celo Alfajores Testnet",
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    explorerUrl: "https://alfajores.celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    tokens: {
      cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
    },
  },
}

// Default to testnet for development
export const DEFAULT_NETWORK =
  process.env.NEXT_PUBLIC_CELO_NETWORK === "mainnet" ? CELO_NETWORKS.mainnet : CELO_NETWORKS.alfajores

export const CELO_NETWORK = process.env.NEXT_PUBLIC_CELO_NETWORK || "alfajores"

// Contract address (will be set after deployment)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

export const DEMO_MODE = false

// Validate contract address is set
export function isContractConfigured(): boolean {
  return CONTRACT_ADDRESS !== "" && CONTRACT_ADDRESS.startsWith("0x") && CONTRACT_ADDRESS.length === 42
}

export function getContractAddressError(): string | null {
  if (!CONTRACT_ADDRESS) {
    return "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable."
  }
  if (!CONTRACT_ADDRESS.startsWith("0x")) {
    return "Invalid contract address format. Must start with 0x."
  }
  if (CONTRACT_ADDRESS.length !== 42) {
    return "Invalid contract address length. Must be 42 characters (including 0x)."
  }
  return null
}

export async function validateContractAddress(
  provider: any,
  userAddress?: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if it's the same as user's wallet address
    if (userAddress && CONTRACT_ADDRESS.toLowerCase() === userAddress.toLowerCase()) {
      return {
        valid: false,
        error:
          "Contract address is set to your wallet address. Please deploy the smart contract and use the deployed contract address instead.",
      }
    }

    // Check if address has code (is a contract)
    const code = await provider.getCode(CONTRACT_ADDRESS)
    if (code === "0x" || code === "0x0") {
      return {
        valid: false,
        error: "No contract found at this address. Please deploy the MicroCeloEarn smart contract first.",
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate contract: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
