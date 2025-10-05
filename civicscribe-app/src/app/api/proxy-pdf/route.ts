// src/app/api/proxy-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const inputUrl = req.nextUrl.searchParams.get("url");
  if (!inputUrl) return new NextResponse("Missing url", { status: 400 });

  const commonHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    Accept: "application/pdf,application/octet-stream;q=0.9,text/html;q=0.8,*/*;q=0.5",
    "Accept-Language": "en-US,en;q=0.9",
  } as Record<string, string>;

  const fetchPdf = async (targetUrl: string): Promise<NextResponse | null> => {
    const resp = await fetch(targetUrl, { cache: "no-store", headers: commonHeaders, redirect: "follow" as any });
    const contentType = resp.headers.get("content-type") || "";
    if (resp.ok && contentType.includes("application/pdf")) {
      const array = await resp.arrayBuffer();
      return new NextResponse(array, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-store",
        },
      });
    }
    // If HTML, try to find a PDF link
    if (contentType.includes("text/html")) {
      const html = await resp.text();
      const match = html.match(/href\s*=\s*\"([^\"]+\.pdf)\"/i) || html.match(/href\s*=\s*'([^']+\.pdf)'/i);
      if (match && match[1]) {
        const absolute = new URL(match[1], targetUrl).toString();
        return await fetchPdf(absolute);
      }
    }
    return null;
  };

  try {
    const response = await fetchPdf(inputUrl);
    if (response) return response;
    return new NextResponse("Could not resolve PDF", { status: 502 });
  } catch (e) {
    return new NextResponse("Proxy error", { status: 500 });
  }
}
