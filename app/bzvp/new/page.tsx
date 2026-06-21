import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BzvpNewForm } from "@/components/shared/bzvp/bzvp-new-form";

export default function NewBzvpPage() {
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/bzvp"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        До списку БЗВП
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Нова анкета БЗВП</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Заповніть усі поля для реєстрації військовослужбовця
        </p>
      </div>

      <BzvpNewForm />
    </div>
  );
}
