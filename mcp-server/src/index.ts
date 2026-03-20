#!/usr/bin/env node

/**
 * Moltfluence MCP Server
 *
 * Exposes the entire Moltfluence AI Influencer Pipeline as MCP tools
 * that any AI agent (Claude, GPT, etc.) can use directly.
 *
 * Tools:
 *   - register_agent: Register and get a funded wallet on Avalanche Fuji
 *   - create_character: Create an AI influencer persona
 *   - get_trends: Discover trending topics
 *   - generate_scripts: Generate 3 script variants
 *   - compile_prompt: Compile a video-ready prompt
 *   - generate_image: Generate a character portrait (x402 paid)
 *   - generate_video: Generate a video (x402 paid)
 *   - check_job: Poll image/video generation status
 *   - verify_attestation: Verify cross-chain content attestation
 *   - get_quota: Check usage quota
 *
 * Usage:
 *   MOLTFLUENCE_API_URL=https://moltfluence-avax-beta.vercel.app npx moltfluence-mcp
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.MOLTFLUENCE_API_URL || "https://moltfluence-avax-beta.vercel.app";

const server = new McpServer({
  name: "moltfluence",
  version: "1.0.0",
});

// Helper: make API calls
async function api(path: string, opts?: { method?: string; body?: unknown; userId?: string }) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.userId) headers["x-user-id"] = opts.userId;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts?.method || "GET",
    headers,
    ...(opts?.body ? { body: JSON.stringify(opts.body) } : {}),
  });

  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

// ═══════════════════════════════════════════════════════════════════════
// Tool: Register Agent — Get a funded wallet on Avalanche Fuji
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "register_agent",
  {
    description: "Register as an AI agent on Moltfluence. Provisions a wallet on Avalanche Fuji funded with USDC for x402 payments. Call this first before using any paid tools.",
    inputSchema: {
      name: z.string().describe("Agent name (e.g. 'MyContentBot')"),
    },
  },
  async ({ name }) => {
    const { data } = await api("/api/agent", { method: "POST", body: { name } });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Create Character — Define an AI influencer persona
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "create_character",
  {
    description: "Create an AI influencer character with a persona, niche, and vibe. Returns a character profile with ID.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID (from register_agent)"),
      characterType: z.string().max(80).describe("Character description (max 80 chars)"),
      niche: z.enum(["crypto", "tech", "lifestyle"]).describe("Content niche"),
      vibe: z.enum(["confident", "chaotic", "calm"]).describe("Personality vibe"),
    },
  },
  async ({ agentId, characterType, niche, vibe }) => {
    const { data } = await api("/api/state/character", {
      method: "POST",
      userId: agentId,
      body: { characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy" },
    });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Get Trends — Discover trending topics
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "get_trends",
  {
    description: "Harvest trending topics for a niche from Reddit, HackerNews, CoinGecko, and web sources. Returns 5 video-worthy topics with engagement scores.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
      niche: z.string().describe("Content niche (e.g. 'crypto', 'tech')"),
    },
  },
  async ({ agentId, niche }) => {
    const { data } = await api("/api/swarm/trends", {
      method: "POST",
      userId: agentId,
      body: { niche },
    });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Scripts — Create 3 script variants
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "generate_scripts",
  {
    description: "Generate 3 script variants (Hot Take, Breakdown, Story) for a topic, tailored to the character's personality.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
      characterId: z.string().describe("Character ID from create_character"),
      characterType: z.string().describe("Character description"),
      niche: z.string().describe("Content niche"),
      vibe: z.string().describe("Character vibe"),
      topic: z.string().describe("The topic to write scripts about"),
    },
  },
  async ({ agentId, characterId, characterType, niche, vibe, topic }) => {
    const { data } = await api("/api/swarm/scripts", {
      method: "POST",
      userId: agentId,
      body: {
        characterProfile: { id: characterId, characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy" },
        topic,
        mode: "manual-topic",
      },
    });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Compile Prompt — Create a video-ready prompt
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "compile_prompt",
  {
    description: "Compile a character profile + topic + script into a video generation prompt optimized for LTX-2.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
      characterId: z.string().describe("Character ID"),
      characterType: z.string().describe("Character description"),
      niche: z.string().describe("Content niche"),
      vibe: z.string().describe("Character vibe"),
      topic: z.string().describe("The topic"),
      scriptHook: z.string().describe("Script hook text"),
      scriptBody: z.string().describe("Script body text"),
      scriptCta: z.string().describe("Script CTA text"),
    },
  },
  async ({ agentId, characterId, characterType, niche, vibe, topic, scriptHook, scriptBody, scriptCta }) => {
    const { data } = await api("/api/swarm/prompt-compile", {
      method: "POST",
      userId: agentId,
      body: {
        profile: { id: characterId, characterType, niche, vibe, role: "influencer", language: "en", aggressiveness: "spicy" },
        brief: { id: `brief-${Date.now()}`, userKey: agentId, mode: "manual-topic", niche, topic, createdAt: new Date().toISOString() },
        script: { id: "script_1", title: "Selected", hook: scriptHook, body: scriptBody, cta: scriptCta, durationTargetSec: 22 },
      },
    });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Image — Create a character portrait (x402 paid)
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "generate_image",
  {
    description: "Generate an AI character portrait image. Uses free quota first, then requires x402 USDC payment on Avalanche Fuji. Returns a job ID to poll.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
      prompt: z.string().describe("Image description prompt"),
      model: z.enum(["flux-schnell", "flux-dev", "flux-dev-advanced", "midjourney"]).optional().describe("Image model (default: flux-dev)"),
    },
  },
  async ({ agentId, prompt, model }) => {
    const { status, data } = await api("/api/x402/generate-image", {
      method: "POST",
      userId: agentId,
      body: { prompt, model: model || "flux-dev" },
    });

    if (status === 402) {
      return textResult({ status: "payment_required", message: "Free quota exhausted. x402 payment needed.", paymentDetails: data });
    }
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Generate Video — Create a video (x402 paid)
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "generate_video",
  {
    description: "Generate a short-form video using LTX-2. Uses free quota first, then requires x402 USDC payment. Returns a job ID to poll.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
      prompt: z.string().describe("Video prompt (must include hook, body, CTA, and framing direction like '16:9 landscape')"),
      duration: z.number().optional().describe("Video duration in seconds (6 or 10, default: 6)"),
      characterId: z.string().optional().describe("Character ID for identity consistency"),
    },
  },
  async ({ agentId, prompt, duration, characterId }) => {
    const { status, data } = await api("/api/x402/generate-video", {
      method: "POST",
      userId: agentId,
      body: { prompt, duration: duration || 6, characterId },
    });

    if (status === 402) {
      return textResult({ status: "payment_required", message: "Free quota exhausted. x402 payment needed.", paymentDetails: data });
    }
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Check Job — Poll generation status
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "check_job",
  {
    description: "Poll the status of an image or video generation job. Returns status (pending/completed/failed) and the URL when done.",
    inputSchema: {
      jobId: z.string().describe("Job ID from generate_image or generate_video"),
      type: z.enum(["image", "video"]).describe("Job type: 'image' or 'video'"),
    },
  },
  async ({ jobId, type }) => {
    const path = type === "image"
      ? `/api/x402/generate-image/${jobId}`
      : `/api/x402/generate-video/${jobId}`;
    const { data } = await api(path);
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Verify Attestation — Check cross-chain content proof
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "verify_attestation",
  {
    description: "Verify a cross-chain content attestation delivered via Avalanche Teleporter (AWM). Proves content was generated and paid for.",
    inputSchema: {
      contentHash: z.string().describe("Content hash (0x...) from the generate_video response"),
    },
  },
  async ({ contentHash }) => {
    const { data } = await api(`/api/x402/attestation?hash=${encodeURIComponent(contentHash)}`);
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Get Quota — Check remaining free usage
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "get_quota",
  {
    description: "Check your remaining free quota for image and video generation.",
    inputSchema: {
      agentId: z.string().describe("Your agent ID"),
    },
  },
  async ({ agentId }) => {
    const { data } = await api(`/api/x402/quota`, { userId: agentId });
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Tool: Get Platform Info — Discover network and payment config
// ═══════════════════════════════════════════════════════════════════════

server.registerTool(
  "get_platform_info",
  {
    description: "Get Moltfluence platform info: Avalanche network config, x402 payment details, facilitator, and contract addresses.",
    inputSchema: {},
  },
  async () => {
    const { data } = await api("/api/x402/info");
    return textResult(data);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// Start server
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Moltfluence MCP Server running on stdio");
  console.error(`API Base: ${API_BASE}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
