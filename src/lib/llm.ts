import { Groq } from "groq-sdk";
import type { CharacterProfile, ContentBrief, ScriptDraft } from "./moltfluence/types";
import type { ScoredItem, SynthesizedTopic } from "./research/types";

// ---------------------------------------------------------------------------
// DEMO_MODE guard — bypasses ALL Groq API calls to save credits
// Set DEMO_MODE=true in .env to enable
// ---------------------------------------------------------------------------
const DEMO_MODE = process.env.DEMO_MODE === "true";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is missing");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

const MODEL = "llama-3.3-70b-versatile";

export async function generateImagePrompt(profile: Partial<CharacterProfile>): Promise<string> {
  const fallbackDesc = profile.characterType || "A futuristic influencer";

  // If no Groq API key is present, fallback to basic prompt logic.
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY missing, using fallback image prompt");
    return `A ${profile.vibe || "bold"} ${profile.role || "AI crypto influencer"} on the Avalanche network. Neon-red holographic aesthetic, futuristic cityscape background, ultra-detailed, 8k, cinematic portrait lighting.`;
  }

  const systemPrompt = `
    You are an expert AI art director.
    Create a detailed image generation prompt for a character portrait based on the user's description.
    Focus on visual details: appearance, clothing, lighting, background, and mood.
    Return ONLY the prompt string. No "Here is the prompt" prefix.
  `;

  const userPrompt = `
    Description/Name: ${fallbackDesc}
    Role: ${profile.role}
    Vibe: ${profile.vibe}
    Niche: ${profile.niche}
    Style: ${profile.styleGuide || "Cinematic, photorealistic, 8k"}
  `;

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: MODEL,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq image prompt gen failed:", error);
    return `A ${profile.vibe || "cool"} ${profile.role || "character"}. ${fallbackDesc}. High quality, 8k, photorealistic portrait.`;
  }
}

// ─── Topic Synthesis ──────────────────────────────────────────────
// Takes scored research items and synthesizes 5 video-worthy topics.
// This is NOT "summarize articles" — it's viral short-form video strategy.

