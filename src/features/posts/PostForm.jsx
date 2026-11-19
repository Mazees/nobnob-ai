"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, TextInput } from "@/components/Controls";
import {
  postFormSchema,
  parseDuration,
  formatDuration,
  fromWibInput,
  toWibInput,
  normalizeHashtags,
} from "./postSchema";
import { postsRequest } from "./postsApi";
import { invalidatePosts } from "./queryKeys";
import {
  Card,
  ErrorMessage,
  PredictionReference,
  controlClass,
} from "./PostsUi";
import { useCurrentMinute } from "./useCurrentMinute";
import { useUnsavedChanges } from "./useUnsavedChanges";

export function PostForm({
  post: initialPost,
  onSaved,
  onCancel,
  onDirtyChange,
  onBusyChange,
}) {
  const [post] = useState(() => initialPost);
  const client = useQueryClient();
  const now = useCurrentMinute();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      duration: formatDuration(post?.duration_seconds),
      caption: post?.caption || "",
      hashtags: (post?.hashtags || []).join(" "),
      schedule: toWibInput(post?.scheduled_at),
    },
  });
  const schedule = useWatch({ control, name: "schedule" });
  const allowNavigation = useUnsavedChanges(isDirty || saving);
  const mutation = useMutation({
    mutationFn: (body) =>
      postsRequest(post ? `/${post.id}` : "", {
        method: post ? "PATCH" : "POST",
        body,
      }),
  });
  const busy = saving;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  async function save(values, intent) {
    setSaveError(null);
    const status = post?.status === "uploaded" ? "uploaded" : intent;
    if (status === "scheduled" && !values.schedule) {
      setError(
        "schedule",
        { message: "Isi tanggal dan jam sebelum menjadwalkan." },
        { shouldFocus: true },
      );
      return;
    }
    setSaving(true);
    try {
      const result = await mutation.mutateAsync({
        title: values.title,
        content: values.content,
        duration_seconds: parseDuration(values.duration),
        caption: values.caption,
        hashtags: normalizeHashtags(values.hashtags),
        scheduled_at:
          status === "draft"
            ? null
            : values.schedule === toWibInput(post?.scheduled_at)
              ? post?.scheduled_at || null
              : fromWibInput(values.schedule),
        status,
        ...(post && { updated_at: post.updated_at }),
      });
      allowNavigation();
      reset(values);
      client.setQueryData(["posts", "detail", result.data.id], result);
      await invalidatePosts(client);
      onSaved(result.data);
    } catch (error) {
      setSaveError(error);
      const mapping = {
        duration_seconds: "duration",
        scheduled_at: "schedule",
      };
      for (const [field, message] of Object.entries(error.fields || {}))
        if (
          [
            "title",
            "content",
            "caption",
            "hashtags",
            "duration_seconds",
            "scheduled_at",
          ].includes(field)
        )
          setError(mapping[field] || field, { message });
    } finally {
      setSaving(false);
    }
  }
  const past =
    schedule &&
    !errors.schedule &&
    new Date(`${schedule}:00+07:00`).getTime() < now;
  const fieldProps = (name) => ({
    ...register(name),
    disabled: busy,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const fieldError = (name) =>
    errors[name] && (
      <p id={`${name}-error`} className="text-xs text-danger" role="alert">
        {errors[name].message}
      </p>
    );
  return (
    <form
      data-dirty={isDirty}
      noValidate
      onSubmit={(event) => {
        const intent =
          event.nativeEvent.submitter?.value ||
          (post?.status === "scheduled" ? "scheduled" : "draft");
        handleSubmit((values) => save(values, intent))(event);
      }}
      className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,1fr)]"
    >
      <Card className="space-y-5">
        <div>
          <h2 className="font-semibold">Isi konten</h2>
          <p className="mt-1 text-xs text-muted">
            Mulai dari judul. Bagian lain bisa dilengkapi nanti.
          </p>
        </div>
        <div className="space-y-1">
          <TextInput
            label="Judul"
            placeholder="Contoh: Menu makan siang"
            maxLength={160}
            required
            {...fieldProps("title")}
          />
          {fieldError("title")}
        </div>
        <div className="space-y-1">
          <label className="grid gap-2 text-sm font-medium">
            Konsep dan script
            <textarea
              rows={7}
              placeholder="Tulis pembuka, urutan adegan, dan narasi…"
              className={controlClass}
              {...fieldProps("content")}
            />
          </label>
          {fieldError("content")}
        </div>
        <div className="space-y-1">
          <TextInput
            label="Durasi"
            placeholder="00:00:30"
            {...fieldProps("duration")}
          />
          <p className="text-xs text-muted">
            Opsional. Format HH:MM:SS (jam, menit, detik).
          </p>
          {fieldError("duration")}
        </div>
        <div className="space-y-1">
          <label className="grid gap-2 text-sm font-medium">
            Caption
            <textarea
              rows={4}
              className={controlClass}
              {...fieldProps("caption")}
            />
          </label>
          {fieldError("caption")}
        </div>
        <div className="space-y-1">
          <TextInput
            label="Hashtag"
            placeholder="#KulinerMadura #MakanSiang"
            {...fieldProps("hashtags")}
          />
          <p className="text-xs text-muted">
            Pisahkan dengan spasi atau koma. Hashtag ganda disatukan.
          </p>
          {fieldError("hashtags")}
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="space-y-4">
          <div>
            <h2 className="font-semibold">Rencana upload</h2>
            <p className="mt-1 text-xs text-muted">
              Unggah konten secara manual melalui TikTok.
            </p>
          </div>
          <TextInput
            label="Tanggal dan jam upload"
            type="datetime-local"
            {...fieldProps("schedule")}
          />
          <p className="text-xs text-muted">
            Zona waktu WIB (Asia/Jakarta). Jadwal tidak disimpan untuk Draft.
          </p>
          {fieldError("schedule")}
          {past && (
            <p
              role="status"
              className="rounded-control bg-warning-soft p-3 text-xs text-warning"
            >
              Waktu ini sudah lewat. Post tetap boleh dijadwalkan dan akan
              ditandai Terlewat.
            </p>
          )}
          {post?.status === "uploaded" && (
            <p className="text-sm text-success">
              Status tetap Sudah Upload setelah disimpan.
            </p>
          )}
          <ErrorMessage error={saveError} />
          <div className="flex flex-wrap gap-2">
            {post?.status === "uploaded" ? (
              <Button type="submit" value="uploaded" disabled={busy}>
                Simpan perubahan
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  value="draft"
                  disabled={busy}
                >
                  Simpan sebagai Draft
                </Button>
                <Button type="submit" value="scheduled" disabled={busy}>
                  Jadwalkan
                </Button>
              </>
            )}
            <Button variant="secondary" disabled={busy} onClick={onCancel}>
              Batal
            </Button>
          </div>
          {busy && (
            <p role="status" className="text-xs text-muted">
              Menyimpan Post…
            </p>
          )}
        </Card>
        <PredictionReference
          prediction={
            post?.prediction && isDirty
              ? { ...post.prediction, status: "stale" }
              : post?.prediction
          }
        />
      </div>
    </form>
  );
}
