import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
export function success(data, meta = {}, status = 200) {
  return Response.json(
    { data, meta },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
export function failure(error) {
  let problem = error;
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(
      error.issues.map((issue) => [
        issue.path.join(".") || "form",
        issue.message,
      ]),
    );
    problem = new ApiError(
      422,
      "VALIDATION_ERROR",
      "Periksa kembali isian Post.",
      fields,
    );
  }
  if (!(problem instanceof ApiError)) {
    console.error("Posts request failed", {
      name: error?.name,
      code: error?.code,
    });
    problem = new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "Layanan Posts belum tersedia. Silakan coba lagi.",
    );
  }
  return Response.json(
    {
      error: {
        code: problem.code,
        message: problem.message,
        ...(problem.fields && { fields: problem.fields }),
      },
      requestId: crypto.randomUUID(),
    },
    {
      status: problem.status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(
      422,
      "INVALID_JSON",
      "Isi permintaan harus berupa JSON yang valid.",
    );
  }
}
export function verifyOrigin(request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url);
  const host = request.headers.get("host");
  if (host) expected.host = host;
  if (origin && origin !== expected.origin)
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Permintaan berasal dari situs yang tidak diizinkan.",
    );
}