export async function synthesizeTopics(
  niche: string,
  scoredItems: ScoredItem[]
): Promise<SynthesizedTopic[]> {
  // DEMO_MODE: skip Groq — return 5 pre-baked trending topics instantly
  if (DEMO_MODE) {
    console.log("[llm] DEMO_MODE — returning mock synthesized topics");
    return [
      {
        id: `topic-demo-1`,
        title: "Avalanche's C-Chain Just Obliterated Gas Fees Again",
        angle: "Sub-cent transactions make Ethereum look like a fax machine",
        whyNow: "Avalanche Fuji testnet processed 2M transactions in 24h at near-zero cost",
        hookIdea: "You're still paying $40 gas on Ethereum while I just sent USDC for $0.001",
        controversyScore: 4,
        engagementScore: 87,
        visualConcept: "Side-by-side gas fee comparison, Avalanche logo glowing red",
        sources: [],
      },
      {
        id: `topic-demo-2`,
        title: "x402 Micropayments: The API Business Model Is Dead",
        angle: "Pay-per-call with crypto is replacing SaaS subscriptions",
        whyNow: "x402 protocol launched on Avalanche C-Chain this week",
        hookIdea: "What if every API call cost $0.001 instead of $99/month?",
        controversyScore: 3,
        engagementScore: 79,
        visualConcept: "API request animation with tiny USDC coins flying",
        sources: [],
      },
      {
        id: `topic-demo-3`,
        title: "AI Agents That Pay Each Other Is Now Real on Avalanche",
        angle: "Autonomous agent-to-agent micropayments via USDC x402",
        whyNow: "Moltfluence deployed the first influencer AI agent on Fuji testnet",
        hookIdea: "My AI just paid another AI $0.01 to generate a script. No human involved.",
        controversyScore: 5,
        engagementScore: 94,
        visualConcept: "Two robot avatars exchanging glowing USDC coins on Avalanche network",
        sources: [],
      },
      {
        id: `topic-demo-4`,
        title: "AVAX's Subnet Architecture Has No Real Competition",
        angle: "Custom blockchains in 10 minutes vs. years of L2 development",
        whyNow: "Three new subnets launched on Avalanche this week",
        hookIdea: "Ethereum L2s take 2 years to launch. Avalanche subnets take 10 minutes.",
        controversyScore: 4,
        engagementScore: 82,
        visualConcept: "Branching network diagram, Avalanche red nodes expanding rapidly",
        sources: [],
      },
      {
        id: `topic-demo-5`,
        title: "Circle USDC on Fuji: Why Native Beats Bridged Every Time",
        angle: "Circle's native USDC on Avalanche eliminates bridge risk entirely",
        whyNow: "Circle launched native USDC on Avalanche Fuji testnet",
        hookIdea: "Bridged USDC is like a photocopy of money. Native USDC is the real thing.",
        controversyScore: 2,
        engagementScore: 71,
        visualConcept: "USDC coin with Avalanche logo, bridge crossing with red X through it",
        sources: [],
      },
    ];
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn("[llm] GROQ_API_KEY missing, cannot synthesize topics");
    return [];
  }

  if (scoredItems.length === 0) {
    console.warn("[llm] No scored items to synthesize");
    return [];
  }

  // Format top items for the prompt (max 20)
  const topItems = scoredItems.slice(0, 20);
  const formattedItems = topItems
    .map((item, i) => {
      const parts = [
        `${i + 1}. "${item.title}"`,
        `   Source: ${item.source}${item.subreddit ? ` (r/${item.subreddit})` : ""}`,
        `   Score: ${item.score} | Comments: ${item.comments} | FinalScore: ${item.finalScore}/100`,
      ];
      if (item.raw.price_change_24h_pct !== undefined) {
        parts.push(`   Price Change 24h: ${item.raw.price_change_24h_pct}%`);
      }
      if (item.raw.content_snippet) {
        parts.push(`   Context: ${String(item.raw.content_snippet).slice(0, 150)}`);
      }
      return parts.join("\n");
    })
    .join("\n\n");

  const systemPrompt = `You are a viral short-form video strategist specializing in ${niche}.

CONTEXT: You are analyzing real-time data from Reddit, Hacker News, CoinGecko, and web sources to find topics that will perform on Instagram Reels and TikTok in the next 24-48 hours.

RESEARCH DATA (top ${topItems.length} items by engagement):

${formattedItems}

YOUR TASK:
Extract exactly 5 video-worthy topics. For each topic, return a JSON object with these fields:

1. "title": One-line topic (max 10 words, punchy)
2. "angle": The specific take that makes this a video, not a blog post
3. "whyNow": What happened in the last 24h that makes this timely
4. "hookIdea": The exact opening line for a 2-second scroll-stop hook
5. "controversyScore": 1-5, how debate-worthy is this take
6. "engagementScore": 1-100, predicted engagement (comments > likes > views)
7. "visualConcept": What should the viewer SEE (not hear) in the video
8. "sourceIndices": Array of 1-based indices from the research data that contributed

RULES:
- Topics must be TIMELY (happened today/yesterday, not evergreen)
- Each topic must have a CLEAR opposing view (debate = engagement)
- Hooks must create curiosity gaps or pattern interrupts
- NO generic advice topics ("5 tips for...", "how to...")
- NO topics requiring complex graphics/charts (this is talking-head video)
- Rank by predicted engagement (comments > likes > views)
- You can combine multiple research items into a single topic if they share a narrative

Return a JSON object with a single key "topics" containing an array of exactly 5 topic objects.`;

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: systemPrompt }],
      model: MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("[llm] Empty response from Groq");
      return [];
    }

    const parsed = JSON.parse(content);
    const rawTopics = parsed.topics || parsed.Topics || [];

    // Normalize and add IDs
    return rawTopics.slice(0, 5).map((t: any, i: number): SynthesizedTopic => ({
      id: `topic-${Date.now()}-${i}`,
      title: String(t.title || "Untitled").slice(0, 80),
      angle: String(t.angle || ""),
      whyNow: String(t.whyNow || t.why_now || ""),
      hookIdea: String(t.hookIdea || t.hook_idea || t.hook || ""),
      controversyScore: clamp(Number(t.controversyScore || t.controversy_score || 3), 1, 5),
      engagementScore: clamp(Number(t.engagementScore || t.engagement_score || 50), 1, 100),
      visualConcept: String(t.visualConcept || t.visual_concept || ""),
      sources: (t.sourceIndices || t.source_indices || []).map((idx: number) =>
        topItems[idx - 1]?.id || `unknown-${idx}`
      ),
    }));
  } catch (err) {
    console.error("[llm] synthesizeTopics failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Character-Aware Script Generation ────────────────────────────
// Takes a character profile + content brief and generates 3 script variants.
// Each script is structured: hook (0-2s) / body (2-18s) / CTA (18-22s).

export async function generateCreativeScripts(
  profile: CharacterProfile,
  brief: ContentBrief
): Promise<ScriptDraft[]> {
  // DEMO_MODE: skip Groq — return 3 pre-baked Avalanche scripts instantly
  if (DEMO_MODE) {
    console.log("[llm] DEMO_MODE — returning mock creative scripts");
    return [
      {
        id: `script-demo-1`,
        title: "Hot Take: Avalanche vs ETH Gas Fees",
        hook: "You're still paying $40 gas on Ethereum while I just sent USDC for literally one tenth of a cent.",
        body: "Avalanche C-Chain processes transactions in under 2 seconds with fees under $0.01. Not a testnet trick — that's mainnet reality. The x402 protocol lets AI agents pay each other in USDC micropayments without any human clicking approve. That's the future of the internet.",
        cta: "Drop a fire emoji if you're done overpaying for gas. Follow for daily Avalanche alpha.",
        durationTargetSec: 22,
      },
      {
        id: `script-demo-2`,
        title: "Breakdown: What x402 Actually Does",
        hook: "Most devs have never heard of x402 — and that's why they're building the wrong thing.",
        body: "x402 is an HTTP payment protocol. When your app hits a paid API, instead of a login screen, you get a payment challenge. You sign a USDC transaction on Avalanche. Done. No subscriptions. No API keys. No rate limits. Pay only for what you use, instantly, on-chain.",
        cta: "Share this with a developer who still uses API keys. They need to see this.",
        durationTargetSec: 22,
      },
      {
        id: `script-demo-3`,
        title: "Story: My AI Agent Paid Another AI",
        hook: "I just watched my AI agent pay another AI agent $0.001 for a video script. No human was involved.",
        body: "Moltfluence is an autonomous influencer pipeline. It researches trends, writes scripts, generates videos, and posts to Instagram — all triggered by a single wallet signature on Avalanche Fuji. The payment settles in USDC via ERC-3009. The whole pipeline costs under $0.05. This is the agentic economy.",
        cta: "Would you trust an AI agent to run your brand? Comment yes or no — I read every reply.",
        durationTargetSec: 22,
      },
    ];
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn("[llm] GROQ_API_KEY missing, cannot generate scripts");
    return [];
  }

  const systemPrompt = `You are writing a script for an AI influencer with this persona:

CHARACTER:
- Role: ${profile.role}
- Vibe: ${profile.vibe}
- Language: ${profile.language}
- Aggressiveness: ${profile.aggressiveness}
- Niche: ${profile.niche}
- Style Guide: ${profile.styleGuide || "Engaging, authentic, scroll-stopping"}

TOPIC: ${brief.topic}
${brief.objective ? `OBJECTIVE: ${brief.objective}` : ""}

Write exactly 3 script variants. Each MUST follow this structure:

VARIANT 1 (HOT TAKE):
- A bold, slightly controversial opening + one core insight with proof + specific action CTA

VARIANT 2 (BREAKDOWN):
- A surprising fact or stat opening + step-by-step explanation + share prompt CTA

VARIANT 3 (STORY):
- "I just saw..." or "This happened today..." opening + narrative arc with personal reaction + question CTA

Return a JSON object with a single key "scripts" containing an array of 3 objects, each with:
- "title": Short descriptive title for this variant (max 8 words)
- "hook": The opening line (0-2 seconds, must stop the scroll)
- "body": The main content (2-18 seconds, one core message)
- "cta": The closing call-to-action (18-22 seconds)

RULES:
- Write in ${profile.language}
- Match the ${profile.vibe} energy level throughout
${profile.aggressiveness === "spicy"
    ? "- Use edgy, provocative, confrontational language. Be bold and polarizing."
    : "- Keep it informative but engaging. Be authoritative without being aggressive."}
- Each script must be speakable in under 22 seconds total
- NO filler phrases, NO "in this video", NO "today we're going to"
- Every sentence must earn its place — remove anything skippable
- Hooks must create curiosity gaps or pattern interrupts
- The body should feel like insider knowledge being shared`;

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: systemPrompt }],
      model: MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("[llm] Empty response from Groq for scripts");
      return [];
    }

    const parsed = JSON.parse(content);
    const rawScripts = parsed.scripts || parsed.Scripts || [];

    return rawScripts.slice(0, 3).map((s: any, i: number): ScriptDraft => ({
      id: `script-${Date.now()}-${i}`,
      title: String(s.title || `Variant ${i + 1}`).slice(0, 60),
      hook: String(s.hook || ""),
      body: String(s.body || ""),
      cta: String(s.cta || ""),
      durationTargetSec: 22,
    }));
  } catch (err) {
    console.error("[llm] generateCreativeScripts failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
