import { requireMember } from "@/lib/auth/requireMember";
import { success, failure, readJson, verifyOrigin } from "@/lib/api/errors";
import { createPostsService } from "@/features/posts/postsService";

export async function GET(request) {
  try {
    const { supabase } = await requireMember();
    const result = await createPostsService(supabase).list(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return success(result.data, result.meta);
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request) {
  try {
    verifyOrigin(request);
    const { supabase } = await requireMember();
    return success(
      await createPostsService(supabase).create(await readJson(request)),
      {},
      201,
    );
  } catch (error) {
    return failure(error);
  }
}
