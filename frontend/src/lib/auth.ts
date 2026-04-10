import { cookies } from "next/headers";

import { backendBaseUrl } from "@/lib/config";

export type CurrentUser = {
  id: number;
  username: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/api/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: CurrentUser };
    return payload.data ?? null;
  } catch {
    return null;
  }
}
