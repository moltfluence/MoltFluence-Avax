/**
 * Media proxy — serves VPS-hosted files over HTTPS.
 * Supports Range requests (required for Safari video playback).
 */
import { NextResponse } from "next/server";

const VPS_BASE = process.env.CAPTION_SERVICE_URL?.replace(/\/+$/, "") || "http://167.86.87.188:4500";

export async function GET(req: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const vpsUrl = `${VPS_BASE}/files/${filename}`;

  // Forward Range header for video seeking/Safari compat
  const rangeHeader = req.headers.get("range");
  const headers: Record<string, string> = {};
  if (rangeHeader) headers["Range"] = rangeHeader;

  const res = await fetch(vpsUrl, { cache: "no-store", headers });
  if (!res.ok && res.status !== 206) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const contentLength = res.headers.get("content-length");
  const contentRange = res.headers.get("content-range");
  const body = await res.arrayBuffer();

  const responseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(body.byteLength),
    "Cache-Control": "public, max-age=86400",
    "Access-Control-Allow-Origin": "*",
    "Accept-Ranges": "bytes",
  };

  if (contentRange) responseHeaders["Content-Range"] = contentRange;

  return new NextResponse(body, {
    status: contentRange ? 206 : 200,
    headers: responseHeaders,
  });
}
