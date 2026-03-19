/**
 * Agent Wallet API — Register, provision wallet, and manage identity.
 *
 * POST /api/agent — Register agent + provision wallet + fund with USDC
 * GET  /api/agent — Get agent wallet info
 *
 * Flow:
 *   1. Agent calls POST /api/agent with { name: "MyAgent" }
 *   2. Server generates a wallet, stores in Neon DB, funds with USDC from treasury
 *   3. Returns wallet address — agent is now ready to use paid endpoints
 *   4. All subsequent calls with x-user-id header use the agent's wallet for x402
 *
 * Powered by @0xgasless/agent-sdk on Avalanche Fuji C-Chain.
 */

import { NextResponse } from "next/server";
import {
  provisionAgentWallet,
  getAgentWallet,
  registerAgentIdentity,
} from "@/lib/agent-wallet";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const agentId = url.searchParams.get("id") || req.headers.get("x-user-id");

  if (!agentId) {
    return NextResponse.json({
      error: "Provide ?id=<agent_id> or x-user-id header",
      usage: {
        register: "POST /api/agent with { name: 'MyAgent' }",
        check: "GET /api/agent?id=<agent_id>",
      },
    }, { status: 400 });
  }

  const wallet = await getAgentWallet(agentId);
  if (!wallet) {
    return NextResponse.json({
      error: "Agent not found. Register first: POST /api/agent",
      agentId,
    }, { status: 404 });
  }

  return NextResponse.json({
    agentId,
    wallet: {
      address: wallet.address,
      funded: wallet.funded,
      usdcBalance: wallet.usdcBalance,
      network: "Avalanche Fuji (eip155:43113)",
    },
    capabilities: [
      "x402-gasless-payments",
      "erc8004-identity",
      "account-abstraction",
    ],
    endpoints: {
      paid: [
        "POST /api/x402/generate-image",
        "POST /api/x402/generate-video",
        "POST /api/x402/caption-video",
        "POST /api/x402/publish-reel",
      ],
      free: [
        "POST /api/state/character",
        "POST /api/swarm/trends",
        "POST /api/swarm/scripts",
        "POST /api/swarm/prompt-compile",
        "GET /api/x402/attestation",
      ],
    },
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, action, metadataUri } = body;

    // Register + provision wallet
    if (!action || action === "register") {
      if (!name) {
        return NextResponse.json({ error: "name is required" }, { status: 400 });
      }

      const agentId = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const wallet = await provisionAgentWallet(agentId);

      if (!wallet) {
        return NextResponse.json({
          error: "Wallet provisioning failed. Check AGENT_PRIVATE_KEY and DATABASE_URL.",
          debug: {
            hasPrivateKey: !!process.env.AGENT_PRIVATE_KEY,
            hasDbUrl: !!process.env.DATABASE_URL,
          },
        }, { status: 500 });
      }

      return NextResponse.json({
        registered: true,
        agentId,
        wallet: {
          address: wallet.address,
          funded: wallet.funded,
          usdcBalance: wallet.usdcBalance,
          network: "Avalanche Fuji (eip155:43113)",
        },
        nextSteps: [
          `Use header "x-user-id: ${agentId}" on all API calls`,
          "POST /api/state/character to create your persona",
          "POST /api/swarm/trends to discover topics",
          "All paid endpoints auto-debit from your wallet",
        ],
      });
    }

    // Register on ERC-8004
    if (action === "erc8004-register") {
      const agentId = body.agentId || req.headers.get("x-user-id");
      if (!agentId || !metadataUri) {
        return NextResponse.json(
          { error: "agentId and metadataUri required" },
          { status: 400 }
        );
      }

      const result = await registerAgentIdentity(agentId, metadataUri);
      if (!result) {
        return NextResponse.json(
          { error: "ERC-8004 registration failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        registered: true,
        erc8004: result,
        explorer: `https://testnet.snowtrace.io/tx/${result.txHash}`,
      });
    }

    return NextResponse.json(
      { error: "Unknown action. Use: register, erc8004-register" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
