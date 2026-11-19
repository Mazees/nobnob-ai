import { Suspense } from "react";
import { EditPost } from "@/features/posts/EditPost";
import { LoadingPost } from "@/features/posts/PostsUi";
export default function EditPostPage() {
  return (
    <Suspense fallback={<LoadingPost />}>
      <EditPost />
    </Suspense>
  );
}
