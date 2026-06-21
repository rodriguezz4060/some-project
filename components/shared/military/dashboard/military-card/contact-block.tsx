import { Phone, Mail } from "lucide-react";

interface Props {
  phone?: string;
  email?: string;
}

export function MilitaryContactBlock({ phone, email }: Props) {
  if (!phone && !email) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-border/50">
      <div className="flex flex-wrap gap-3 text-sm">
        {phone && (
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-xs">{email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
