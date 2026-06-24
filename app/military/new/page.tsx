import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MilitaryForm } from "@/components/shared/military/new-form/military-new-form";

export default function MilitaryNewPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/military"
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До списку особового складу
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-8">Нова анкета</h1>

      <MilitaryForm />
    </div>
  );
}
