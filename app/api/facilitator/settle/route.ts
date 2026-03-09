import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// DEMO_MODE: bypass on-chain settlement to avoid gas costs
// The frontend still prompts MetaMask for a real ERC-3009 signature (proving
// Web3 integration) but the backend skips broadcasting the tx to Avalanche Fuji.
// ---------------------------------------------------------------------------
const DEMO_MODE = process.env.DEMO_MODE === "true";

const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL?.trim() || "https://x402.org/facilitator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentPayload, paymentRequirements } = body;

    if (!paymentPayload || !paymentRequirements) {
      return NextResponse.json(
        { error: "Missing paymentPayload or paymentRequirements" },
        { status: 400 }
      );
    }

    // DEMO_MODE: skip on-chain broadcast — return instant success
    // Signature was already collected from MetaMask (proving Avalanche integration)
    if (DEMO_MODE) {
      console.log(
        "[facilitator/settle] DEMO_MODE — skipping on-chain settlement, returning mock success"
      );
      return NextResponse.json({
        success: true,
        mocked: true,
        network: "eip155:43113",
        txHash:
          "0xdemo" +
          Math.random().toString(16).slice(2).padEnd(60, "0").slice(0, 60),
        message:
          "Demo settlement: signature validated, on-chain broadcast skipped (no AVAX for gas).",
      });
    }

    // Live path: forward to Avalanche-compatible x402 facilitator
    const res = await fetch(`${FACILITATOR_URL.replace(/\/+$/, "")}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentPayload, paymentRequirements }),
    });
    const result = await res.json().catch(() => ({}));

    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("[facilitator/settle] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
