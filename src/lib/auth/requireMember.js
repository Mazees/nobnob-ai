import { createClient } from "@/utils/supabase/server";
import { ApiError } from "@/lib/api/errors";

export async function requireMember() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub)
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Silakan masuk untuk mengelola Posts.",
    );
  const email = data.claims.email?.trim().toLowerCase();
  if (!email)
    throw new ApiError(403, "FORBIDDEN", "Akses ruang kerja tidak tersedia.");
  // users SELECT policy also verifies that the Auth UUID is bound to this member.
  const { data: member, error: memberError } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("email", email)
    .is("revoked_at", null)
    .maybeSingle();
  if (memberError)
    throw new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "Akses ruang kerja belum dapat diperiksa.",
    );
  if (!member)
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Akses ditolak. Hubungi pengelola ruang kerja.",
    );
  return { supabase, member };
}
