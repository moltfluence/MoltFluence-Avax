import { chatCompletion } from "@/lib/openrouter";
import { lintVideoPrompt } from "@/lib/moltfluence/prompt-lint";
import { RECOMMENDED_VIDEO_MODEL } from "@/lib/moltfluence/types";
import type { CharacterProfile, ContentBrief, PromptPackage, ScriptDraft, VideoModel } from "@/lib/moltfluence/types";

// Tavily for real-time web research
async function tavilySearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return "";

  try {
    const { tavily } = await import("@tavily/core");
    const tvly = tavily({ apiKey });
    const res = await tvly.search(query, { maxResults: 5 });
    const results = (res as any).results ?? [];
    return results.map((r: any) => `${r.title}: ${r.content}`).join("\n\n");
  } catch (err) {
    console.error("[tavily] Search failed:", (err as Error).message);
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  harvestTrends — LLM-powered trend generation                      */
/* ------------------------------------------------------------------ */

export type TrendSource = "manual" | "llm";

interface TrendResult {
  mode: "manual-topic" | "auto-trends";
  topics: string[];
  nicheContext: string;
  source: TrendSource;
}

const TREND_BANK: Record<string, string[]> = {
  crypto: [
    "ETF rotation plays this week",
    "Top ecosystem narratives on-chain",
    "How retail misses early momentum",
    "Three token mistakes to avoid",
    "Are meme cycles back?",
  ],
  memes: [
    "Relatable work-from-home chaos",
    "POV: your portfolio after one tweet",
    "When AI writes your breakup text",
    "Founder vs creator energy",
    "Main character glitch moments",
  ],
  ai: [
    "AI tools replacing 3 workflows today",
    "Prompt mistakes that kill output quality",
    "What actually matters in model selection",
    "Automation wins you can ship in one day",
    "AI myths that are costing teams money",
  ],
  default: [
    "Fastest way to explain this trend",
    "What everyone gets wrong",
    "3 mistakes beginners make",
    "Myth vs reality",
    "Action plan for this week",
  ],
};

export async function harvestTrends(niche: string, manualTopic?: string): Promise<TrendResult> {
  const today = new Date().toISOString().slice(0, 10);

  if (manualTopic && manualTopic.trim()) {
    // Tavily research on the manual topic
    const tavilyContext = await tavilySearch(`${niche} ${manualTopic} latest news trends ${today}`);
    const nicheContext = tavilyContext || `Context for "${niche}" topic: ${manualTopic}`;
    return { mode: "manual-topic", topics: [manualTopic.trim()], nicheContext, source: "manual" };
  }

  try {
    // Step 1: Tavily real-time web research
    const tavilyContext = await tavilySearch(`${niche} trending topics latest news today ${today}`);
    if (!tavilyContext) throw new Error("Tavily returned no results");

    // Step 2: LLM generates topics grounded in Tavily research
    const { content } = await chatCompletion([
      {
        role: "system",
        content: "You generate timely, trending short-form video topic ideas grounded in real research. Return a JSON object: { \"topics\": [\"idea1\", \"idea2\", ...] } with exactly 5 items. Each idea should be a punchy, specific video topic title (under 80 chars) that references real current events, products, or narratives from the research provided. No markdown, no explanation — only the JSON object.",
      },
      {
        role: "user",
        content: `Date: ${today}\nNiche: ${niche}\n\nReal-time web research (via Tavily):\n${tavilyContext}\n\nGenerate 5 trending, timely short-form video topic ideas based on this research.`,
      },
    ], { json: true });

    const parsed = JSON.parse(content);
    const topics: string[] = Array.isArray(parsed.topics) ? parsed.topics.slice(0, 5) : [];
    if (topics.length === 0) throw new Error("LLM returned no topics");

    return { mode: "auto-trends", topics, nicheContext: tavilyContext, source: "llm" };
  } catch {
    return {
      mode: "auto-trends",
      topics: fallbackTopicsForNiche(niche),
      nicheContext: `Offline fallback context for niche "${niche}" on ${today}.`,
      source: "manual",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  generateScripts — LLM-powered script writing                      */
/* ------------------------------------------------------------------ */

export async function generateScripts(profile: CharacterProfile, brief: ContentBrief, nicheContext?: string): Promise<ScriptDraft[]> {
  const exclusionNote = profile.exclusions.length > 0
    ? `\nNEVER mention or reference: ${profile.exclusions.join(", ")}.`
    : "";

  const contextNote = nicheContext
    ? `\n\nUse the following research to ground your scripts in real, accurate information:\n${nicheContext}`
    : "";

  try {
    const { content } = await chatCompletion([
      {
        role: "system",
        content: `You are a short-form video scriptwriter. You write scripts for a ${profile.vibe.toLowerCase()} ${profile.role.toLowerCase()} in the ${profile.niche} niche. Language: ${profile.language}. Aggressiveness: ${profile.aggressiveness}.${exclusionNote}${contextNote}

Return a JSON object with exactly this shape:
{
  "scripts": [
    {
      "variant": "hot-take",
      "title": "...",
      "hook": "Hook (0-2s): ...",
      "body": "Body (2-18s): ...",
      "cta": "CTA (18-22s): ..."
    },
    {
      "variant": "tutorial",
      "title": "...",
      "hook": "Hook (0-2s): ...",
      "body": "Body (2-18s): ...",
      "cta": "CTA (18-22s): ..."
    },
    {
      "variant": "contrarian",
      "title": "...",
      "hook": "Hook (0-2s): ...",
      "body": "Body (2-18s): ...",
      "cta": "CTA (18-22s): ..."
    }
  ]
}

Each script targets a 22-second vertical video. The hook grabs attention in 0-2 seconds. The body delivers value in 2-18 seconds. The CTA drives engagement in 18-22 seconds. Write the actual spoken words — not stage directions. No markdown, no explanation — only the JSON object.`,
      },
      {
        role: "user",
        content: `Write 3 script variants (hot-take, tutorial, contrarian) for this topic: "${brief.topic}"`,
      },
    ], { json: true });

    const parsed = JSON.parse(content);
    const scripts: ScriptDraft[] = (parsed.scripts ?? []).slice(0, 3).map(
      (s: { variant?: string; title?: string; hook?: string; body?: string; cta?: string }, i: number) => ({
        id: `script_${i + 1}`,
        title: s.title || `${capitalize(s.variant || "variant")} angle #${i + 1}`,
        hook: s.hook || "",
        body: s.body || "",
        cta: s.cta || "",
        durationTargetSec: 22,
      }),
    );

    if (scripts.length === 0) throw new Error("LLM returned no scripts");
    return scripts;
  } catch {
    return fallbackScripts(profile, brief);
  }
}

/* ------------------------------------------------------------------ */
/*  compilePrompt — unchanged                                         */
/* ------------------------------------------------------------------ */

export function compilePrompt(input: {
  profile: CharacterProfile;
  brief: ContentBrief;
  script: ScriptDraft;
  primaryModel?: VideoModel;
}): PromptPackage {
  const primaryModel = input.primaryModel ?? RECOMMENDED_VIDEO_MODEL;
  const fallbackModel: VideoModel = "ltx";

  const tokenA = input.profile.characterType.replace(/\s+/g, "-").toLowerCase();
  const tokenB = input.profile.vibe.replace(/\s+/g, "-").toLowerCase();
  const consistencyTokens = [`identity:${tokenA}`, `tone:${tokenB}`, `lang:${input.profile.language.toLowerCase()}`];

  const shared = [
    "Vertical 9:16 short-form ad video",
    input.script.hook,
    input.script.body,
    input.script.cta,
    "Shot plan: 1-2 scenes max, no scene drift, medium close-up then punch-in",
    "Motion: natural head movement, realistic eye contact, clean lip sync",
    "Lighting: soft key light, high-contrast background separation",
    `Character consistency tokens: ${consistencyTokens.join(", ")}`,
    input.profile.imageUrl
      ? "Reference image lock: keep the exact same actor identity from the approved character portrait."
      : "Identity lock: preserve the same actor identity and wardrobe details throughout the clip.",
    input.profile.styleGuide ? `Style guide: ${input.profile.styleGuide}` : "",
    `Topic: ${input.brief.topic}`,
    "Add on-screen subtitle-safe pacing and silence-free delivery",
    "Call to action must be explicit and spoken in final beat",
  ]
    .filter(Boolean)
    .join(". ");

  const primaryPrompt = `Model target: ${primaryModel}. ${shared}.`;
  const fallbackPrompt = `Model target: ${fallbackModel}. ${shared}. Keep motion simpler and camera locked for consistency.`;

  const lint = lintVideoPrompt(primaryPrompt);

  return {
    id: `prompt_${Math.random().toString(36).slice(2, 10)}`,
    primaryModel,
    fallbackModel,
    primaryPrompt,
    fallbackPrompt,
    lint,
    metadata: {
      hook: input.script.hook,
      cta: input.script.cta,
      consistencyTokens,
    },
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fallbackTopicsForNiche(niche: string): string[] {
  const key = niche.toLowerCase();
  return (TREND_BANK[key] ?? TREND_BANK.default).slice(0, 5);
}

function fallbackScripts(profile: CharacterProfile, brief: ContentBrief): ScriptDraft[] {
  const base = ["hot-take", "tutorial", "contrarian"] as const;

  return base.map((variant, index) => {
    const title = `${capitalize(variant)} angle #${index + 1}`;
    const hook =
      variant === "hot-take"
        ? `Hook (0-2s): "Stop scrolling. ${brief.topic} is being misunderstood right now."`
        : variant === "tutorial"
          ? `Hook (0-2s): "In 20 seconds, here is the exact ${brief.topic} playbook."`
          : `Hook (0-2s): "Unpopular opinion: ${brief.topic} rewards the opposite of what most people do."`;

    const body = `Body (2-18s): Speak as a ${profile.vibe.toLowerCase()} ${profile.role.toLowerCase()} in ${profile.language}. Keep one concrete value point and one proof point about "${brief.topic}".`;
    const cta = `CTA (18-22s): "Comment guide and I will drop the next breakdown."`;

    return {
      id: `script_${index + 1}`,
      title,
      hook,
      body,
      cta,
      durationTargetSec: 22,
    };
  });
}
