import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@root/lib/utils";
import { MOCK_PERSONNEL } from "@/components/shared/military/personnel-mock";
import { MilitaryStatusBar } from "@/components/shared/military/dashboard/roster/military-card/status-bar";
import { ProfileHero } from "@/components/shared/military/dashboard/profile/profile-hero";
import { ProfileTabs } from "@/components/shared/military/dashboard/profile/profile-tabs";
import { ProfilePdfWrapper } from "@/components/shared/military/dashboard/profile/profile-pdf-wrapper";
import { statusConfig } from "@/components/shared/military/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = MOCK_PERSONNEL.find((p) => p.id === id);
  return { title: person?.fullName ?? "Профіль військовослужбовця" };
}

export default async function PersonnelProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = MOCK_PERSONNEL.find((p) => p.id === id);

  if (!person) {
    notFound();
  }

  const statusInfo = statusConfig[person.status];

  return (
    <div>
      <div className="sticky top-[68px] z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link
            href="/military"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            До списку особового складу
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground/80 hidden sm:inline">
              {person.fullName}
            </span>
            <Badge
              variant="outline"
              className={cn("font-medium text-xs", statusInfo.color)}
            >
              {statusInfo.label}
            </Badge>
            <ProfilePdfWrapper personnel={person} />
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
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
    </div>
  );
}
