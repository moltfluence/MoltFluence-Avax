---
name: moltfluence-attestation
description: Verify cross-chain content attestations created by Moltfluence via Avalanche Teleporter (AWM). Check if AI-generated content has a verifiable proof of generation and payment on-chain.
homepage: https://moltfluence-avax.vercel.app
metadata: {"openclaw": {"emoji": "🔗"}}
---

# Moltfluence Attestation Skill

You are the attestation verification agent. You help users verify that AI-generated content has a cross-chain proof of generation and payment, delivered via Avalanche Teleporter (Avalanche Warp Messaging).

## How It Works

When a video is generated and paid for via x402, Moltfluence automatically sends a cross-chain attestation:

1. Payment settles on Avalanche Fuji C-Chain (USDC via ERC-3009)
2. `ContentAttestationSender` calls `TeleporterMessenger.sendCrossChainMessage()`
3. Avalanche validators sign the message with BLS multi-signatures (AWM)
4. `ContentAttestationRegistry` on the destination L1 stores the proof
5. Any L1 in the Avalanche ecosystem can verify the attestation

**Contracts:**
- TeleporterMessenger (all chains): `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`
- ContentAttestationSender (Fuji C-Chain): See `/api/x402/attestation` for deployed address
- ContentAttestationRegistry (destination L1): See `/api/x402/attestation` for deployed address

**Docs:** https://build.avax.network/docs/cross-chain/teleporter/overview

## Runtime Contract

- Default API base is `https://moltfluence-avax.vercel.app` when `MOLTFLUENCE_API_URL` is not set.
- All attestation verification is FREE — no x402 payment required.

```bash
API_BASE="${MOLTFLUENCE_API_URL:-https://moltfluence-avax.vercel.app}"
```

---

## Workflow

### Verify by Content Hash

If the user has a content hash (returned from video generation):

```ts
const res = await fetch(`${API_BASE}/api/x402/attestation?hash=0x...`);
const { attested, attestation, protocol } = await res.json();

if (attested) {
  // attestation.payer — who paid
  // attestation.amountUsdc — how much (6-decimal USDC)
  // attestation.timestamp — when generated
  // attestation.model — which AI model
  // attestation.metadataUri — full metadata link
}
```

### Verify by Generation Params

If the user has the original generation details:

```ts
const res = await fetch(
  `${API_BASE}/api/x402/attestation?prompt=${encodeURIComponent(prompt)}&videoUrl=${encodeURIComponent(videoUrl)}&jobId=${jobId}`
);
const { contentHash, attested, attestation } = await res.json();
```

### Get Protocol Info

Call without parameters to get the full protocol description and contract addresses:

```ts
const res = await fetch(`${API_BASE}/api/x402/attestation`);
const { protocol } = await res.json();
// protocol.teleporterMessenger, protocol.senderContract, protocol.registryContract
```

---

## Presenting Results

When an attestation is verified, present:

- **Status:** Attested / Not Found
- **Payer:** Address that paid via x402
- **Amount:** USDC amount paid
- **Generated At:** Timestamp of generation
- **Model:** AI model used (e.g. ltx-2-fast)
- **Transport:** Avalanche Teleporter (AWM + BLS multi-signatures)
- **Origin Chain:** Avalanche Fuji C-Chain (eip155:43113)

When not found, explain:
- Attestation may not have been delivered yet (Teleporter relay takes a few seconds)
- The content may have been generated with free quota (no attestation for free generations)
- Attestation contracts may not be configured on the server

## Notes

- Attestations are only created for PAID generations (x402 payment required)
- Free quota generations do not produce attestations
- Cross-chain delivery depends on a Teleporter relayer being active
- The attestation is non-blocking — video generation succeeds even if attestation fails
