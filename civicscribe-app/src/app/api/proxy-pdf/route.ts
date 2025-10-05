// src/app/api/proxy-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }
  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      return new NextResponse("Upstream fetch failed", { status: 502 });
    }
    const array = await resp.arrayBuffer();
    return new NextResponse(array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new NextResponse("Proxy error", { status: 500 });
  }
}
