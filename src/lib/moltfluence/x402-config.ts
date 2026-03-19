/**
 * x402 Network Configuration — Avalanche Fuji C-Chain Testnet
 *
 * Network: Avalanche Fuji Testnet
 * Chain ID: 43113 (CAIP-2: eip155:43113)
 * USDC: Circle native Fuji Testnet USDC (6 decimals)
 * Address: 0x5425890298aed601595a70AB815c96711a31Bc65
 */

export interface X402NetworkConfig {
  network: string;
  caip2: string;
  asset: string;
  assetName: string;
  assetVersion: string;
  assetTransferMethod: "eip3009" | "permit2";
}

export interface X402Config {
  primary: X402NetworkConfig;
  facilitatorUrl?: string;
}

// Avalanche Fuji Testnet — CAIP-2
const AVAX_FUJI_CAIP2 = "eip155:43113";
// Circle's official Fuji Testnet USDC (6 decimals, native USDC — NOT bridged)
const AVAX_FUJI_USDC = "0x5425890298aed601595a70AB815c96711a31Bc65";

const AVAX_ALIASES = new Set([
  "avalanche",
  "avalanche-fuji",
  "avalanchefuji",
  "avax-fuji",
  "avax",
  "fuji",
  "eip155:43113",
  "43113",
]);

function normalizeAvaxNetwork(input?: string): string {
  const value = input?.trim().toLowerCase();
  if (!value) return AVAX_FUJI_CAIP2;
  if (AVAX_ALIASES.has(value)) return AVAX_FUJI_CAIP2;
  return input!.trim();
}

function isHexAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function normalizeAsset(input: string, network: string): string {
  const value = input.trim();
  if (isHexAddress(value)) return value;
  if (network === AVAX_FUJI_CAIP2 && value.toUpperCase() === "USDC")
    return AVAX_FUJI_USDC;
  return value;
}

const networkValue = normalizeAvaxNetwork(process.env.X402_NETWORK);
const caip2Value = normalizeAvaxNetwork(process.env.X402_CAIP2 ?? networkValue);

const AVAX_FUJI_DEFAULT: X402NetworkConfig = {
  network: networkValue,
  caip2: caip2Value,
  asset: normalizeAsset(
    process.env.X402_ASSET?.trim() || AVAX_FUJI_USDC,
    caip2Value
  ),
  assetName: process.env.X402_ASSET_NAME?.trim() || "USDC",
  assetVersion: process.env.X402_ASSET_VERSION?.trim() || "2",
  assetTransferMethod:
    (process.env.X402_ASSET_TRANSFER_METHOD?.trim() as
      | "eip3009"
      | "permit2") || "eip3009",
};

export function getX402Config(): X402Config {
  return {
    primary: AVAX_FUJI_DEFAULT,
    // Avalanche-native x402 facilitator — Ultravioleta DAO
    // Gasless for end-users, EIP-3009 settlement, stateless verification.
    // Docs: https://build.avax.network/integrations/ultravioletadao
    facilitatorUrl:
      process.env.X402_FACILITATOR_URL?.trim() ||
      "https://facilitator.ultravioletadao.xyz",
  };
}
