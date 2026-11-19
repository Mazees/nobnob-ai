"use client";
import { useEffect, useId, useRef } from "react";
import { useCurrentMinute } from "./useCurrentMinute";
import { Button, StatusBadge } from "@/components/Controls";

export const controlClass =
  "w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60";
export function PostHeader({
  eyebrow = "Kelola konten",
  title,
  description,
  children,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 pt-5">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold text-primary">{eyebrow}</p>
        <h1 className="wrap-anywhere font-primary text-2xl font-bold sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
export function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-card border border-border bg-surface p-4 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
export function ErrorMessage({ error }) {
  return error ? (
    <p
      role="alert"
      className="rounded-control border border-danger/20 bg-coral-soft px-3 py-3 text-sm text-danger"
    >
      {error.message || error}
    </p>
  ) : null;
}
export function LoadingPost() {
  return (
    <Card>
      <div role="status" className="py-12 text-center text-sm text-muted">
        Memuat Posts…
      </div>
    </Card>
  );
}
export function QueryError({ error, retry }) {
  return (
    <Card>
      <ErrorMessage error={error} />
      <div className="mt-4">
        <Button variant="secondary" onClick={retry}>
          Coba lagi
        </Button>
      </div>
    </Card>
  );
}
export function WibDate({ value }) {
  return value ? (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value))}{" "}
      WIB
    </time>
  ) : (
    <span>Belum dijadwalkan</span>
  );
}
export function PostStatus({ post }) {
  const now = useCurrentMinute();
  const overdue =
    post.status === "scheduled" && new Date(post.scheduled_at).getTime() < now;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={post.status} />
      {overdue && (
        <span className="text-xs font-medium text-warning">Terlewat</span>
      )}
    </div>
  );
}
export function PredictionReference({ prediction }) {
  if (!prediction) return null;
  return (
    <Card>
      <h2 className="font-semibold">Prediksi Jangkauan</h2>
      <p className="mt-1 text-xs text-muted">
        Hasil sebelumnya sebagai referensi.
      </p>
      {prediction.label && (
        <p className="mt-3 text-sm font-semibold">{prediction.label}</p>
      )}
      {prediction.status === "stale" && (
        <p className="mt-3 rounded-control bg-warning-soft p-3 text-sm text-warning">
          Perlu diperbarui. Input Post berubah sejak prediksi terakhir.
        </p>
      )}
    </Card>
  );
}
export function PostDialog({
  title,
  children,
  onRequestClose,
  busy = false,
  wide = false,
}) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) onRequestClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onRequestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onRequestClose();
      }}
      className={`m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-none overflow-y-auto rounded-card border border-border bg-background p-0 text-foreground backdrop:bg-foreground/40 ${wide ? "sm:max-w-5xl" : "sm:max-w-lg"}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6">
        <h2 id={titleId} className="font-primary text-xl font-bold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Tutup dialog"
          disabled={busy}
          onClick={onRequestClose}
          className="grid size-10 shrink-0 place-items-center rounded-control text-xl hover:bg-accent disabled:opacity-50"
        >
          ×
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </dialog>
  );
}
