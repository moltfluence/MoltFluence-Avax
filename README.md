# Moltfluence — Avalanche Build Games Hackathon

Autonomous AI influencer pipeline on the **Avalanche C-Chain**. Agents create characters, research trending topics, generate videos, and publish to Instagram — paying per-use with USDC via x402 micropayments on Avalanche Fuji Testnet.

## How It Works

1. **Character setup** — 60-second interview creates an AI persona with a generated portrait
2. **Agent swarm** — harvests trends (Reddit, HN, CoinGecko), writes scripts, compiles model-ready prompts
3. **Avalanche x402 payment** — user signs an ERC-3009 gasless USDC transfer on Avalanche Fuji (eip155:43113) before the pipeline runs
4. **Video generation** — LTX-2 video model (pay-per-call via x402, bypassed in DEMO_MODE)
5. **Instagram publish** — automated Reel posting with character-matched captions

## Tech Stack

- **App:** Next.js 14, React 18, Tailwind v4
- **Chain:** Avalanche Fuji C-Chain Testnet (`eip155:43113`)
- **Payments:** x402 v2, native Circle USDC (`0x5425890298aed601595a70AB815c96711a31Bc65`) via ERC-3009, self-hosted facilitator
- **AI:** Groq / Llama-3.3-70b (scripts), LTX-2 (video)
- **Agent Identity:** ERC-8004 schema (mocked on Avalanche Fuji — registry pending deployment)
- **Distribution:** Instagram Graph API v21.0

## Quick Start

```bash
npm install
cp .env.example .env   # DEMO_MODE=true is the default — safe to run immediately
npm run dev
```

Verify payment layer: `curl http://localhost:3000/api/x402/info | jq .`

## DEMO_MODE

`DEMO_MODE=true` (default in `.env`) enables a full end-to-end walkthrough without spending API credits or AVAX gas:

| Component | Live Mode | DEMO_MODE |
|-----------|-----------|-----------|
| MetaMask prompt | Real ERC-3009 signature | Real ERC-3009 signature |
| On-chain settlement | Broadcasts to Avalanche Fuji | Skipped (returns mock tx hash) |
| Groq script generation | Real Llama-3 API call | Pre-baked Avalanche scripts |
| LTX-2 video generation | Real API call | Returns sample MP4 URL |
| ERC-8004 registration | On-chain contract call | Mock agentId=8004 |

## On-chain (Avalanche Fuji Testnet)

- **Native USDC:** [`0x5425890298aed601595a70AB815c96711a31Bc65`](https://testnet.snowtrace.io/token/0x5425890298aed601595a70AB815c96711a31Bc65) (6 decimals)
- **Transfer method:** ERC-3009 (`transferWithAuthorization`) — gasless for the user
- **Chain ID:** 43113 (CAIP-2: `eip155:43113`)
- **Explorer:** https://testnet.snowtrace.io
- **Faucet:** https://core.app/tools/testnet-faucet/

## Agent Integration (Nullclaw / Openclaw)

Agents discover the API via [`/skill.md`](/public/skill.md). All paid endpoints follow the x402 protocol — call without payment header, get 402 challenge, sign USDC transfer on Avalanche, retry with payment header.

## Documentation

| Doc | What's in it |
|-----|-------------|
| [docs/PROJECT.md](docs/PROJECT.md) | Problem, solution, ecosystem impact, roadmap |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Architecture, setup, demo guide |
| [docs/EXTRAS.md](docs/EXTRAS.md) | Demo video and presentation links |

## Architecture

```
User → MetaMask (ERC-3009 USDC sign on Avalanche Fuji)
  → Next.js x402 middleware (verify signature)
  → Agent swarm (Groq/Llama-3 for trends + scripts)
  → LTX-2 video generation
  → Instagram Graph API (Reel publish)
```
