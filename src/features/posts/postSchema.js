import { z } from "zod";

export const MAX_DURATION = 359999;
export function parseDuration(value) {
  if (!value) return null;
  if (!/^\d{2}:[0-5]\d:[0-5]\d$/.test(value))
    throw new Error("Gunakan durasi HH:MM:SS yang valid.");
  const [h, m, s] = value.split(":").map(Number);
  const seconds = h * 3600 + m * 60 + s;
  if (!seconds) throw new Error("Durasi harus lebih dari nol.");
  return seconds;
}
export function formatDuration(seconds) {
  if (!seconds) return "";
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function toWibInput(iso) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + 7 * 3600000)
    .toISOString()
    .slice(0, 16);
}
export function fromWibInput(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Tanggal dan jam tidak valid.");
  const date = new Date(`${value}:00+07:00`);
  if (
    !Number.isFinite(date.getTime()) ||
    toWibInput(date.toISOString()) !== value
  )
    throw new Error("Tanggal dan jam tidak valid.");
  return date.toISOString();
}
export function normalizeHashtags(input) {
  const values = Array.isArray(input)
    ? input
    : String(input || "").split(/[\s,]+/u);
  return [
    ...new Set(
      values
        .flatMap((value) => value.split(/[\s,]+/u))
        .map((value) => value.replace(/^#+/u, "").trim())
        .filter(Boolean)
        .map((value) => `#${value}`),
    ),
  ];
}
export function normalizeVideoUrl(value) {
  const input = value.trim();
  if (
    !/^https:\/\/www\.tiktok\.com\/@[a-zA-Z0-9._]+\/video\/\d+(?:[?#][^\s]*)?$/.test(
      input,
    )
  ) {
    throw new Error(
      "Gunakan link penuh https://www.tiktok.com/@username/video/ID. Link pendek belum didukung.",
    );
  }
  const url = new URL(input);
  return `${url.origin}${url.pathname}`;
}
export const postFields = {
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi.")
    .max(160, "Judul maksimal 160 karakter."),
  content: z.string(),
  duration_seconds: z.number().int().positive().max(MAX_DURATION).nullable(),
  caption: z.string(),
  hashtags: z.array(z.string()).transform(normalizeHashtags),
  scheduled_at: z.iso.datetime({ offset: true }).nullable(),
  status: z.enum(["draft", "scheduled", "uploaded"]),
};
export const createPostSchema = z
  .object({
    ...postFields,
    content: postFields.content.default(""),
    caption: postFields.caption.default(""),
    hashtags: postFields.hashtags.default([]),
    duration_seconds: postFields.duration_seconds.default(null),
    scheduled_at: postFields.scheduled_at.default(null),
  })
  .strict();
export const updatePostSchema = z
  .object({ ...postFields, updated_at: z.string().optional() })
  .partial()
  .strict()
  .refine(
    (value) => Object.keys(value).some((key) => key !== "updated_at"),
    "Tidak ada perubahan.",
  );
export const linkVideoSchema = z
  .object({
    video_url: z.string().transform((value, ctx) => {
      try {
        return normalizeVideoUrl(value);
      } catch (error) {
        ctx.addIssue({ code: "custom", message: error.message });
        return z.NEVER;
      }
    }),
    updated_at: z.string().optional(),
  })
  .strict();
export const idSchema = z.uuid();
export const listPostsSchema = z.object({
  q: z.string().trim().max(160).default(""),
  status: z.enum(["all", "draft", "scheduled", "uploaded"]).default("all"),
  page: z.coerce.number().int().min(1).max(1000000).default(1),
});
export const postFormSchema = z.object({
  title: postFields.title,
  content: z.string(),
  caption: z.string(),
  hashtags: z.string(),
  duration: z.string().refine((value) => {
    try {
      parseDuration(value);
      return true;
    } catch {
      return false;
    }
  }, "Gunakan HH:MM:SS dengan durasi lebih dari nol."),
  schedule: z.string().refine((value) => {
    try {
      fromWibInput(value);
      return true;
    } catch {
      return false;
    }
  }, "Tanggal dan jam tidak valid."),
});
export function preparePost(input, previous = null) {
  const next = { ...(previous || {}), ...input };
  if (previous?.status === "uploaded") {
    if (input.status && input.status !== "uploaded")
      throw new Error(
        "Post Sudah Upload tidak dapat dikembalikan ke Draft atau Terjadwal.",
      );
    next.status = "uploaded";
  } else if (next.status === "uploaded")
    throw new Error(
      "Gunakan tindakan Tandai Sudah Upload untuk menautkan video.",
    );
  if (next.status === "draft") next.scheduled_at = null;
  if (next.status === "scheduled" && !next.scheduled_at)
    throw new Error("Tanggal dan jam upload wajib untuk Post Terjadwal.");
  const result = Object.fromEntries(
    Object.keys(postFields).map((key) => [key, next[key]]),
  );
  result.video_url = previous?.video_url || null;
  const relevant = [
    "title",
    "content",
    "duration_seconds",
    "caption",
    "hashtags",
    "scheduled_at",
  ];
  if (
    previous?.prediction &&
    relevant.some(
      (key) => JSON.stringify(previous[key]) !== JSON.stringify(result[key]),
    )
  )
    result.prediction = { ...previous.prediction, status: "stale" };
  return result;
}
