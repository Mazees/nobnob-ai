import { ApiError } from "../../lib/api/errors.js";
import {
  createPostSchema,
  updatePostSchema,
  linkVideoSchema,
  listPostsSchema,
  idSchema,
  preparePost,
} from "./postSchema.js";

export const POST_COLUMNS =
  "id,title,content,duration_seconds,caption,hashtags,scheduled_at,status,video_url,prediction,created_at,updated_at";
const PAGE_SIZE = 20;
function checkDatabase(error) {
  if (!error) return;
  if (error.code === "23505")
    throw new ApiError(
      409,
      "VIDEO_ALREADY_LINKED",
      "Video TikTok ini sudah ditautkan ke Post lain.",
    );
  if (error.code === "23514" || error.code === "22007")
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      "Status, jadwal, atau link Post tidak valid.",
    );
  if (error.code === "42501")
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Akses untuk mengubah Post tidak tersedia. Hubungi pengelola ruang kerja.",
    );
  throw new ApiError(
    503,
    "SERVICE_UNAVAILABLE",
    "Data Posts belum dapat diproses. Silakan coba lagi.",
  );
}
export function literalSearch(value) {
  return value.replace(/[\\%_*]/g, (char) => `\\${char}`);
}
export function createPostsService(supabase) {
  const table = () => supabase.from("posts");
  async function get(id) {
    idSchema.parse(id);
    const { data, error } = await table()
      .select(POST_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    checkDatabase(error);
    if (!data) throw new ApiError(404, "NOT_FOUND", "Post tidak ditemukan.");
    return data;
  }
  async function update(previous, changes, expected) {
    if (expected && expected !== previous.updated_at)
      throw new ApiError(
        409,
        "POST_CHANGED",
        "Post telah diubah. Muat ulang sebelum menyimpan lagi.",
      );
    const { data, error } = await table()
      .update(changes)
      .eq("id", previous.id)
      .eq("updated_at", previous.updated_at)
      .select(POST_COLUMNS)
      .maybeSingle();
    checkDatabase(error);
    if (!data)
      throw new ApiError(
        409,
        "POST_CHANGED",
        "Post telah diubah atau dihapus. Muat ulang halaman.",
      );
    return data;
  }
  return {
    get,
    async list(params) {
      const { q, status, page } = listPostsSchema.parse(params);
      let query = table().select(POST_COLUMNS, { count: "exact" });
      if (q) query = query.ilike("title", `%${literalSearch(q)}%`);
      if (status !== "all") query = query.eq("status", status);
      const { data, count, error } = await query
        .order("updated_at", { ascending: false })
        .order("id", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      checkDatabase(error);
      return {
        data,
        meta: {
          page,
          pageSize: PAGE_SIZE,
          total: count,
          totalPages: Math.ceil(count / PAGE_SIZE),
        },
      };
    },
    async create(body) {
      const input = createPostSchema.parse(body);
      let changes;
      try {
        changes = preparePost(input);
      } catch (error) {
        throw new ApiError(422, "VALIDATION_ERROR", error.message);
      }
      const { data, error } = await table()
        .insert(changes)
        .select(POST_COLUMNS)
        .single();
      checkDatabase(error);
      return data;
    },
    async patch(id, body) {
      const { updated_at, ...input } = updatePostSchema.parse(body);
      const previous = await get(id);
      let changes;
      try {
        changes = preparePost(input, previous);
      } catch (error) {
        throw new ApiError(422, "VALIDATION_ERROR", error.message);
      }
      return update(previous, changes, updated_at);
    },
    async remove(id) {
      const previous = await get(id);
      const { data, error } = await table()
        .delete()
        .eq("id", id)
        .eq("updated_at", previous.updated_at)
        .select("id")
        .maybeSingle();
      checkDatabase(error);
      if (!data)
        throw new ApiError(
          409,
          "POST_CHANGED",
          "Post telah diubah atau dihapus. Muat ulang halaman.",
        );
      return null;
    },
    async link(id, body) {
      const input = linkVideoSchema.parse(body);
      const previous = await get(id);
      if (previous.status !== "scheduled")
        throw new ApiError(
          409,
          "INVALID_STATUS",
          "Hanya Post Terjadwal yang dapat ditandai Sudah Upload.",
        );
      return update(
        previous,
        { video_url: input.video_url, status: "uploaded" },
        input.updated_at,
      );
    },
  };
}
