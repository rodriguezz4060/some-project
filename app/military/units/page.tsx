import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBuildingFortress } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Підрозділи | 23 ОМБр",
  description: "Управління підрозділами",
};

export default function UnitsPage() {
  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconBuildingFortress className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Підрозділи</CardTitle>
              <CardDescription>
                Управління структурою підрозділів
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Сторінка в розробці. Тут буде відображатися структура рот, взводів
            та відділень.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
