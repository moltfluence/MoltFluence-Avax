/**
 * Verify a content attestation on the destination Avalanche L1.
 *
 * This endpoint reads the ContentAttestationRegistry deployed on a destination
 * L1 to check whether a given content hash has a valid cross-chain attestation
 * that was delivered via Teleporter (Avalanche Warp Messaging).
 *
 * Ref: https://build.avax.network/docs/cross-chain/teleporter/overview
 * Ref: https://build.avax.network/docs/cross-chain/avalanche-warp-messaging/overview
 */

import { NextResponse } from "next/server";
import {
  verifyAttestation,
  computeContentHash,
  TELEPORTER_MESSENGER,
  TELEPORTER_REGISTRY_FUJI,
} from "@/lib/teleporter";

/**
 * GET /api/x402/attestation?hash=0x...
 * GET /api/x402/attestation?prompt=...&videoUrl=...&jobId=...
 *
 * Returns the attestation status and details if found.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);

  // Option 1: Direct content hash lookup
  let contentHash = url.searchParams.get("hash") as `0x${string}` | null;

  // Option 2: Compute hash from generation params
  if (!contentHash) {
    const prompt = url.searchParams.get("prompt");
    const videoUrl = url.searchParams.get("videoUrl");
    const jobId = url.searchParams.get("jobId");

    if (prompt && videoUrl && jobId) {
      contentHash = computeContentHash({
        prompt,
        videoUrl,
        characterId: url.searchParams.get("characterId") ?? undefined,
        jobId,
      });
    }
  }

  if (!contentHash) {
    return NextResponse.json({
      error: "Provide ?hash=0x... or ?prompt=...&videoUrl=...&jobId=...",
      // Also return protocol info for discovery
      protocol: {
        name: "Interchain Content Attestation Protocol",
        description:
          "Cross-chain verifiable proofs of AI content generation via Avalanche Teleporter (AWM). " +
          "Each attestation proves content was generated and paid for on C-Chain, " +
          "verified by BLS multi-signatures from Avalanche validators.",
        teleporterMessenger: TELEPORTER_MESSENGER,
        teleporterRegistryFuji: TELEPORTER_REGISTRY_FUJI,
        senderContract: process.env.ATTESTATION_SENDER_ADDRESS ?? "not deployed",
        registryContract: process.env.ATTESTATION_REGISTRY_ADDRESS ?? "not deployed",
        docs: [
          "https://build.avax.network/docs/cross-chain/teleporter/overview",
          "https://build.avax.network/docs/cross-chain/avalanche-warp-messaging/overview",
        ],
      },
    }, { status: 400 });
  }

  try {
    const result = await verifyAttestation(contentHash);

    return NextResponse.json({
      contentHash,
      attested: result.exists,
      attestation: result.exists
        ? {
            payer: result.payer,
            amountUsdc: result.amountUsdc?.toString(),
            timestamp: result.timestamp?.toString(),
            originChainId: result.originChainId?.toString(),
            model: result.model,
            metadataUri: result.metadataUri,
            receivedAt: result.receivedAt?.toString(),
          }
        : null,
      protocol: {
        name: "Interchain Content Attestation Protocol",
        transport: "Avalanche Teleporter (AWM + BLS multi-signatures)",
        originChain: "Avalanche Fuji C-Chain (eip155:43113)",
        teleporterMessenger: TELEPORTER_MESSENGER,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        contentHash,
        attested: false,
        error: (error as Error).message,
        note: "Attestation contracts may not be deployed yet. See /api/x402/attestation without params for setup info.",
      },
      { status: 200 }
    );
  }
}
