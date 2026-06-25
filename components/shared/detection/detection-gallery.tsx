import Link from "next/link";
import Image from "next/image";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeletePhotoButton } from "@/components/shared/detection/delete-photo-button";
import type { Photo, Detection } from "@/generated/prisma/client";

interface PhotoWithDetections extends Photo {
  detections: Detection[];
  uploader: { name: string | null } | null;
}

interface Props {
  photos: PhotoWithDetections[];
  page: number;
  totalPages: number;
}

export function DetectionGallery({ photos, page, totalPages }: Props) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Ще немає завантажених фото
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const labels = [...new Set(photo.detections.map((d) => d.label))];
          return (
            <div
              key={photo.id}
              className="group relative rounded-xl border border-border overflow-hidden bg-card"
            >
              <Link href={`/military/detection/${photo.id}`}>
                <div className="relative aspect-4/3 bg-muted overflow-hidden">
                  <Image
                    src={`/uploads/detections/${photo.filename}`}
                    alt={photo.original}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-2.5 space-y-1">
                <p className="text-xs text-muted-foreground truncate">
                  {photo.original}
                </p>
                <div className="flex flex-wrap gap-1">
                  {labels.map((l) => (
                    <span
                      key={l}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(photo.uploadedAt).toLocaleDateString("uk-UA")}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      asChild
                    >
                      <Link href={`/military/detection/${photo.id}`}>
                        <Eye className="size-3" />
                      </Link>
                    </Button>
                    <DeletePhotoButton photoId={photo.id} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={`/military/detection?page=${page - 1}`}>
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <span>
                <ChevronLeft className="size-4" />
              </span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link href={`/military/detection?page=${page + 1}`}>
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span>
                <ChevronRight className="size-4" />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
