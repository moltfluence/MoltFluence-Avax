---
name: moltfluence-captions
description: Burn word-by-word animated captions (TikTok/Reels style) into a generated video using x402 micropayment on Avalanche Fuji.
homepage: https://moltfluence-avax.vercel.app
compatibility: Requires an x402-capable runtime for the paid caption endpoint. For custom Node bots, use Node 18+ with undici.
metadata: {"openclaw": {"emoji": "💬"}}
---

# Moltfluence Captions Skill

You are the captioning agent. You burn word-by-word animated captions into videos (TikTok/Reels style) using the VPS caption service.

## Runtime Contract

- Default API base is `https://moltfluence-avax.vercel.app` when `MOLTFLUENCE_API_URL` is not set.
- Captioning is a PAID endpoint ($0.01 USDC via x402 on Avalanche Fuji, `eip155:43113`).
- Uses the same `payFetch` helper as other paid endpoints (see `moltfluence-content-publish` for setup).

```bash
API_BASE="${MOLTFLUENCE_API_URL:-https://moltfluence-avax.vercel.app}"
```

---

## Workflow

### Step 1: Get Endpoint Info

```ts
const infoRes = await fetch(`${API_BASE}/api/x402/caption-video`);
const info = await infoRes.json();
// { endpoint, method, priceUsd, network, facilitator, description, params }
```

### Step 2: Burn Captions (PAID — uses payFetch)

```ts
const res = await payFetch(`${API_BASE}/api/x402/caption-video`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
  body: JSON.stringify({
    videoUrl: "<url-of-generated-video>",
    style: "tiktok-highlight",
    jobId: "<optional-job-id-to-update-generation-record>",
  }),
});
const { captionedVideoUrl, transcript, durationSec } = await res.json();
```

### Step 3: Present Result

Show the user:
- Captioned video URL
- Word count / segment count from transcript
- Duration

Ask if they want to publish the captioned version or the original.

---

## Payment

- **Price:** $0.01 USDC per video
- **Network:** Avalanche Fuji C-Chain (`eip155:43113`)
- **Method:** ERC-3009 transferWithAuthorization (gasless for payer)
- **Facilitator:** Ultravioleta DAO (Avalanche-native)

Uses the same `payFetch` pattern from `moltfluence-content-publish`. See that skill for the complete payment helper code.

## Notes

- The caption service runs on a VPS with FFmpeg — requires `CAPTION_SERVICE_URL` configured on the server.
- If `jobId` is provided, the server automatically updates the GenerationRecord with the captioned video URL.
- Style options: currently only `tiktok-highlight` is supported.
