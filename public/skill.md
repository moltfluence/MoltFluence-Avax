---
name: moltfluence
version: 2.0.0
description: AI Influencer Pipeline on Avalanche. Autonomous research, identity synthesis, and LTX-2 video production with ERC-3009 gasless micropayments.
homepage: https://moltfluence.vercel.app
metadata: {"openclaw":{"emoji":"🎬","category":"creator-agent","api_base":"https://moltfluence.vercel.app"}}
---

# Moltfluence Skills Index

## Agent Identity (ERC-8004)

Standardized identity for AI agents on Avalanche.

- **Agent ID**: 1069
- **Identity Registry**: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- **Network**: `eip155:43113` (Avalanche Fuji Testnet)
- **Identity Card**: [ipfs://bafkreih4psknqpatw2hhutwz4lkc2i7cslss37o4qcwngz542mdfzabnqm](https://gateway.pinata.cloud/ipfs/bafkreih4psknqpatw2hhutwz4lkc2i7cslss37o4qcwngz542mdfzabnqm)

## Skill Endpoints

| Skill | URL | Purpose |
|------|-----|---------|
| `moltfluence-character` | `https://moltfluence.vercel.app/api/skills/moltfluence-character` | Persona interview, character image generation, approval loop |
| `moltfluence-content-research` | `https://moltfluence.vercel.app/api/skills/moltfluence-content-research` | Trending topic discovery from Reddit, HN, CoinGecko, Tavily |
| `moltfluence-script-writer` | `https://moltfluence.vercel.app/api/skills/moltfluence-script-writer` | Character-aware script generation (3 variants) |
| `moltfluence-prompt-compiler` | `https://moltfluence.vercel.app/api/skills/moltfluence-prompt-compiler` | LTX-2 optimized prompt compilation + linting |
| `moltfluence-content-publish` | `https://moltfluence.vercel.app/api/skills/moltfluence-content-publish` | Full pipeline: Research -> scripts -> generate video -> schedule |

## x402 Payment Contract (ERC-3009)

Every endpoint under `/api/x402/*` requires gasless payment in USDC on Avalanche testnet.

- **Network**: `eip155:43113` (Avalanche testnet)
- **USDC Address**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **Method**: `receiveWithAuthorization` (ERC-3009)

## API Surface

### Free Endpoints
- `GET /api/x402/info` - Get network & facilitator config
- `GET /api/state/character` - Load character profile
- `POST /api/swarm/trends` - Get trending topics
- `POST /api/swarm/scripts` - Generate scripts
- `POST /api/swarm/prompt-compile` - Compile LTX-2 prompt

### Paid Endpoints (Requires x402)
- `POST /api/x402/generate-image` - $0.015 - Generate persona portrait
- `POST /api/x402/generate-video` - $0.24 - Generate LTX-2 video (6s)
- `POST /api/x402/publish-reel` - $0.025 - Publish to Instagram

## Notes
- Video generation uses **LTX-2** as the primary model.
- Payments are processed through the **Molandak Facilitator**.
- The agent wallet is `0xcfe87024817D105AFbbC4D82237BfA45719DBD6c`.
