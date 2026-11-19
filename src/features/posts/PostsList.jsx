"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/Controls";
import { postsRequest } from "./postsApi";
import { queryKeys } from "./queryKeys";
import { formatDuration } from "./postSchema";
import { PostForm } from "./PostForm";
import {
  Card,
  PostDialog,
  PostHeader,
  PostStatus,
  WibDate,
  QueryError,
  LoadingPost,
  controlClass,
} from "./PostsUi";

export function PostsList() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const params = { q, status, page };
  const query = useQuery({
    queryKey: queryKeys.postList(params),
    queryFn: ({ signal }) =>
      postsRequest(`?${new URLSearchParams(params)}`, { signal }),
  });
  function closeForm() {
    if (
      !busy &&
      (!dirty || window.confirm("Perubahan belum disimpan. Tutup form?"))
    ) {
      setCreating(false);
      setDirty(false);
    }
  }
  const result = query.data;
  return (
    <>
      <PostHeader
        title="Posts"
        description="Tulis, jadwalkan, dan tautkan konten TikTok."
      >
        <Button
          onClick={() => {
            setDirty(false);
            setNotice("");
            setCreating(true);
          }}
        >
          + Buat Post
        </Button>
      </PostHeader>
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-control bg-success-soft p-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex max-w-full flex-wrap gap-1 rounded-control bg-background p-1"
            aria-label="Filter status"
          >
            {[
              ["all", "Semua"],
              ["draft", "Draft"],
              ["scheduled", "Terjadwal"],
              ["uploaded", "Sudah Upload"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={`rounded-control px-3 py-2 text-xs font-medium sm:text-sm ${status === value ? "bg-sidebar-active text-sidebar-active-foreground" : "text-muted hover:bg-accent"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="w-full sm:w-64">
            <span className="sr-only">Cari judul Post</span>
            <input
              type="search"
              placeholder="Cari judul…"
              aria-label="Cari judul Post"
              value={search}
              maxLength={160}
              onChange={(event) => setSearch(event.target.value)}
              className={controlClass}
            />
          </label>
        </div>
        {query.isPending ? (
          <LoadingPost />
        ) : query.isError ? (
          <QueryError error={query.error} retry={() => query.refetch()} />
        ) : (
          <>
            {result.data.length ? (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted">
                      <th className="px-3 py-3 font-medium">Judul konten</th>
                      <th className="px-3 py-3 font-medium">Durasi</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Rencana upload</th>
                      <th className="px-3 py-3 font-medium">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-border last:border-b-0 hover:bg-background/70"
                      >
                        <td className="max-w-[300px] px-3 py-5">
                          <Link
                            href={`/dashboard/posts/${post.id}`}
                            className="wrap-anywhere font-semibold hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-3 py-5 text-xs text-muted">
                          {formatDuration(post.duration_seconds) ||
                            "Belum diisi"}
                        </td>
                        <td className="px-3 py-5">
                          <PostStatus post={post} />
                        </td>
                        <td className="px-3 py-5 text-xs text-muted">
                          <WibDate value={post.scheduled_at} />
                        </td>
                        <td className="px-3 py-5">
                          <Link
                            href={`/dashboard/posts/${post.id}`}
                            className="font-semibold text-primary"
                          >
                            Buka →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <h2 className="font-semibold">
                  {q || status !== "all"
                    ? "Post tidak ditemukan"
                    : "Belum ada Post"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {q || status !== "all"
                    ? "Ubah pencarian atau filter untuk melihat Post lain."
                    : "Buat Post pertama untuk mulai menyusun konten usahamu."}
                </p>
                <div className="mt-5">
                  <Button variant="secondary" onClick={() => setCreating(true)}>
                    Buat Post
                  </Button>
                </div>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted">
              <p>{result.meta.total} Post · 20 per halaman</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={
                    page <= 1 || query.isFetching || search.trim() !== q
                  }
                  onClick={() => setPage((value) => value - 1)}
                >
                  Sebelumnya
                </Button>
                <span>
                  Halaman {page} dari {Math.max(1, result.meta.totalPages)}
                </span>
                <Button
                  variant="secondary"
                  disabled={
                    page >= result.meta.totalPages ||
                    query.isFetching ||
                    search.trim() !== q
                  }
                  onClick={() => setPage((value) => value + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      {creating && (
        <PostDialog
          title="Buat Post"
          wide
          busy={busy}
          onRequestClose={closeForm}
        >
          <PostForm
            onCancel={closeForm}
            onDirtyChange={setDirty}
            onBusyChange={setBusy}
            onSaved={() => {
              setCreating(false);
              setDirty(false);
              setPage(1);
              setNotice("Post berhasil disimpan.");
            }}
          />
        </PostDialog>
      )}
    </>
  );
}
