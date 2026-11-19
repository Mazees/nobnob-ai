import { requireMember } from "@/lib/auth/requireMember";
import { success, failure, readJson, verifyOrigin } from "@/lib/api/errors";
import { createPostsService } from "@/features/posts/postsService";

export async function GET(request, { params }) {
  try {
    const { supabase } = await requireMember();
    return success(await createPostsService(supabase).get((await params).id));
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request, { params }) {
  try {
    verifyOrigin(request);
    const { supabase } = await requireMember();
    return success(
      await createPostsService(supabase).patch(
        (await params).id,
        await readJson(request),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request, { params }) {
  try {
    verifyOrigin(request);
    const { supabase } = await requireMember();
    return success(
      await createPostsService(supabase).remove((await params).id),
    );
  } catch (error) {
    return failure(error);
  }
}
