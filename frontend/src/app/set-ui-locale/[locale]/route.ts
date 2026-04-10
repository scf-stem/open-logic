import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { normalizeLocale } from "@/lib/config";

type Context = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { locale } = await context.params;
  const next = request.nextUrl.searchParams.get("next") || "/";
  const target = next.startsWith("/") ? next : "/";

  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.set("ui_locale", normalizeLocale(locale), {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
