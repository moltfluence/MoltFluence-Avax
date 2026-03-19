import { NextResponse } from "next/server";
import { getX402Config } from "@/lib/moltfluence/x402-config";
import { getTreasuryWallet } from "@/lib/video-pricing";

/**
 * Agent-friendly endpoint to introspect current x402 configuration.
 * Exposes Avalanche C-Chain network details, facilitator info, and
 * supported payment methods per the x402 protocol.
 *
 * Ref: https://build.avax.network/academy/blockchain/x402-payment-infrastructure
 */
export async function GET(req: Request) {
  const x402 = getX402Config();
  const treasury = getTreasuryWallet();

  const supportedUrl = (() => {
    try {
      return x402.facilitatorUrl ? new URL("/supported", x402.facilitatorUrl).toString() : null;
    } catch {
      return null;
    }
  })();

  const healthUrl = (() => {
    try {
      return x402.facilitatorUrl ? new URL("/health", x402.facilitatorUrl).toString() : null;
    } catch {
      return null;
    }
  })();

  const url = new URL(req.url);
  return NextResponse.json({
    x402: true,
    // Avalanche C-Chain network details
    network: {
      name: "Avalanche Fuji Testnet",
      chainId: 43113,
      caip2: x402.primary.caip2,
      rpc: "https://api.avax-test.network/ext/bc/C/rpc",
      explorer: "https://testnet.snowtrace.io",
      // Ref: https://build.avax.network/academy/blockchain/x402-payment-infrastructure/04-x402-on-avalanche/02-network-setup
    },
    // Circle native USDC on Avalanche Fuji (NOT bridged)
    asset: {
      name: x402.primary.assetName,
      address: x402.primary.asset,
      decimals: 6,
      transferMethod: x402.primary.assetTransferMethod,
      // Ref: faucet.circle.com → select "Avalanche Fuji" for test USDC
    },
    // Facilitator — Avalanche-native
    facilitator: {
      name: "Ultravioleta DAO",
      url: x402.facilitatorUrl ?? null,
      supportedUrl,
      healthUrl,
      features: ["gasless-for-users", "eip3009-settlement", "stateless-verification"],
      // Ref: https://build.avax.network/integrations/ultravioletadao
    },
    treasuryWallet: treasury || null,
    primary: x402.primary,
    assetPersistence: {
      externalEndpointConfigured: Boolean(
        process.env.MOLTFLUENCE_ASSET_PERSIST_ENDPOINT?.trim(),
      ),
      vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    },
    requestOrigin: url.origin,
  });
}
