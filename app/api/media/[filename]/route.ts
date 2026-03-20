/**
 * Media proxy — serves VPS-hosted files over HTTPS.
 * Solves mixed content issue (HTTPS site loading HTTP video).
 */
import { NextResponse } from "next/server";

const VPS_BASE = process.env.CAPTION_SERVICE_URL?.replace(/\/+$/, "") || "http://167.86.87.188:4500";

export async function GET(_req: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;

  const res = await fetch(`${VPS_BASE}/files/${filename}`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
