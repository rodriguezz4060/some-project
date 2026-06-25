import { getPhotos } from "@root/actions/detection";
import { PhotoUpload } from "@/components/shared/detection/photo-upload";
import { DetectionGallery } from "@/components/shared/detection/detection-gallery";

export const metadata = {
  title: "Детекція об'єктів | 23 ОМБр",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DetectionPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { photos, totalPages } = await getPhotos(page, 20);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Детекція об&apos;єктів</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Завантажте фото для аналізу — YOLO26 знайде людей, авто, вантажівки та інші об&apos;єкти
        </p>
      </div>

      <PhotoUpload />

      <div>
        <h2 className="text-lg font-semibold mb-3">Завантажені фото</h2>
        <DetectionGallery photos={photos} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
