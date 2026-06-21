import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@root/lib/utils";
import { getInitials } from "../../../utils";
import { rankColors, statusConfig } from "../../../constants";
import { Activity, Shield, Calendar, type LucideIcon } from "lucide-react";
import type { RankType, StatusType } from "../../../types";

const statusIconMap: Record<string, LucideIcon> = {
  Activity,
  Shield,
  Calendar,
};

interface Props {
  fullName: string;
  rank: RankType;
  status: StatusType;
  photo?: string;
}

export function MilitaryAvatarBlock({ fullName, rank, status, photo }: Props) {
  const initials = getInitials(fullName);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusIconMap[statusInfo.iconName];
  const rankColor = rankColors[rank];

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-none ring-1 ring-primary/10 ring-offset-1 overflow-hidden">
          {photo ? (
            <AvatarImage
              src={photo}
              alt={fullName}
              className="rounded-none object-cover"
            />
          ) : (
            <AvatarFallback className="rounded-none bg-linear-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {fullName}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("font-medium", rankColor)}>
              {rank}
            </Badge>
            <Badge
              variant="outline"
              className={cn("font-medium", statusInfo.color)}
            >
              <span className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </span>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
