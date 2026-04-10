import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { backendBaseUrl } from "@/lib/config";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  const url = new URL(`${backendBaseUrl}/api/${path.join("/")}`);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(backendBaseUrl).host);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
  };

  const upstream = await fetch(url, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: ProxyContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: ProxyContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: ProxyContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: ProxyContext) {
  return proxyRequest(request, context);
}
