import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSettings } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Налаштування | 23 ОМБр",
  description: "Налаштування системи",
};

export default function SettingsPage() {
  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconSettings className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Налаштування</CardTitle>
              <CardDescription>
                Керування параметрами системи
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Сторінка в розробці. Тут будуть налаштування профілю, сповіщень та
            системи.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
