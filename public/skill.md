---
name: moltfluence
version: 3.0.0
description: AI Influencer Pipeline on Avalanche with cross-chain content attestation via Teleporter (AWM). Autonomous research, identity synthesis, LTX-2 video production, and ERC-3009 gasless micropayments.
homepage: https://moltfluence-avax.vercel.app
metadata: {"openclaw":{"emoji":"🎬","category":"creator-agent","api_base":"https://moltfluence-avax.vercel.app"}}
---

# Moltfluence Skills Index

## Architecture

Autonomous AI influencer pipeline on Avalanche Fuji C-Chain with:
- **x402 micropayments** — ERC-3009 gasless USDC transfers via Ultravioleta DAO facilitator
- **Cross-chain attestation** — Content provenance via Avalanche Teleporter (AWM + BLS multi-signatures)
- **8 agent skills** — Full pipeline from character creation to Instagram publishing

## Skill Endpoints

| Skill | URL | Purpose |
|------|-----|---------|
| `moltfluence-character` | `/api/skills/moltfluence-character` | Persona interview, character image generation, approval loop |
| `moltfluence-content-research` | `/api/skills/moltfluence-content-research` | Trending topic discovery from Reddit, HN, CoinGecko, Tavily |
| `moltfluence-script-writer` | `/api/skills/moltfluence-script-writer` | Character-aware script generation (3 variants) |
| `moltfluence-prompt-compiler` | `/api/skills/moltfluence-prompt-compiler` | LTX-2 optimized prompt compilation + linting |
| `moltfluence-content-publish` | `/api/skills/moltfluence-content-publish` | Full pipeline: research → scripts → video → publish |
| `moltfluence-captions` | `/api/skills/moltfluence-captions` | Burn word-by-word animated captions into videos |
| `moltfluence-schedule` | `/api/skills/moltfluence-schedule` | Schedule, list, and delete future Instagram posts |
| `moltfluence-attestation` | `/api/skills/moltfluence-attestation` | Verify cross-chain content attestations via Teleporter |

## x402 Payment (Avalanche Fuji C-Chain)

Every endpoint under `/api/x402/*` uses gasless USDC payment on Avalanche.

- **Network**: `eip155:43113` (Avalanche Fuji Testnet)
- **USDC**: `0x5425890298aed601595a70AB815c96711a31Bc65` (Circle native, 6 decimals)
- **Method**: ERC-3009 `transferWithAuthorization` (gasless for payer)
- **Facilitator**: Ultravioleta DAO (`https://facilitator.ultravioletadao.xyz`)
- **Ref**: https://build.avax.network/integrations/ultravioletadao

## Cross-Chain Content Attestation (Avalanche Teleporter)

After paid video generation, Moltfluence sends a cross-chain attestation via Teleporter:

- **TeleporterMessenger**: `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf` (all chains)
- **ContentAttestationSender** (Fuji): `0xef81BE42Ef71F969a9B0594Cfc4Fa22E4E5B954f`
- **ContentAttestationRegistry** (Fuji): `0xbfe907e883e1f8F47e4f1CE282ec5658f6eb802C`
- **Verify**: `GET /api/x402/attestation?hash=0x...`
- **Ref**: https://build.avax.network/docs/cross-chain/teleporter/overview

## Agent Wallet (Per-Agent, Self-Funded)

Every agent gets its own wallet on Avalanche Fuji. The agent (or its owner) funds it with USDC.

- `POST /api/agent` — Register agent + provision wallet
  - Send: `{ "name": "MyBot" }`
  - Returns: `{ agentId, wallet: { address, funded, usdcBalance } }`
  - Fund the wallet by sending USDC to the returned address on Avalanche Fuji
- `GET /api/agent?id=<agentId>` — Check wallet status

```bash
# 1. Register
curl -X POST /api/agent -d '{"name":"MyBot"}'
# → { address: "0x...", funded: false }

# 2. Owner funds wallet externally (send USDC to 0x... on Fuji)

# 3. Use paid endpoints with x-user-id header
curl -X POST /api/x402/generate-image -H "x-user-id: mybot" -d '{...}'
```

## API Surface

### Free Endpoints
- `POST /api/agent` — Register agent + provision wallet
- `GET /api/agent?id=<id>` — Check wallet status
- `GET /api/x402/info` — Network, facilitator, and contract config
- `GET /api/x402/quota` — Check usage quota
- `GET /api/x402/attestation` — Verify cross-chain content attestation
- `GET /api/state/character` — Load character profile
- `POST /api/state/character` — Save character profile
- `POST /api/swarm/trends` — Harvest trending topics
- `POST /api/swarm/scripts` — Generate scripts
- `POST /api/swarm/prompt-compile` — Compile video prompt
- `POST /api/x402/schedule-reel` — Schedule future post
- `GET /api/x402/schedule-reel` — List scheduled posts
- `DELETE /api/x402/schedule-reel` — Cancel scheduled post

### Paid Endpoints (x402 — auto-debits from agent wallet)
- `POST /api/x402/generate-image` — $0.01–$0.05 — AI persona portrait
- `POST /api/x402/generate-video` — $0.24–$0.40 — LTX-2-fast video (6s/10s)
- `POST /api/x402/caption-video` — $0.01 — Animated captions
- `POST /api/x402/publish-reel` — $0.025 — Publish to Instagram

## MCP Server

For AI agents using Model Context Protocol (Claude, GPT, etc.):

```json
{
  "mcpServers": {
    "moltfluence": {
      "command": "node",
      "args": ["mcp-server/build/index.js"],
      "env": { "MOLTFLUENCE_API_URL": "https://moltfluence-avax-beta.vercel.app" }
    }
  }
}
```

11 tools: `register_agent`, `create_character`, `get_trends`, `generate_scripts`, `compile_prompt`, `generate_image`, `generate_video`, `check_job`, `verify_attestation`, `get_quota`, `get_platform_info`

## Notes
- Video generation uses **LTX-2-fast** (1920x1080, English audio included).
- Payments processed via **0xGasless facilitator** on Avalanche Fuji (gasless for agents).
- Agent wallets use **@0xgasless/agent-sdk** with ERC-8004 identity.
- Cross-chain attestations delivered via **Avalanche Teleporter** (AWM + BLS multi-signatures).
