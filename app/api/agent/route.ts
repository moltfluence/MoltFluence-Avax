/**
 * Agent Wallet API — Discover agent identity, wallet, and capabilities.
 *
 * GET  /api/agent — Get agent wallet info, ERC-8004 identity, x402 config
 * POST /api/agent — Register agent identity on ERC-8004
 *
 * Powered by @0xgasless/agent-sdk on Avalanche Fuji C-Chain.
 * Ref: https://build.avax.network/integrations/0xgasless
 */

import { NextResponse } from "next/server";
import {
  getAgentWalletInfo,
  registerAgentIdentity,
  getAgentReputation,
} from "@/lib/agent-wallet";

export async function GET(): Promise<NextResponse> {
  const info = await getAgentWalletInfo();

  if (!info) {
    return NextResponse.json({
      error: "Agent wallet not configured. Set AGENT_PRIVATE_KEY env var.",
      setup: {
        required: ["AGENT_PRIVATE_KEY"],
        description:
          "The agent wallet enables autonomous x402 payments and ERC-8004 identity on Avalanche Fuji.",
        sdk: "@0xgasless/agent-sdk",
        docs: "https://build.avax.network/integrations/0xgasless",
      },
    }, { status: 503 });
  }

  return NextResponse.json({
    agent: {
      address: info.address,
      network: info.network,
      capabilities: [
        "x402-gasless-payments",
        "erc8004-identity",
        "erc8004-reputation",
        "account-abstraction",
        "teleporter-attestation",
      ],
    },
    erc8004: info.erc8004,
    x402: info.x402,
    endpoints: {
      paidWithAutoPayment: [
        "POST /api/x402/generate-video",
        "POST /api/x402/generate-image",
        "POST /api/x402/caption-video",
        "POST /api/x402/publish-reel",
      ],
      free: [
        "GET /api/state/character",
        "POST /api/state/character",
        "POST /api/swarm/trends",
        "POST /api/swarm/scripts",
        "POST /api/swarm/prompt-compile",
        "GET /api/x402/attestation",
        "GET /api/x402/quota",
        "GET /api/x402/info",
      ],
    },
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { action, name, metadataUri, agentId } = body;

    if (action === "register") {
      if (!name || !metadataUri) {
        return NextResponse.json(
          { error: "name and metadataUri required for registration" },
          { status: 400 }
        );
      }
      const result = await registerAgentIdentity(name, metadataUri);
      if (!result) {
        return NextResponse.json(
          { error: "Agent wallet not configured or registration failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ registered: true, ...result });
    }

    if (action === "reputation") {
      if (!agentId) {
        return NextResponse.json(
          { error: "agentId required for reputation query" },
          { status: 400 }
        );
      }
      const result = await getAgentReputation(Number(agentId));
      return NextResponse.json(result ?? { score: 0 });
    }

    return NextResponse.json(
      { error: "Unknown action. Use: register, reputation" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
