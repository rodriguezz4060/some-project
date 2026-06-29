import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/shared/fuel/vehicle-form";
import { getVehicleById } from "@root/lib/data/fuel";

export default async function VehicleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(Number(id));
  if (!vehicle) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/fuel/vehicles/${id}`}
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Повернутись до авто
        </Link>
      </div>

      <VehicleForm initialData={vehicle} />
    </div>
  );
}
