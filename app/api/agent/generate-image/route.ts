/**
 * Agent-facing image generation — handles x402 payment automatically
 * using the agent's provisioned wallet. The agent just sends the prompt,
 * the server pays from their wallet balance.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgentSDK } from "@/lib/agent-wallet";
import { resolveUserKey } from "@/lib/moltfluence/request-identity";

const schema = z.object({
  prompt: z.string().min(3).max(2000),
  model: z.string().optional().default("gemini"),
  characterId: z.string().optional(),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const payload = schema.parse(body);
    const agentId = req.headers.get("x-user-id") || "unknown";

    const appBase = process.env.NEXT_PUBLIC_URL || "https://moltfluence-avax-beta.vercel.app";
    const url = `${appBase}/api/x402/generate-image`;

    // Try with agent's wallet SDK (auto-handles x402)
    const sdk = await getAgentSDK(agentId);
    if (sdk) {
      try {
        const res = await sdk.fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": agentId },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (err) {
        console.warn("[agent/generate-image] SDK fetch failed, falling back:", (err as Error).message);
      }
    }

    // Fallback: direct call (will 402 if no payment)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": agentId },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
