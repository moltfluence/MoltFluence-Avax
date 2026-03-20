#!/usr/bin/env node

/**
 * Moltfluence MCP Server with x402 Auto-Payment
 *
 * Uses @x402/axios to automatically handle x402 payments.
 * When a paid endpoint returns 402, the wrapper:
 *   1. Parses payment requirements from the response
 *   2. Signs an ERC-3009 transferWithAuthorization using the agent's wallet
 *   3. Retries the request with the Payment-Signature header
 *   4. Returns the result to Claude
 *
 * The agent never sees the payment flow — it just gets the data.
 *
 * Ref: https://docs.cdp.coinbase.com/x402/mcp-server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { x402Client, wrapAxiosWithPayment } from "@x402/axios";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const API_BASE = process.env.MOLTFLUENCE_API_URL || "https://moltfluence-avax-beta.vercel.app";
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;

// ── x402 auto-payment client ──────────────────────────────────────────
let api: ReturnType<typeof axios.create>;

if (EVM_PRIVATE_KEY) {
  const client = new x402Client();
  const signer = privateKeyToAccount(EVM_PRIVATE_KEY);
  registerExactEvmScheme(client, { signer });
  api = wrapAxiosWithPayment(axios.create({ baseURL: API_BASE }), client);
  console.error("[mcp] x402 auto-payment enabled with wallet:", signer.address);
} else {
  api = axios.create({ baseURL: API_BASE });
  console.error("[mcp] No EVM_PRIVATE_KEY — paid endpoints will return 402");
}

const server = new McpServer({ name: "moltfluence", version: "2.0.0" });

// Helper
function text(data: unknown) {
  return { content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

let agentId = "mcp-agent";

// ═══════════════════════════════════════════════════════════════════════
// Tool: Register Agent
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("register_agent", {
  description: "Register as an AI agent. Gets a funded wallet on Avalanche Fuji. Call this first.",
  inputSchema: { name: z.string().describe("Agent name") },
}, async ({ name }) => {
  const { data } = await api.post("/api/agent", { name });
  agentId = data.agentId || name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Create Character
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("create_character", {
  description: "Create an AI influencer character.",
  inputSchema: {
    characterType: z.string().max(80).describe("Character personality (max 80 chars)"),
    niche: z.string().describe("Content niche (e.g. crypto, tech, fitness, gaming)"),
    vibe: z.enum(["confident", "chaotic", "calm"]).describe("Personality vibe"),
  },
}, async ({ characterType, niche, vibe }) => {
  const { data } = await api.post("/api/state/character", {
    characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy",
  }, { headers: { "x-user-id": agentId } });
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Get Trends
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("get_trends", {
  description: "Find trending topics for a niche using real-time web research.",
  inputSchema: {
    niche: z.string().describe("Content niche"),
  },
}, async ({ niche }) => {
  const { data } = await api.post("/api/swarm/trends", { niche }, { headers: { "x-user-id": agentId } });
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Scripts
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("generate_scripts", {
  description: "Generate 3 script variants for a topic.",
  inputSchema: {
    characterId: z.string().describe("Character ID"),
    characterType: z.string().describe("Character description"),
    niche: z.string().describe("Niche"),
    vibe: z.string().describe("Vibe"),
    topic: z.string().describe("Topic to write about"),
  },
}, async ({ characterId, characterType, niche, vibe, topic }) => {
  const { data } = await api.post("/api/swarm/scripts", {
    characterProfile: { id: characterId, characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy" },
    topic, mode: "manual-topic",
  }, { headers: { "x-user-id": agentId } });
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Compile Prompt
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("compile_prompt", {
  description: "Compile a video-ready prompt from character + topic + script.",
  inputSchema: {
    characterId: z.string(), characterType: z.string(), niche: z.string(), vibe: z.string(),
    topic: z.string(), scriptHook: z.string(), scriptBody: z.string(), scriptCta: z.string(),
  },
}, async ({ characterId, characterType, niche, vibe, topic, scriptHook, scriptBody, scriptCta }) => {
  const { data } = await api.post("/api/swarm/prompt-compile", {
    profile: { id: characterId, characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy" },
    brief: { id: `brief-${Date.now()}`, userKey: agentId, mode: "manual-topic", niche, topic, createdAt: new Date().toISOString() },
    script: { id: "script_1", title: "Selected", hook: scriptHook, body: scriptBody, cta: scriptCta, durationTargetSec: 22 },
  }, { headers: { "x-user-id": agentId } });
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Image (PAID — x402 auto-payment)
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("generate_image", {
  description: "Generate a character portrait. Payment handled automatically via x402 on Avalanche Fuji.",
  inputSchema: {
    prompt: z.string().describe("Image description"),
    model: z.string().optional().describe("Model: gemini, flux-schnell, flux-dev, midjourney"),
  },
}, async ({ prompt, model }) => {
  try {
    const { data } = await api.post("/api/x402/generate-image", {
      prompt, model: model || "gemini",
    }, { headers: { "x-user-id": agentId } });
    return text(data);
  } catch (err: any) {
    if (err.response?.status === 402) {
      return text({ error: "Payment required. Fund agent wallet with USDC on Avalanche Fuji.", details: err.response.data });
    }
    throw err;
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Video (PAID — x402 auto-payment)
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("generate_video", {
  description: "Generate a short-form video. Payment handled automatically via x402 on Avalanche Fuji.",
  inputSchema: {
    prompt: z.string().describe("Video prompt"),
    duration: z.number().optional().describe("6 or 10 seconds"),
    characterId: z.string().optional().describe("Character ID"),
  },
}, async ({ prompt, duration, characterId }) => {
  try {
    const { data } = await api.post("/api/x402/generate-video", {
      prompt, duration: duration || 6, characterId,
    }, { headers: { "x-user-id": agentId } });
    return text(data);
  } catch (err: any) {
    if (err.response?.status === 402) {
      return text({ error: "Payment required. Fund agent wallet with USDC on Avalanche Fuji.", details: err.response.data });
    }
    throw err;
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Check Job
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("check_job", {
  description: "Poll generation status.",
  inputSchema: {
    jobId: z.string(), type: z.enum(["image", "video"]),
  },
}, async ({ jobId, type }) => {
  const path = type === "image" ? `/api/x402/generate-image/${jobId}` : `/api/x402/generate-video/${jobId}`;
  const { data } = await api.get(path);
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Verify Attestation
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("verify_attestation", {
  description: "Verify a cross-chain content attestation.",
  inputSchema: { contentHash: z.string() },
}, async ({ contentHash }) => {
  const { data } = await api.get(`/api/x402/attestation?hash=${encodeURIComponent(contentHash)}`);
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Get Quota
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("get_quota", {
  description: "Check usage quota.",
  inputSchema: {},
}, async () => {
  const { data } = await api.get("/api/x402/quota", { headers: { "x-user-id": agentId } });
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
// Tool: Platform Info
// ═══════════════════════════════════════════════════════════════════════
server.registerTool("get_platform_info", {
  description: "Get Avalanche network config and payment details.",
  inputSchema: {},
}, async () => {
  const { data } = await api.get("/api/x402/info");
  return text(data);
});

// ═══════════════════════════════════════════════════════════════════════
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Moltfluence MCP Server running | API: ${API_BASE} | x402: ${EVM_PRIVATE_KEY ? "enabled" : "disabled"}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
