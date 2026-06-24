import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BzvpForm } from "@/components/shared/bzvp/new-form/bzvp-new-form";
import { getBzvpPersonnelById } from "@root/lib/data/bzvp";

export default async function EditBzvpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getBzvpPersonnelById(Number(id));

  if (!person) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <Link
        href={`/bzvp/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        До профілю
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Редагування анкети</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {person.fullName}
        </p>
      </div>

      <BzvpForm initialData={person} />
    </div>
  );
}
