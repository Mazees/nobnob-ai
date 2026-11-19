import { Suspense } from "react";
import { PostDetail } from "@/features/posts/PostDetail";
import { LoadingPost } from "@/features/posts/PostsUi";
export default function PostDetailPage() {
  return (
    <Suspense fallback={<LoadingPost />}>
      <PostDetail />
    </Suspense>
  );
}
