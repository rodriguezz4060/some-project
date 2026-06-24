import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@root/lib/utils";
import { getInitials } from "../../utils";
import { rankColors, statusConfig } from "../../constants";
import { Activity, Shield, Calendar, type LucideIcon } from "lucide-react";
import type { MilitaryPersonnel } from "../../types";

const statusIconMap: Record<string, LucideIcon> = {
  Activity,
  Shield,
  Calendar,
};

function getDaysLabel(days?: number): string {
  if (days === undefined) return "—";
  if (days === 0) return "сьогодні";
  if (days === 1) return "вчора";
  return `${days} дн. тому`;
}

interface StatsItem {
  label: string;
  value: string;
  color?: string;
}

interface Props extends Pick<MilitaryPersonnel, "fullName" | "rank" | "status" | "photo" | "unit"> {
  missions?: number;
  experience?: number;
  lastActiveDays?: number;
}

export function ProfileHero({
  fullName,
  rank,
  status,
  photo,
  unit,
  missions,
  experience,
  lastActiveDays,
}: Props) {
  const initials = getInitials(fullName);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusIconMap[statusInfo.iconName];
  const rankColor = rankColors[rank];

  const stats: StatsItem[] = [
    { label: "Місій", value: missions?.toString() ?? "—" },
    { label: "Досвід", value: experience ? `${experience} р.` : "—" },
    {
      label: "Останнє завдання",
      value: getDaysLabel(lastActiveDays),
      color: lastActiveDays !== undefined && lastActiveDays > 14 ? "text-amber-500" : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch">
      <div className="flex items-center gap-5 sm:flex-1">
        <div className="size-32 sm:size-44 rounded-xl ring-2 ring-primary/10 ring-offset-2 overflow-hidden shrink-0 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
          {photo ? (
            <Image
              src={photo}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-primary font-bold text-4xl sm:text-6xl">
              {initials}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-tight">{fullName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("font-medium text-base", rankColor)}>
              {rank}
            </Badge>
            <Badge variant="outline" className={cn("font-medium text-base", statusInfo.color)}>
              <span className="flex items-center gap-1">
                <StatusIcon className="size-3.5" />
                {statusInfo.label}
              </span>
            </Badge>
          </div>
          <p className="text-base text-muted-foreground">{unit}</p>
        </div>
      </div>

      <div className="flex gap-2 sm:flex-col sm:w-36">
        {stats.map((item) => (
          <Card key={item.label} size="sm" className="flex-1 py-2 sm:py-3">
            <div className="space-y-0 text-center sm:space-y-0.5">
              <div className={`text-lg font-bold tabular-nums sm:text-xl ${item.color ?? ""}`}>
                {item.value}
              </div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">
                {item.label}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
