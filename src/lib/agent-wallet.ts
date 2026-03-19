/**
 * Per-Agent Wallet Provisioning on Avalanche Fuji C-Chain.
 *
 * Each AI agent that registers gets its own wallet:
 *   1. Server generates a deterministic HD wallet from master seed + agentId
 *   2. Wallet private key stored encrypted in Neon Postgres
 *   3. Treasury funds the wallet with a small USDC allowance
 *   4. All x402 calls for that agent auto-sign with their wallet
 *
 * The agent never sees a private key. It just calls our API with x-user-id
 * and the backend handles everything.
 *
 * Stack:
 *   - @0xgasless/agent-sdk for ERC-8004 identity + x402 payments
 *   - ethers.js for wallet derivation
 *   - Neon Postgres for wallet storage
 *   - 0xGasless facilitator for gasless settlement
 *
 * Ref: https://build.avax.network/integrations/0xgasless
 */

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const FUJI_USDC = "0x5425890298aed601595a70AB815c96711a31Bc65";

// ---------------------------------------------------------------------------
// DB: Store agent wallets in Neon Postgres
// ---------------------------------------------------------------------------

interface AgentWalletRecord {
  agent_id: string;
  address: string;
  encrypted_key: string; // In production: encrypt with KMS. For hackathon: plain.
  funded: boolean;
  usdc_funded_amount: string;
  created_at: string;
}

async function getDb() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

