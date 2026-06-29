"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface UserOption {
  id: number;
  name: string | null;
  email: string;
}

interface LogFilterClientProps {
  users: UserOption[];
}

export function LogFilterClient({ users }: LogFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAction = searchParams.get("action") ?? "";
  const currentEntity = searchParams.get("entityType") ?? "";
  const currentUserEmail = searchParams.get("userEmail") ?? "";

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/logs?${params.toString()}`);
  }

  function resetFilters() {
    router.push("/admin/logs");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={currentAction}
        onValueChange={(v) => applyFilter("action", v)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Дія" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">—</SelectItem>
          <SelectItem value="CREATE">Створення</SelectItem>
          <SelectItem value="UPDATE">Зміна</SelectItem>
          <SelectItem value="DELETE">Видалення</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentEntity}
        onValueChange={(v) => applyFilter("entityType", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Сутність" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">—</SelectItem>
          <SelectItem value="MilitaryPersonnel">Військові</SelectItem>
          <SelectItem value="BzvpPersonnel">БЗВП</SelectItem>
          <SelectItem value="Vehicle">Автомобілі</SelectItem>
          <SelectItem value="FuelRecord">Заправки</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentUserEmail}
        onValueChange={(v) => applyFilter("userEmail", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Користувач" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">—</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.email}>
              {u.name ?? u.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={resetFilters} className="gap-1.5">
        <RotateCcw className="size-3.5" />
        Скинути
      </Button>
    </div>
  );
}
