/**
 * Gemini 2.5 Flash Image via PiAPI — $0.03/image, high quality.
 * Ref: https://piapi.ai/docs/gemini-api/gemini-25-flash-image
 */
import type { ImageGenAdapter, ImageGenRequest, ImageGenStatus } from "./types";

const PIAPI_BASE = "https://api.piapi.ai/api/v1";

export const geminiAdapter: ImageGenAdapter = {
  model: "gemini",

  async generateImage(request: ImageGenRequest, apiKey: string): Promise<string> {
    const payload = {
      model: "gemini",
      task_type: "gemini-2.5-flash-image",
      input: {
        prompt: request.prompt,
        output_format: "png",
        aspect_ratio: request.aspectRatio === "9:16" ? "9:16" : request.aspectRatio === "16:9" ? "16:9" : "1:1",
      },
      config: {
        service_mode: "public",
      },
    };

    const res = await fetch(`${PIAPI_BASE}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini PiAPI error ${res.status}: ${body}`);
    }

    const json: any = await res.json();
    const jobId = json.data?.task_id;
    if (!jobId) throw new Error("Gemini PiAPI did not return a task ID");
    return String(jobId);
  },

  async checkStatus(jobId: string, apiKey: string): Promise<ImageGenStatus> {
    const res = await fetch(`${PIAPI_BASE}/task/${jobId}`, {
      method: "GET",
      headers: { "x-api-key": apiKey },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini status error ${res.status}: ${body}`);
    }

    const json: any = await res.json();
    const taskData = json.data ?? {};
    const status = (taskData.status ?? "pending").toLowerCase();

    if (status === "completed") {
      return {
        jobId,
        status: "completed",
        imageUrl:
          taskData.output?.image_url ??
          taskData.output?.image_urls?.[0] ??
          taskData.output?.image ??
          taskData.output?.images?.[0]?.url,
      };
    }

    if (status === "failed") {
      return {
        jobId,
        status: "failed",
        error: taskData.error?.message ?? "Gemini image generation failed",
      };
    }

    return { jobId, status: status === "processing" ? "processing" : "pending" };
  },
};
