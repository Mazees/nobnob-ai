"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput } from "@/components/Controls";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { postsRequest } from "./postsApi";
import { queryKeys, invalidatePosts } from "./queryKeys";
import { formatDuration, linkVideoSchema } from "./postSchema";
import {
  Card,
  ErrorMessage,
  PostHeader,
  PostDialog,
  PostStatus,
  PredictionReference,
  WibDate,
  LoadingPost,
  QueryError,
} from "./PostsUi";

function LinkVideoForm({
  post,
  onSaved,
  onCancel,
  onBusyChange,
  onDirtyChange,
}) {
  const [error, setError] = useState(null);
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(linkVideoSchema),
    defaultValues: { video_url: "" },
  });
  const allowNavigation = useUnsavedChanges(isDirty || isSubmitting);
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);
  async function submit(values) {
    setError(null);
    onBusyChange(true);
    try {
      const result = await postsRequest(`/${post.id}/link-video`, {
        method: "POST",
        body: { ...values, updated_at: post.updated_at },
      });
      client.setQueryData(queryKeys.post(post.id), result);
      await invalidatePosts(client);
      allowNavigation();
      onSaved();
    } catch (problem) {
      setError(problem);
    } finally {
      onBusyChange(false);
    }
  }
  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
      <p className="text-sm text-muted">
        Masukkan link penuh video yang sudah diunggah.
      </p>
      <TextInput
        label="Link video TikTok"
        type="url"
        placeholder="https://www.tiktok.com/@username/video/123456789"
        required
        disabled={isSubmitting}
        aria-invalid={!!errors.video_url}
        aria-describedby="video-url-help"
        {...register("video_url")}
      />
      {errors.video_url && (
        <p role="alert" className="text-sm text-danger">
          {errors.video_url.message}
        </p>
      )}
      <p
        id="video-url-help"
        className="rounded-control bg-warning-soft p-3 text-xs text-warning"
      >
        Tahap ini hanya memeriksa format link. Kepemilikan video belum diperiksa
        melalui TikTok API. Link pendek belum diterima.
      </p>
      <ErrorMessage error={error} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={isSubmitting} onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Konfirmasi Sudah Upload"}
        </Button>
      </div>
    </form>
  );
}
export function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const client = useQueryClient();
  const [dialog, setDialog] = useState(null);
  const [linkDirty, setLinkDirty] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const query = useQuery({
    queryKey: queryKeys.post(id),
    queryFn: ({ signal }) => postsRequest(`/${id}`, { signal }),
  });
  const mutation = useMutation({
    mutationFn: (action) =>
      postsRequest(
        `/${id}`,
        action === "delete"
          ? { method: "DELETE" }
          : {
              method: "PATCH",
              body: { status: "draft", updated_at: query.data.data.updated_at },
            },
      ),
    onSuccess: async (result, action) => {
      if (action === "delete") {
        client.removeQueries({ queryKey: queryKeys.post(id) });
        router.replace("/dashboard/posts");
      } else {
        client.setQueryData(queryKeys.post(id), result);
        setNotice("Jadwal dibatalkan. Post kembali menjadi Draft.");
      }
      setDialog(null);
      await invalidatePosts(client);
    },
  });
  function openDialog(value) {
    mutation.reset();
    setLinkDirty(false);
    setDialog(value);
  }
  function closeDialog() {
    if (
      !mutation.isPending &&
      !linkBusy &&
      (dialog !== "link" ||
        !linkDirty ||
        window.confirm("Perubahan belum disimpan. Tutup form?"))
    )
      setDialog(null);
  }
  const post = query.data?.data;
  return (
    <>
      <PostHeader
        eyebrow="Posts"
        title={post?.title || "Detail Post"}
        description="Detail rencana konten dan video terkait."
      >
        <Link
          href="/dashboard/posts"
          className="rounded-control border border-border bg-surface px-4 py-2 text-sm font-semibold"
        >
          Kembali
        </Link>
        {post && (
          <Link
            href={`/dashboard/posts/${id}/edit`}
            className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Edit Post
          </Link>
        )}
      </PostHeader>
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-control bg-success-soft p-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      {query.isPending ? (
        <LoadingPost />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => query.refetch()} />
      ) : (
        post && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,1fr)]">
            <div className="space-y-4">
              <Card className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold">Rencana konten</h2>
                  <PostStatus post={post} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Konsep dan script</h3>
                  <p className="mt-2 whitespace-pre-wrap wrap-anywhere text-sm text-muted">
                    {post.content || "Belum diisi."}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Caption</h3>
                  <p className="mt-2 whitespace-pre-wrap wrap-anywhere text-sm text-muted">
                    {post.caption || "Belum diisi."}
                  </p>
                </div>
                <dl className="space-y-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                    <dt className="text-muted">Durasi</dt>
                    <dd className="font-medium">
                      {formatDuration(post.duration_seconds) || "Belum diisi"}
                    </dd>
                  </div>
                  <div className="border-t border-border pt-4">
                    <dt className="text-muted">Hashtag</dt>
                    <dd className="mt-2 wrap-anywhere font-medium">
                      {post.hashtags.join(" ") || "Belum diisi"}
                    </dd>
                  </div>
                </dl>
              </Card>
              {post.video_url && (
                <Card>
                  <h2 className="font-semibold">Video TikTok ditautkan</h2>
                  <a
                    className="mt-3 block wrap-anywhere text-sm text-primary underline"
                    href={post.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {post.video_url}
                  </a>
                  <p className="mt-3 text-xs text-muted">
                    Kepemilikan video belum diperiksa melalui TikTok API.
                    Statistik belum tersedia.
                  </p>
                </Card>
              )}
            </div>
            <div className="space-y-4">
              <Card className="space-y-4">
                <h2 className="font-semibold">Jadwal upload</h2>
                <p className="text-sm font-medium">
                  <WibDate value={post.scheduled_at} />
                </p>
                <p className="text-xs text-muted">Waktu upload dalam WIB.</p>
                <div className="flex flex-wrap gap-2">
                  {post.status === "scheduled" ? (
                    <>
                      <Button onClick={() => openDialog("link")}>
                        Tandai Sudah Upload
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => openDialog("cancel")}
                      >
                        Batalkan Jadwal
                      </Button>
                    </>
                  ) : post.status === "draft" ? (
                    <Link
                      href={`/dashboard/posts/${id}/edit`}
                      className="text-sm font-semibold text-primary"
                    >
                      Atur jadwal →
                    </Link>
                  ) : (
                    <PostStatus post={post} />
                  )}
                </div>
              </Card>
              <PredictionReference prediction={post.prediction} />
              <Card>
                <p className="text-xs text-muted">
                  Terakhir diperbarui <WibDate value={post.updated_at} />
                </p>
                <button
                  type="button"
                  onClick={() => openDialog("delete")}
                  className="mt-4 rounded-control border border-danger/30 px-4 py-2 text-sm font-semibold text-danger hover:bg-coral-soft"
                >
                  Hapus Post
                </button>
              </Card>
            </div>
          </div>
        )
      )}
      {dialog && post && (
        <PostDialog
          title={
            dialog === "link"
              ? "Tandai Sudah Upload"
              : dialog === "delete"
                ? "Hapus Post?"
                : "Batalkan jadwal?"
          }
          busy={mutation.isPending || linkBusy}
          onRequestClose={closeDialog}
        >
          {dialog === "link" ? (
            <LinkVideoForm
              post={post}
              onBusyChange={setLinkBusy}
              onDirtyChange={setLinkDirty}
              onCancel={closeDialog}
              onSaved={() => {
                setDialog(null);
                setNotice("Post berhasil ditandai Sudah Upload.");
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                {dialog === "delete"
                  ? `Post “${post.title}” akan dihapus permanen dari NobNob. Video di TikTok tidak dihapus.`
                  : "Post kembali menjadi Draft dan tanggal jadwal akan dikosongkan."}
              </p>
              <ErrorMessage error={mutation.error} />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={mutation.isPending}
                  onClick={() => setDialog(null)}
                >
                  Batal
                </Button>
                <Button
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate(dialog === "delete" ? "delete" : "cancel")
                  }
                >
                  {mutation.isPending
                    ? "Memproses…"
                    : dialog === "delete"
                      ? "Hapus Post"
                      : "Batalkan Jadwal"}
                </Button>
              </div>
            </div>
          )}
        </PostDialog>
      )}
    </>
  );
}
