"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PhotoUpload() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Дозволено лише JPEG, PNG, WebP");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Файл завеликий (макс 20MB)");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const form = new FormData();
    form.set("file", file);

    try {
      const res = await fetch("/api/detect", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Помилка");
      }
      const data = await res.json();
      const peopleCount = data.detections.filter((d: { label: string }) => d.label === "person").length;
      const msg = peopleCount > 0
        ? `Знайдено ${data.detections.length} об'єктів (${peopleCount} ${peopleCount === 1 ? "людина" : "людей"})`
        : `Знайдено ${data.detections.length} об'єктів`;
      toast.success(msg);
      router.push(`/military/detection/${data.photoId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Помилка з'єднання з детектором");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageUp className="size-4" />
        )}
        {loading ? "Аналіз..." : "Завантажити фото"}
      </Button>

      {preview && (
        <div className="relative max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Попередній перегляд завантаженого фото" className="w-full h-auto rounded-lg border" />
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Loader2 className="size-5 animate-spin" />
                Детекція об&apos;єктів...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
