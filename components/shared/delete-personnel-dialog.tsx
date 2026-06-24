"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Props {
  personnelId: number;
  fullName: string;
  deleteAction: (id: number) => Promise<{ id: number; fullName: string }>;
  listPath: string;
}

export function DeletePersonnelDialog({ personnelId, fullName, deleteAction, listPath }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAction(personnelId);
      setIsLoading(false);
      setOpen(false);
      toast.success("Анкету видалено", {
        description: `${fullName} — видалено`,
      });
      router.push(listPath);
    } catch {
      setIsLoading(false);
      toast.error("Помилка при видаленні");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="size-6 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Видалити анкету</AlertDialogTitle>
          <AlertDialogDescription>
            Ви впевнені, що хочете видалити анкету <strong>{fullName}</strong>?<br />
            Цю дію не можна скасувати.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isLoading ? "Видалення..." : "Видалити"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
