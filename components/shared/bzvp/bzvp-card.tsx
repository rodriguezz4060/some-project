"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@root/lib/utils";
import { Calendar, MapPin, Tag, Timer, Phone } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BZVP_STATUS_CONFIG, statusIconMap } from "./constants";
import type { BzvpPersonnel } from "./types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

export function BzvpCard({
  id,
  fullName,
  birthDate,
  photo,
  phone,
  serviceUnit,
  arrivalDate,
  trainingPeriod,
  status,
  specialization,
}: BzvpPersonnel) {
  const statusInfo = BZVP_STATUS_CONFIG[status];
  const StatusIcon = statusIconMap[statusInfo.iconName];

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20">
      <div className={cn("h-1 w-full absolute top-0 left-0", statusInfo.color)} />

      <CardHeader className="pt-6 pb-2">
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
                  {getInitials(fullName)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                {fullName}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn("font-medium", statusInfo.badge)}
                >
                  <span className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 text-primary/60" />
              <span className="font-semibold text-foreground">{trainingPeriod}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Прибув з:</span>
            <span className="font-medium">{serviceUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Дата прибуття:</span>
            <span className="font-medium">{arrivalDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Дата народження:</span>
            <span className="font-medium">{birthDate}</span>
          </div>
          {specialization && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Спеціалізація:</span>
              <span className="font-medium">{specialization}</span>
            </div>
          )}
        </div>

        {phone && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Link
          href={`/bzvp/${id}`}
          className="w-full group/btn flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/10 transition-colors text-sm"
        >
          <span className="font-medium text-muted-foreground group-hover/btn:text-primary transition-colors">
            Детальніше
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all" />
        </Link>
      </CardFooter>
    </Card>
  );
}
