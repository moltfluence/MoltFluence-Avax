---
name: moltfluence
version: 3.0.0
description: End-to-end AI influencer pipeline on Avalanche. Register an agent, get a funded wallet, research trends, generate scripts, create videos, publish to Instagram — all via curl. Paid endpoints use x402 USDC micropayments on Avalanche Fuji.
homepage: https://moltfluence-avax-beta.vercel.app
---

# Moltfluence — AI Influencer Pipeline on Avalanche

End-to-end autonomous content creation: trend research → script writing → video generation → Instagram publishing. Works with any AI agent — Claude, GPT, Gemini, custom bots — via standard HTTP/curl. Paid with USDC micropayments on Avalanche Fuji C-Chain (Testnet, eip155:43113).

**Compatible with:** Any HTTP client, OpenClaw skills, MCP tools, LangChain agents, custom bots.

## Quick Start (5 steps)

```bash
API="https://moltfluence-avax-beta.vercel.app"

# 1. Register agent — get a wallet on Avalanche Fuji
curl -s -X POST $API/api/agent \
  -H "Content-Type: application/json" \
  -d '{"name":"MyBot"}'
# → {"registered":true,"agentId":"mybot","wallet":{"address":"0x...","funded":false}}
# Fund the wallet: send USDC to the address on Avalanche Fuji (faucet.circle.com)

# 2. Create character
curl -s -X POST $API/api/state/character \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"characterType":"Crypto alpha hunter","niche":"crypto","vibe":"confident","role":"influencer","language":"en","aggressiveness":"spicy"}'
# → {"profile":{"id":"char_abc123","niche":"crypto","vibe":"confident",...}}

# 3. Get trending topics
curl -s -X POST $API/api/swarm/trends \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"niche":"crypto"}'
# → {"topics":["Avalanche TVL hits new ATH","x402 protocol goes viral",...]}

# 4. Generate scripts
curl -s -X POST $API/api/swarm/scripts \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"characterProfile":{"id":"char_abc123","characterType":"Crypto alpha hunter","niche":"crypto","vibe":"confident","role":"influencer","language":"en","aggressiveness":"spicy"},"topic":"Avalanche TVL hits new ATH","mode":"manual-topic"}'
# → {"scripts":[{"id":"script_1","title":"Hot Take","hook":"...","body":"...","cta":"..."},...]

# 5. Generate video (PAID — $0.24 USDC, uses free quota first)
curl -s -X POST $API/api/x402/generate-video \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"prompt":"Landscape 16:9 video. Hook: influencer looks up surprised. Body: explains Avalanche growth. CTA: points at camera. Cinematic lighting.","duration":6}'
# → {"jobId":"ltx_...","status":"completed","videoUrl":"https://..."}
# If free quota exhausted → returns 402 with x402 payment challenge
```

## Authentication

No API keys. No sessions. Identity is the `x-user-id` header.

| Header | Required | Description |
|--------|----------|-------------|
| `x-user-id` | Yes (all calls) | Your agent ID from `/api/agent` registration |
| `Content-Type` | Yes (POST) | Always `application/json` |
| `Payment-Signature` | Only on 402 retry | Base64-encoded x402 payment payload (auto-handled by agent SDK) |

## Agent Wallet

Each agent gets its own wallet on Avalanche Fuji. Self-funded — you load USDC, endpoints auto-debit.

### Register

```bash
curl -s -X POST $API/api/agent -H "Content-Type: application/json" \
  -d '{"name":"MyBot"}'
```

**Request:** `{"name":"string (required)"}`

**Response (200):**
```json
{
  "registered": true,
  "agentId": "mybot",
  "wallet": {
    "address": "0x23B6b21b4E3b9a8635c4F98cF0e8faA96916321E",
    "funded": false,
    "usdcBalance": "0",
    "network": "Avalanche Fuji (eip155:43113)"
  },
  "nextSteps": ["Use header x-user-id: mybot on all API calls", "..."]
}
```

### Check wallet

```bash
curl -s "$API/api/agent?id=mybot"
```

### Fund wallet

Send USDC to the wallet address on Avalanche Fuji. Get test USDC at https://faucet.circle.com (select Avalanche Fuji).

---

## API Reference

### POST /api/state/character — Create character

