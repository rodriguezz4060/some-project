import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MilitaryForm } from "@/components/shared/military/new-form/military-new-form";
import { getMilitaryPersonnelById } from "@root/lib/data/military";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getMilitaryPersonnelById(Number(id));
  return { title: person ? `Редагування — ${person.fullName}` : "Не знайдено" };
}

export default async function MilitaryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getMilitaryPersonnelById(Number(id));

  if (!person) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/military/${person.id}`}
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До профілю
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">Редагування профілю</h1>
      <p className="text-sm text-muted-foreground mb-8">{person.fullName}</p>

      <MilitaryForm initialData={person} />
    </div>
  );
}
