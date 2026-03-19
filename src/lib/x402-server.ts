/**
 * Shared x402 resource server for Avalanche Fuji C-Chain.
 *
 * Implements the official x402 server pattern from the Avalanche Builder Hub:
 *   https://build.avax.network/academy/blockchain/x402-payment-infrastructure
 *
 * Facilitator: Ultravioleta DAO (Avalanche-native, gasless for end-users)
 *   https://build.avax.network/integrations/ultravioletadao
 *
 * Network: Avalanche Fuji Testnet (eip155:43113)
 * Asset:   Circle native USDC (6 decimals)
 * Method:  EIP-3009 transferWithAuthorization (gasless for payer)
 */
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";

// ---------------------------------------------------------------------------
// Avalanche Fuji C-Chain — Network Constants
// Reference: https://build.avax.network/academy/blockchain/x402-payment-infrastructure/04-x402-on-avalanche/02-network-setup
// ---------------------------------------------------------------------------

/** CAIP-2 identifier for Avalanche Fuji Testnet (Chain ID 43113) */
export const AVAX_NETWORK: Network = (
  process.env.X402_CAIP2?.trim() ||
  process.env.X402_NETWORK?.trim() ||
  "eip155:43113"
) as Network;

/** Circle native USDC on Avalanche Fuji — NOT bridged, 6 decimals */
export const AVAX_USDC =
  process.env.X402_ASSET?.trim() ||
  "0x5425890298aed601595a70AB815c96711a31Bc65";

// ---------------------------------------------------------------------------
// Facilitator — Avalanche-native
// Ultravioleta DAO: gasless for users, EIP-3009 settlement, multi-network.
// Endpoints: POST /verify, POST /settle
// Docs: https://build.avax.network/integrations/ultravioletadao
// ---------------------------------------------------------------------------

const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL?.trim() ||
  "https://facilitator.ultravioletadao.xyz";

export const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

// ---------------------------------------------------------------------------
// Server — follows official x402 pattern with chained .register()
// Reference: https://docs.cdp.coinbase.com/x402/quickstart-for-sellers
// ---------------------------------------------------------------------------

export const server = new x402ResourceServer(facilitatorClient)
  .register(AVAX_NETWORK, new ExactEvmScheme());

// Eagerly initialize (silently fails during build, succeeds at runtime)
server.initialize().catch(() => {});
