"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/Controls";
import { PostForm } from "./PostForm";
import { PostHeader, LoadingPost, QueryError } from "./PostsUi";
import { postsRequest } from "./postsApi";
import { queryKeys } from "./queryKeys";
export function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: queryKeys.post(id),
    queryFn: ({ signal }) => postsRequest(`/${id}`, { signal }),
    refetchOnWindowFocus: false,
  });
  function cancel() {
    if (
      !busy &&
      (!dirty || window.confirm("Perubahan belum disimpan. Tinggalkan form?"))
    )
      router.push(`/dashboard/posts/${id}`);
  }
  return (
    <>
      <PostHeader
        eyebrow="Posts"
        title="Edit Post"
        description="Lengkapi isi konten dan atur jadwal upload."
      >
        <Button variant="secondary" disabled={busy} onClick={cancel}>
          Kembali
        </Button>
      </PostHeader>
      {query.isPending ? (
        <LoadingPost />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => query.refetch()} />
      ) : (
        <PostForm
          key={id}
          post={query.data.data}
          guardNavigation
          onDirtyChange={setDirty}
          onBusyChange={setBusy}
          onCancel={cancel}
          onSaved={() => router.push(`/dashboard/posts/${id}`)}
        />
      )}
    </>
  );
}
