"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deletePhoto } from "@root/actions/detection";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  photoId: number;
  redirectTo?: string;
  variant?: "icon" | "full";
}

export function DeletePhotoButton({
  photoId,
  redirectTo,
  variant = "icon",
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    await deletePhoto(photoId);
    toast.success("Фото видалено");
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  if (variant === "full") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <Trash2 className="size-4" />
            Видалити фото
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити фото?</AlertDialogTitle>
            <AlertDialogDescription>
              Фото та всі результати детекції буде видалено без можливості
              відновлення.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 text-destructive">
          <Trash2 className="size-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити фото?</AlertDialogTitle>
          <AlertDialogDescription>
            Фото та всі результати детекції буде видалено без можливості
            відновлення.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Видалити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
