import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_PERSONNEL } from "@/components/shared/military/personnel-mock";
import { MilitaryStatusBar } from "@/components/shared/military/dashboard/roster/military-card/status-bar";
import { ProfileHero } from "@/components/shared/military/dashboard/profile/profile-hero";
import { ProfileTabs } from "@/components/shared/military/dashboard/profile/profile-tabs";
import { ProfilePdfWrapper } from "@/components/shared/military/dashboard/profile/profile-pdf-wrapper";
import type { MilitaryPersonnel } from "@/components/shared/military/types";

export default async function PersonnelProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = MOCK_PERSONNEL.find((p) => p.id === id) as
    | MilitaryPersonnel
    | undefined;

  if (!person) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/military"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          До списку особового складу
        </Link>
        <ProfilePdfWrapper personnel={person} />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <MilitaryStatusBar status={person.status} />
        <div className="p-6 pt-8">
          <ProfileHero
            fullName={person.fullName}
            rank={person.rank}
            status={person.status}
            photo={person.photo}
            unit={person.unit}
            missions={person.missions}
            experience={person.experience}
            lastActiveDays={person.lastActiveDays}
          />
        </div>
      </div>

      <ProfileTabs personnel={person} />
    </div>
  );
}
