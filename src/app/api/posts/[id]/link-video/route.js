import { requireMember } from "@/lib/auth/requireMember";
import { success, failure, readJson, verifyOrigin } from "@/lib/api/errors";
import { createPostsService } from "@/features/posts/postsService";

export async function POST(request, { params }) {
  try {
    verifyOrigin(request);
    const { supabase } = await requireMember();
    return success(
      await createPostsService(supabase).link(
        (await params).id,
        await readJson(request),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