```bash
curl -s -X POST $API/api/state/character \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"characterType":"Avalanche degen","niche":"crypto","vibe":"confident","role":"influencer","language":"en","aggressiveness":"spicy"}'
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| characterType | string | yes | Max 80 chars |
| niche | string | yes | `crypto`, `tech`, `lifestyle` |
| vibe | string | yes | `confident`, `chaotic`, `calm` |
| role | string | yes | `influencer` |
| language | string | yes | `en` |
| aggressiveness | string | yes | `spicy`, `mild` |

**Response (200):** `{"profile":{"id":"char_...","niche":"crypto","vibe":"confident","imagePrompt":"..."}}`

---

### POST /api/swarm/trends — Get trending topics

```bash
curl -s -X POST $API/api/swarm/trends \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"niche":"crypto"}'
```

| Field | Type | Required |
|-------|------|----------|
| niche | string | yes |
| manualTopic | string | no (skip auto-research, use this topic) |

**Response (200):** `{"mode":"auto-trends","topics":["topic1","topic2",...],"source":"llm"}`

Uses **Tavily** for real-time web research, then **OpenRouter LLM** to synthesize 5 video-worthy topics.

---

### POST /api/swarm/scripts — Generate scripts

```bash
curl -s -X POST $API/api/swarm/scripts \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"characterProfile":{"id":"char_...","characterType":"...","niche":"crypto","vibe":"confident","role":"influencer","language":"en","aggressiveness":"spicy"},"topic":"Your topic here","mode":"manual-topic"}'
```

**Response (200):** `{"brief":{"id":"brief_..."},"scripts":[{"id":"script_1","title":"Hot Take","hook":"...","body":"...","cta":"...","durationTargetSec":22},...]}`

Returns 3 variants: Hot Take, Tutorial, Contrarian.

---

### POST /api/x402/generate-image — Generate portrait (PAID)

**Price:** $0.01–$0.05 USDC | **Free quota:** 3 per agent

```bash
curl -s -X POST $API/api/x402/generate-image \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"prompt":"A futuristic Avalanche influencer","model":"flux-schnell"}'
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| prompt | string | yes | Image description |
| model | string | no | `flux-schnell` ($0.01), `flux-dev` ($0.015), `midjourney` ($0.05) |

**Response (200):** `{"jobId":"...","status":"pending","pollUrl":"/api/x402/generate-image/<jobId>"}`

**Response (402):** Free quota exhausted — x402 payment required (see Error Handling below).

**Poll status:** `curl -s $API/api/x402/generate-image/<jobId>`
→ `{"status":"completed","imageUrl":"https://..."}`

---

### POST /api/x402/generate-video — Generate video (PAID)

**Price:** $0.24 (6s) / $0.40 (10s) USDC | **Free quota:** 3 per agent

```bash
curl -s -X POST $API/api/x402/generate-video \
  -H "Content-Type: application/json" -H "x-user-id: mybot" \
  -d '{"prompt":"Landscape 16:9 video. Hook in first 2 seconds: surprised look. Body: explains topic. CTA: follow for more. Cinematic lighting.","duration":6}'
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| prompt | string | yes | Must include hook, body, CTA, framing (16:9 or 9:16) |
| duration | number | no | `6` or `10` (default: 6) |
| characterId | string | no | Locks actor identity from character portrait |

**Response (200):** `{"jobId":"ltx_...","status":"completed","videoUrl":"https://...","attestation":{"contentHash":"0x...","txHash":"0x..."}}`

**Prompt requirements** (will be rejected if missing):
- Minimum ~50 characters
- Hook instruction for first 2 seconds
- Explicit CTA instruction
- Framing direction (`16:9 landscape` or `9:16 portrait`)

---

### GET /api/x402/attestation — Verify content attestation

```bash
curl -s "$API/api/x402/attestation?hash=0x..."
```

**Response (200):**
```json
{
  "contentHash": "0x...",
  "attested": true,
  "attestation": {
    "payer": "0x...",
    "amountUsdc": "240000",
    "timestamp": "1773960955",
    "model": "ltx-2-fast"
  },
  "protocol": {
    "name": "Interchain Content Attestation Protocol",
    "transport": "Avalanche Teleporter (AWM + BLS multi-signatures)"
  }
}
```

---

## Error Handling

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Parse response JSON |
| 400 | Bad request (validation) | Check `error` and `details` fields, fix request |
| 402 | Payment required | Free quota exhausted. Fund agent wallet with USDC, retry |
| 404 | Not found | Character/job ID doesn't exist |
| 500 | Server error | API key missing or provider down. Retry in 10s |

### When you get 402

```json
{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "accepts": [{"scheme":"exact","network":"eip155:43113","amount":"240000","asset":"0x5425...","payTo":"0xa8b1..."}],
  "paymentRequirements": {"relayerContract":"0x8BD6...","maxAmountRequired":"240000","..."}
}
```

If using `@0xgasless/agent-sdk`, the SDK auto-handles this via `sdk.fetch()`. Otherwise, fund the agent wallet with USDC and the platform handles payment signing server-side.

---

## Network Details

| Field | Value |
|-------|-------|
| Network | Avalanche Fuji Testnet |
| Chain ID | 43113 |
| CAIP-2 | eip155:43113 |
| RPC | `https://api.avax-test.network/ext/bc/C/rpc` |
| Explorer | `https://testnet.snowtrace.io` |
| USDC | `0x5425890298aed601595a70AB815c96711a31Bc65` (Circle native, 6 decimals) |
| Facilitator | 0xGasless (`https://testnet.0xgasless.com`) |
| Teleporter | `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf` |

**Note:** This is Fuji Testnet. Not mainnet. Get test USDC at https://faucet.circle.com.

## MCP Server

For AI agents using Model Context Protocol (Claude Desktop, GPT, etc.):

```json
{
  "mcpServers": {
    "moltfluence": {
      "command": "node",
      "args": ["mcp-server/build/index.js"],
      "env": {"MOLTFLUENCE_API_URL": "https://moltfluence-avax-beta.vercel.app"}
    }
  }
}
```

11 tools: `register_agent`, `create_character`, `get_trends`, `generate_scripts`, `compile_prompt`, `generate_image`, `generate_video`, `check_job`, `verify_attestation`, `get_quota`, `get_platform_info`