async function ensureWalletTable() {
  const sql = await getDb();
  await sql`CREATE TABLE IF NOT EXISTS agent_wallets (
    agent_id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    funded BOOLEAN DEFAULT FALSE,
    usdc_funded_amount TEXT DEFAULT '0',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

// ---------------------------------------------------------------------------
// Wallet Generation: Deterministic from master seed + agentId
// ---------------------------------------------------------------------------

async function deriveAgentWallet(agentId: string): Promise<{ address: string; privateKey: string }> {
  const { Wallet, HDNodeWallet } = await import("ethers");

  const masterKey = process.env.AGENT_PRIVATE_KEY;
  if (!masterKey) throw new Error("AGENT_PRIVATE_KEY not set");

  // Derive a deterministic wallet: keccak256(masterKey + agentId) as private key
  const { keccak256, toUtf8Bytes, concat, getBytes } = await import("ethers");
  const seed = keccak256(concat([getBytes(masterKey), toUtf8Bytes(agentId)]));
  const wallet = new Wallet(seed);

  return {
    address: wallet.address,
    privateKey: seed,
  };
}

// ---------------------------------------------------------------------------
// Fund agent wallet with USDC from treasury
// ---------------------------------------------------------------------------

async function fundAgentWallet(
  agentAddress: string,
  amount: string = "1000000" // $1 USDC (6 decimals)
): Promise<string | null> {
  const { Wallet, JsonRpcProvider, Contract } = await import("ethers");

  const treasuryKey = process.env.AGENT_PRIVATE_KEY;
  if (!treasuryKey) return null;

  const provider = new JsonRpcProvider(FUJI_RPC);
  const treasury = new Wallet(treasuryKey, provider);

  // Check treasury USDC balance first
  const usdc = new Contract(
    FUJI_USDC,
    ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"],
    treasury
  );

  const balance = await usdc.balanceOf(treasury.address);
  if (BigInt(balance) < BigInt(amount)) {
    console.warn("[agent-wallet] Treasury has insufficient USDC to fund agent");
    return null;
  }

  try {
    const tx = await usdc.transfer(agentAddress, amount);
    await tx.wait();
    console.log(`[agent-wallet] Funded ${agentAddress} with ${amount} USDC, tx: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    console.error("[agent-wallet] Funding failed:", (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API: Provision, Get, and Use agent wallets
// ---------------------------------------------------------------------------

/**
 * Provision a new wallet for an agent. Called on first registration.
 * - Generates deterministic wallet
 * - Stores in Neon DB
 * - Funds with USDC from treasury
 */
export async function provisionAgentWallet(
  agentId: string
): Promise<{ address: string; funded: boolean; usdcBalance: string } | null> {
  try {
    await ensureWalletTable();
    const sql = await getDb();

    // Check if wallet already exists
    const existing = await sql`SELECT * FROM agent_wallets WHERE agent_id = ${agentId}`;
    if (existing.length > 0) {
      return {
        address: existing[0].address,
        funded: existing[0].funded,
        usdcBalance: existing[0].usdc_funded_amount,
      };
    }

    // Generate wallet
    const { address, privateKey } = await deriveAgentWallet(agentId);

    // Store in DB
    await sql`INSERT INTO agent_wallets (agent_id, address, encrypted_key)
      VALUES (${agentId}, ${address}, ${privateKey})`;

    // Fund with USDC from treasury
    const fundAmount = "1000000"; // $1 USDC
    const txHash = await fundAgentWallet(address, fundAmount);

    if (txHash) {
      await sql`UPDATE agent_wallets SET funded = true, usdc_funded_amount = ${fundAmount} WHERE agent_id = ${agentId}`;
    }

    console.log(`[agent-wallet] Provisioned wallet ${address} for agent ${agentId}`);

    return {
      address,
      funded: !!txHash,
      usdcBalance: txHash ? fundAmount : "0",
    };
  } catch (err) {
    console.error("[agent-wallet] Provision failed:", err);
    throw err; // Let the route handler see the actual error
  }
}

/**
 * Get an agent's wallet info (no private key exposed).
 */
export async function getAgentWallet(
  agentId: string
): Promise<{ address: string; funded: boolean; usdcBalance: string } | null> {
  try {
    await ensureWalletTable();
    const sql = await getDb();
    const rows = await sql`SELECT address, funded, usdc_funded_amount FROM agent_wallets WHERE agent_id = ${agentId}`;
    if (rows.length === 0) return null;
    return {
      address: rows[0].address,
      funded: rows[0].funded,
      usdcBalance: rows[0].usdc_funded_amount,
    };
  } catch {
    return null;
  }
}

/**
 * Get an SDK instance for a specific agent (uses their wallet).
 * Used internally by the server to make x402 payments on the agent's behalf.
 */
export async function getAgentSDK(agentId: string): Promise<any | null> {
  try {
    await ensureWalletTable();
    const sql = await getDb();
    const rows = await sql`SELECT encrypted_key FROM agent_wallets WHERE agent_id = ${agentId}`;
    if (rows.length === 0) return null;

    const { AgentSDK, fujiConfig } = await import("@0xgasless/agent-sdk");
    const { Wallet, JsonRpcProvider } = await import("ethers");

    const provider = new JsonRpcProvider(FUJI_RPC);
    const signer = new Wallet(rows[0].encrypted_key, provider);

    return new AgentSDK({
      ...fujiConfig,
      signer,
    });
  } catch (err) {
    console.error("[agent-wallet] SDK init failed for agent:", (err as Error).message);
    return null;
  }
}

/**
 * Make a paid API call on behalf of an agent using their provisioned wallet.
 * The agent SDK handles: 402 detection → ERC-3009 signing → settlement → retry.
 */
export async function agentFetch(
  agentId: string,
  url: string,
  init?: RequestInit
): Promise<Response> {
  const sdk = await getAgentSDK(agentId);
  if (!sdk) {
    return fetch(url, init);
  }

  try {
    return await sdk.fetch(url, init);
  } catch (err) {
    console.error("[agent-wallet] x402 fetch failed:", (err as Error).message);
    return fetch(url, init);
  }
}

/**
 * Register agent on ERC-8004 using their wallet.
 */
export async function registerAgentIdentity(
  agentId: string,
  metadataUri: string
): Promise<{ txHash: string } | null> {
  const sdk = await getAgentSDK(agentId);
  if (!sdk) return null;

  try {
    const identity = sdk.erc8004.identity();
    const tx = await identity.register(metadataUri);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err) {
    console.error("[agent-wallet] ERC-8004 register failed:", (err as Error).message);
    return null;
  }
}
