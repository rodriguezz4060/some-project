import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FuelRecordForm } from "@/components/shared/fuel/fuel-record-form";
import { getFuelRecordById, getVehicles } from "@root/lib/data/fuel";

export default async function FuelRecordEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getFuelRecordById(Number(id));
  if (!record) notFound();

  const vehicles = await getVehicles();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/fuel/records"
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До журналу
        </Link>
      </div>

      <FuelRecordForm
        vehicles={vehicles.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          licensePlate: v.licensePlate,
        }))}
        initialData={record}
      />
    </div>
  );
}
