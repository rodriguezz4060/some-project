import { Shield, MapPin, Calendar, Activity } from "lucide-react";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-4 w-4 text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

interface Props {
  position: string;
  unit: string;
  birthDate: string;
  experience: number;
}

export function MilitaryInfoGrid({ position, unit, birthDate, experience }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <InfoRow icon={<Shield className="h-4 w-4" />} label="Посада:" value={position} />
      <InfoRow icon={<MapPin className="h-4 w-4" />} label="Підрозділ:" value={unit} />
      <InfoRow icon={<Calendar className="h-4 w-4" />} label="Дата народження:" value={birthDate} />
      <InfoRow icon={<Activity className="h-4 w-4" />} label="Досвід:" value={`${experience} років`} />
    </div>
  );
}
