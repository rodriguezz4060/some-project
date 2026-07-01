"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@root/lib/utils";
import {
  Award,
  FileText,
  ScrollText,
  Shield,
  ShieldAlert,
  CheckCheck,
  Crosshair,
  Package,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";
import { ProfileClothingVisual } from "./profile-clothing-visual";
import { ProfilePositionHistory } from "./profile-position-history";
import type { MilitaryPersonnel, Achievement, Equipment, MedicalRecord } from "../../types";

interface Props {
  personnel: MilitaryPersonnel;
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-base">
      <span className="size-4 shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-28 text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const achievementIcon: Record<Achievement["type"], React.ReactNode> = {
  medal: <Award className="size-4 text-amber-500" />,
  commendation: <FileText className="size-4 text-blue-500" />,
  certificate: <ScrollText className="size-4 text-sky-500" />,
};

const equipmentIcon: Record<Equipment["type"], React.ReactNode> = {
  weapon: <Crosshair className="size-4" />,
  armor: <Shield className="size-4" />,
  gear: <Package className="size-4" />,
};

function MedicalTab({ records }: { records?: MedicalRecord[] }) {
  if (!records || records.length === 0) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        Медичних записів немає
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record, idx) => (
        <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {record.status === "active" ? (
              <ShieldAlert className="size-5 shrink-0 text-rose-500" />
            ) : (
              <CheckCheck className="size-5 shrink-0 text-emerald-500" />
            )}
            <div>
              <p className="text-base font-medium">{record.condition}</p>
              <p className="text-xs text-muted-foreground">
                {record.diagnosisDate}
                {record.notes ? ` — ${record.notes}` : ""}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0",
              record.status === "active"
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
            )}
          >
            {record.status === "active" ? "Активно" : "Вилікувано"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function AchievementsTab({ achievements }: { achievements?: Achievement[] }) {
  if (!achievements || achievements.length === 0) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        Нагород немає
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            {achievementIcon[item.type]}
          </span>
          <div className="flex-1">
            <p className="text-base font-medium">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {item.date}
          </span>
        </div>
      ))}
    </div>
  );
}

function EquipmentTab({ equipment }: { equipment?: Equipment[] }) {
  if (!equipment || equipment.length === 0) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        Майно не обліковується
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {equipment.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            {equipmentIcon[item.type]}
          </span>
          <div className="flex-1">
            <p className="text-base font-medium">{item.name}</p>
            {item.serialNumber && (
              <p className="text-xs text-muted-foreground">
                № {item.serialNumber}
              </p>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {item.issuedDate}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfileTabs({ personnel }: Props) {
  const { position, unit, birthDate, experience, phone, email } = personnel;

  return (
    <Tabs defaultValue="main">
      <TabsList className="w-full flex-wrap" variant="line">
        <TabsTrigger value="main">Основне</TabsTrigger>
        <TabsTrigger value="medical">Медицина</TabsTrigger>
        <TabsTrigger value="achievements">Нагороди</TabsTrigger>
        <TabsTrigger value="equipment">Майно</TabsTrigger>
        <TabsTrigger value="clothing">Розміри</TabsTrigger>
      </TabsList>

      <Separator className="mb-6" />

      <TabsContent value="main">
        <div className={`grid grid-cols-1 gap-6 ${personnel.positionHistory && personnel.positionHistory.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <Card>
            <CardHeader>
              <CardTitle>Особисті дані</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoLine icon={<Shield className="size-4" />} label="Посада" value={position} />
              <InfoLine icon={<MapPin className="size-4" />} label="Підрозділ" value={unit} />
              <InfoLine icon={<Calendar className="size-4" />} label="Дата народж." value={birthDate} />
              <InfoLine icon={<Activity className="size-4" />} label="Досвід" value={experience ? `${experience} років` : undefined} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Контакти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoLine icon={<Phone className="size-4" />} label="Телефон" value={phone} />
              <InfoLine icon={<Mail className="size-4" />} label="Email" value={email} />
            </CardContent>
          </Card>

          {personnel.positionHistory && personnel.positionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Посади та спеціальності</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfilePositionHistory history={personnel.positionHistory} />
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="medical">
        <Card>
          <CardHeader>
            <CardTitle>Медичні записи</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicalTab records={personnel.medicalRecords} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements">
        <Card>
          <CardHeader>
            <CardTitle>Нагороди та відзнаки</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementsTab achievements={personnel.achievements} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equipment">
        <Card>
          <CardHeader>
            <CardTitle>Майно держави</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentTab equipment={personnel.equipment} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clothing">
        <Card>
          <CardHeader>
            <CardTitle>Розміри одягу</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileClothingVisual sizes={personnel.clothingSizes} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
