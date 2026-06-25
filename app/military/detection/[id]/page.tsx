import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getPhoto } from "@root/actions/detection";
import { DetectionCanvas } from "@/components/shared/detection/detection-canvas";
import { FindingsPanel } from "@/components/shared/detection/findings-panel";
import { DeletePhotoButton } from "@/components/shared/detection/delete-photo-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const photo = await getPhoto(Number(id));
  if (!photo) return { title: "Фото не знайдено" };
  return { title: `${photo.original} | Детекція | 23 ОМБр` };
}

export default async function DetectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const photo = await getPhoto(Number(id));
  if (!photo) notFound();

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href="/military/detection"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ChevronLeft className="size-4" />
          Назад
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{photo.original}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Завантажено {new Date(photo.uploadedAt).toLocaleString("uk-UA")}
              {photo.uploader?.name && ` — ${photo.uploader.name}`}
            </p>
          </div>
          <DeletePhotoButton photoId={photo.id} redirectTo="/military/detection" variant="full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DetectionCanvas
            src={`/uploads/detections/${photo.filename}`}
            width={photo.width}
            height={photo.height}
            detections={photo.detections}
          />
        </div>
        <div className="lg:col-span-1">
          <FindingsPanel detections={photo.detections} />
        </div>
      </div>
    </div>
  );
}
