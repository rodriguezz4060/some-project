import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/shared/fuel/forms/vehicle-form";

export default function VehicleNewPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/fuel"
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До списку автомобілів
        </Link>
      </div>

      <VehicleForm />
    </div>
  );
}
