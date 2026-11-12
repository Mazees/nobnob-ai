import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function redirectTo(location) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store" },
  });
}

export async function POST(request) {
  const originHeader = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.slice(0, -1);
  let origin;

  try {
    origin = new URL(originHeader);
    if (
      !originHeader || origin.origin !== originHeader ||
      !["http:", "https:"].includes(origin.protocol) ||
      origin.username || origin.password || origin.host !== host ||
      origin.protocol !== `${protocol}:`
    ) throw new Error();
  } catch {
    return new NextResponse(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return redirectTo("/login?error=unavailable");
  }

  try {
    const pendingCookies = [];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookies) {
            pendingCookies.push(...cookies);
          },
        },
      },
    );
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/auth/callback", origin).toString() },
    });
    if (error || !data?.url) return redirectTo("/login?error=oauth");

    const response = redirectTo(data.url);
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    return response;
  } catch {
    return redirectTo("/login?error=unavailable");
  }
}
