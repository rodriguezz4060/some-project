import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Графік чергувань | 23 ОМБр",
  description: "Графік чергувань та ротацій",
};

export default function SchedulePage() {
  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Графік чергувань</CardTitle>
              <CardDescription>
                Планування ротацій та змін
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Сторінка в розробці. Тут буде календар чергувань, графік ротацій та
            відпусток.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
