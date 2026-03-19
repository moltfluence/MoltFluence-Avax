/**
 * Interchain Content Attestation via Avalanche Teleporter.
 *
 * After every x402-paid content generation, this module sends a cross-chain
 * attestation via TeleporterMessenger on Avalanche Fuji C-Chain.
 *
 * The attestation is delivered to a ContentAttestationRegistry on a destination
 * Avalanche L1, creating a verifiable proof of content generation that any L1
 * in the ecosystem can read.
 *
 * Architecture:
 *   C-Chain (ContentAttestationSender)
 *     → TeleporterMessenger (AWM + BLS multi-signatures)
 *       → Destination L1 (ContentAttestationRegistry)
 *
 * Refs:
 *   https://build.avax.network/docs/cross-chain/teleporter/overview
 *   https://build.avax.network/docs/cross-chain/teleporter/addresses
 *   https://build.avax.network/docs/cross-chain/avalanche-warp-messaging/overview
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodePacked,
  parseAbi,
  type Hash,
} from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ---------------------------------------------------------------------------
// Constants — Avalanche Fuji C-Chain
// ---------------------------------------------------------------------------

/** TeleporterMessenger — universal address on all Avalanche chains.
 *  Ref: https://build.avax.network/docs/cross-chain/teleporter/addresses */
const TELEPORTER_MESSENGER = "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf" as const;

/** TeleporterRegistry on Fuji C-Chain.
 *  Ref: https://build.avax.network/docs/cross-chain/teleporter/addresses */
const TELEPORTER_REGISTRY_FUJI = "0xF86Cb19Ad8405AEFa7d09C778215D2Cb6eBfB228" as const;

/** Avalanche Fuji C-Chain RPC.
 *  Ref: https://build.avax.network/academy/blockchain/x402-payment-infrastructure/04-x402-on-avalanche/02-network-setup */
const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// ---------------------------------------------------------------------------
// Contract ABIs (minimal — only what we call)
// ---------------------------------------------------------------------------

const SENDER_ABI = parseAbi([
  "function attest(bytes32 contentHash, address payer, uint256 amountUsdc, string model, string metadataUri) external returns (bytes32 messageID)",
  "function attestationCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event AttestationSent(bytes32 indexed messageID, bytes32 indexed contentHash, address indexed payer, uint256 amountUsdc, uint256 timestamp)",
]);

const REGISTRY_ABI = parseAbi([
  "function isAttested(bytes32 contentHash) external view returns (bool)",
  "function getAttestation(bytes32 contentHash) external view returns (address payer, uint256 amountUsdc, uint256 timestamp, uint256 originChainId, string model, string metadataUri, uint256 receivedAt)",
  "function totalAttestations() external view returns (uint256)",
]);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface TeleporterConfig {
  /** ContentAttestationSender contract address on Fuji C-Chain */
  senderAddress: `0x${string}`;
  /** ContentAttestationRegistry contract address on the destination L1 */
  registryAddress: `0x${string}`;
  /** bytes32 blockchain ID of the destination L1 */
  destinationBlockchainID: `0x${string}`;
  /** RPC URL for the destination L1 (for reading attestations) */
  destinationRpc?: string;
}

function getConfig(): TeleporterConfig | null {
  const sender = process.env.ATTESTATION_SENDER_ADDRESS?.trim() as `0x${string}` | undefined;
  const registry = process.env.ATTESTATION_REGISTRY_ADDRESS?.trim() as `0x${string}` | undefined;
  const destChain = process.env.ATTESTATION_DEST_BLOCKCHAIN_ID?.trim() as `0x${string}` | undefined;

  if (!sender || !registry || !destChain) {
    return null;
  }

  return {
    senderAddress: sender,
    registryAddress: registry,
    destinationBlockchainID: destChain,
    destinationRpc: process.env.ATTESTATION_DEST_RPC?.trim(),
  };
}

// ---------------------------------------------------------------------------
// Content hash computation
// ---------------------------------------------------------------------------

/** Compute the content hash from generation metadata.
 *  This is the unique identifier for an attestation. */
export function computeContentHash(opts: {
  prompt: string;
  videoUrl: string;
  characterId?: string;
  jobId: string;
}): `0x${string}` {
  return keccak256(
    encodePacked(
      ["string", "string", "string", "string"],
      [opts.prompt, opts.videoUrl, opts.characterId ?? "", opts.jobId]
    )
  );
}

