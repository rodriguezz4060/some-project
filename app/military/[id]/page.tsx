import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@root/lib/utils";
import { getMilitaryPersonnelById } from "@root/lib/data/military";
import { MilitaryStatusBar } from "@/components/shared/military/dashboard/roster/military-card/status-bar";
import { ProfileHero } from "@/components/shared/military/dashboard/profile/profile-hero";
import { ProfileTabs } from "@/components/shared/military/dashboard/profile/profile-tabs";
import { ProfilePdfWrapper } from "@/components/shared/military/dashboard/profile/profile-pdf-wrapper";
import { statusConfig } from "@/components/shared/military/constants";
import { DeletePersonnelDialog } from "@/components/shared/ui/delete-personnel-dialog";
import { deleteMilitary } from "@root/actions/military";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getMilitaryPersonnelById(Number(id));
  return { title: person?.fullName ?? "Профіль військовослужбовця" };
}

export default async function PersonnelProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getMilitaryPersonnelById(Number(id));

  if (!person) {
    notFound();
  }

  const statusInfo = statusConfig[person.status];

  return (
    <div>
      <div className="sticky top-[68px] z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="/military"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            До списку
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("font-medium text-xs", statusInfo.color)}
            >
              {statusInfo.label}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/military/${person.id}/edit`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Редагувати</TooltipContent>
            </Tooltip>
            <DeletePersonnelDialog
              personnelId={person.id}
              fullName={person.fullName}
              deleteAction={deleteMilitary}
              listPath="/military"
            />
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
