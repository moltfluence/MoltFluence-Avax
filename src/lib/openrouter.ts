const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const timeoutMs = 15000;

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
