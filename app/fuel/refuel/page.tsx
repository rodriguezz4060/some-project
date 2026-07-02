import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FuelRecordForm } from "@/components/shared/fuel/forms/fuel-record-form";
import { getVehicles } from "@root/lib/data/fuel";

export default async function RefuelPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>;
}) {
  const { vehicleId } = await searchParams;
  const vehicles = await getVehicles();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/fuel"
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До списку
        </Link>
      </div>

      <FuelRecordForm
        vehicles={vehicles.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          licensePlate: v.licensePlate,
        }))}
        preselectedVehicleId={vehicleId ? Number(vehicleId) : undefined}
      />
    </div>
  );
}
