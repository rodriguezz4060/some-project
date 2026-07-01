"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { MilitaryPersonnel } from "../../../types";
import { MilitaryStatusBar } from "./status-bar";
import { MilitaryAvatarBlock } from "./avatar-block";
import { MilitaryMissionCount } from "./mission-count";
import { MilitaryInfoGrid } from "./info-grid";
import { MilitaryContactBlock } from "./contact-block";
import { MilitaryDetailsButton } from "./details-button";

export const MilitaryCard = memo(function MilitaryCard({
  id,
  fullName,
  rank,
  position,
  unit,
  status,
  birthDate,
  photo,
  experience,
  missions = 12,
  phone,
  email,
}: MilitaryPersonnel) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20">
      <MilitaryStatusBar status={status} />

      <CardHeader className="pt-6 pb-2">
        <div className="flex items-start justify-between">
          <MilitaryAvatarBlock
            fullName={fullName}
            rank={rank}
            status={status}
            photo={photo}
          />
          <MilitaryMissionCount missions={missions} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-2">
        <MilitaryInfoGrid
          position={position}
          unit={unit}
          birthDate={birthDate}
          experience={experience}
        />

        <MilitaryContactBlock phone={phone} email={email} />
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <MilitaryDetailsButton id={id} />
      </CardFooter>
    </Card>
  );
});
