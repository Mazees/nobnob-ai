export async function postsRequest(
  path = "",
  { method = "GET", body, signal } = {},
) {
  let response;
  try {
    response = await fetch(`/api/posts${path}`, {
      method,
      signal,
      credentials: "same-origin",
      cache: "no-store",
      ...(body !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Tidak dapat terhubung. Periksa koneksi lalu coba lagi.");
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !("data" in result)) {
    const error = new Error(
      result?.error?.message || "Permintaan gagal. Silakan coba lagi.",
    );
    error.status = response.status;
    error.fields = result?.error?.fields;
    throw error;
  }
  return result;
}
