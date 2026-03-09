const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/aurora-alpha";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResult {
  content: string;
}

export async function chatCompletion(
  messages: Message[],
  opts?: { json?: boolean; webSearch?: boolean },
): Promise<ChatCompletionResult> {
  const DEMO_MODE = process.env.DEMO_MODE === "true";
  
  if (DEMO_MODE) {
    console.log("[openrouter] DEMO_MODE — returning mocked LLM response");
    const sysPrompt = messages.find(m => m.role === "system")?.content || "";
    const userPrompt = messages.find(m => m.role === "user")?.content || "";
    
    // Mock Trend Harvesting
    if (sysPrompt.includes("research assistant") || sysPrompt.includes("topic ideas")) {
      if (opts?.json) {
        return { content: `{"topics": ["Avalanche's C-Chain Just Obliterated Gas Fees Again", "x402 Micropayments: The API Business Model Is Dead", "AI Agents That Pay Each Other Is Now Real on Avalanche", "AVAX's Subnet Architecture Has No Real Competition", "Circle USDC on Fuji: Why Native Beats Bridged Every Time"]}` };
      }
      return { content: "1. Avalanche's C-Chain Just Obliterated Gas Fees Again\n2. x402 Micropayments: The API Business Model Is Dead\n3. AI Agents That Pay Each Other Is Now Real on Avalanche\n4. AVAX's Subnet Architecture Has No Real Competition\n5. Circle USDC on Fuji: Why Native Beats Bridged Every Time" };
    }

    // Mock Script Generation
    if (sysPrompt.includes("scriptwriter")) {
      return { content: `{
  "scripts": [
    {
      "variant": "hot-take",
      "title": "Hot Take: Avalanche vs ETH",
      "hook": "You're still paying $40 gas on Ethereum while I just sent USDC for literally one tenth of a cent.",
      "body": "Avalanche C-Chain processes transactions in under 2 seconds with fees under $0.01. Not a testnet trick — that's mainnet reality. The x402 protocol lets AI agents pay each other in USDC micropayments without any human clicking approve. That's the future of the internet.",
      "cta": "Drop a fire emoji if you're done overpaying for gas.",
      "durationTargetSec": 22
    },
    {
      "variant": "breakdown",
      "title": "Breakdown: x402 Actually Does",
      "hook": "Most devs have never heard of x402 — and that's why they're building the wrong thing.",
      "body": "x402 is an HTTP payment protocol. When your app hits a paid API, instead of a login screen, you get a payment challenge. You sign a USDC transaction on Avalanche. Done. No subscriptions. No API keys. No rate limits. Pay only for what you use, instantly, on-chain.",
      "cta": "Share this with a developer who still uses API keys.",
      "durationTargetSec": 22
    },
    {
      "variant": "story",
      "title": "Story: AI Agent Paid AI",
      "hook": "I just watched my AI agent pay another AI agent $0.001 for a video script.",
      "body": "Moltfluence is an autonomous influencer pipeline. It researches trends, writes scripts, generates videos, and posts to Instagram — all triggered by a single wallet signature on Avalanche Fuji. The payment settles in USDC via ERC-3009. The whole pipeline costs under $0.05. This is the agentic economy.",
      "cta": "Would you trust an AI agent to run your brand? Comment yes or no.",
      "durationTargetSec": 22
    }
  ]
}` };
    }

    // Mock Prompt Compilation
    if (sysPrompt.includes("prompt engineer")) {
      return { content: `{
  "primaryPrompt": "A hyper-realistic cinematic shot of a confident AI influencer discussing Avalanche gas fees. Cinematic lighting, neon red highlights, 8k resolution, highly detailed face, futuristic background.",
  "negativePrompt": "blurry, low quality, cartoon, deformed, bad anatomy, text, watermark",
  "recommendedModel": "ltx",
  "aspectRatio": "9:16",
  "stylePreset": "cinematic"
}` };
    }

    // Default mock response
    if (opts?.json) {
       return { content: "{}" };
    }
    return { content: "Mocked fallback response from DEMO_MODE." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const timeoutMs = opts?.webSearch ? 25000 : 8000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://moltfluence.vercel.app",
        "X-Title": "moltfluence",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
        ...(opts?.webSearch ? { plugins: [{ id: "web", max_results: 5 }] } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${res.status}: ${body}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenRouter returned empty response");
    }

    return { content: content.trim() };
  } finally {
    clearTimeout(timeout);
  }
}