// ---------------------------------------------------------------------------
// Send attestation (called after x402-paid generation)
// ---------------------------------------------------------------------------

export interface AttestationInput {
  contentHash: `0x${string}`;
  payer: `0x${string}`;
  amountUsdc: bigint;
  model: string;
  metadataUri: string;
}

export interface AttestationResult {
  messageID: Hash;
  txHash: Hash;
  contentHash: `0x${string}`;
  explorerUrl: string;
}

/**
 * Send a content attestation cross-chain via Teleporter.
 * Called after successful x402-paid video generation.
 *
 * This writes to the ContentAttestationSender on Fuji C-Chain, which
 * forwards the attestation to the ContentAttestationRegistry on the
 * destination L1 via TeleporterMessenger (AWM).
 */
export async function sendAttestation(
  input: AttestationInput
): Promise<AttestationResult | null> {
  const config = getConfig();
  if (!config) {
    console.log("[teleporter] Attestation contracts not configured — skipping");
    return null;
  }

  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    console.warn("[teleporter] AGENT_PRIVATE_KEY not set — cannot send attestation");
    return null;
  }

  const account = privateKeyToAccount(privateKey);
  const transport = http(FUJI_RPC);

  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport,
  });

  console.log(`[teleporter] Sending attestation for ${input.contentHash}`);
  console.log(`[teleporter] Payer: ${input.payer}, Amount: ${input.amountUsdc} USDC atomic`);
  console.log(`[teleporter] Destination L1: ${config.destinationBlockchainID}`);

  const txHash = await walletClient.writeContract({
    address: config.senderAddress,
    abi: SENDER_ABI,
    functionName: "attest",
    args: [
      input.contentHash,
      input.payer,
      input.amountUsdc,
      input.model,
      input.metadataUri,
    ],
  });

  console.log(`[teleporter] Attestation tx: ${txHash}`);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 60_000,
  });

  // Extract messageID from AttestationSent event
  const attestationEvent = receipt.logs.find(
    (log) => log.topics[0] === keccak256(
      encodePacked(
        ["string"],
        ["AttestationSent(bytes32,bytes32,address,uint256,uint256)"]
      )
    )
  );
  const messageID = (attestationEvent?.topics[1] ?? txHash) as Hash;

  console.log(`[teleporter] Attestation confirmed! Message ID: ${messageID}`);
  console.log(`[teleporter] Explorer: https://testnet.snowtrace.io/tx/${txHash}`);

  return {
    messageID,
    txHash,
    contentHash: input.contentHash,
    explorerUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
  };
}

// ---------------------------------------------------------------------------
// Verify attestation (read from destination L1)
// ---------------------------------------------------------------------------

export interface VerifiedAttestation {
  exists: boolean;
  payer?: string;
  amountUsdc?: bigint;
  timestamp?: bigint;
  originChainId?: bigint;
  model?: string;
  metadataUri?: string;
  receivedAt?: bigint;
}

/**
 * Verify a content attestation on the destination L1.
 * Can be called from any chain that can reach the destination L1 RPC.
 */
export async function verifyAttestation(
  contentHash: `0x${string}`
): Promise<VerifiedAttestation> {
  const config = getConfig();
  if (!config || !config.destinationRpc) {
    return { exists: false };
  }

  const publicClient = createPublicClient({
    transport: http(config.destinationRpc),
  });

  const exists = await publicClient.readContract({
    address: config.registryAddress,
    abi: REGISTRY_ABI,
    functionName: "isAttested",
    args: [contentHash],
  });

  if (!exists) {
    return { exists: false };
  }

  const result = await publicClient.readContract({
    address: config.registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getAttestation",
    args: [contentHash],
  }) as [string, bigint, bigint, bigint, string, string, bigint];

  return {
    exists: true,
    payer: result[0],
    amountUsdc: result[1],
    timestamp: result[2],
    originChainId: result[3],
    model: result[4],
    metadataUri: result[5],
    receivedAt: result[6],
  };
}

// ---------------------------------------------------------------------------
// Exports for route handlers
// ---------------------------------------------------------------------------

export { TELEPORTER_MESSENGER, TELEPORTER_REGISTRY_FUJI };
