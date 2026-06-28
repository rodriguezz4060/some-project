"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert, Mail, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from "@root/actions/users";

interface User {
  id: number;
  email: string;
  name: string | null;
}

interface Props {
  user: User;
  isSelf: boolean;
  onClose: () => void;
}

interface FormState {
  error?: string;
  success?: boolean;
}

async function deleteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await deleteUser(Number(formData.get("id")));
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Невідома помилка" };
  }
}

export function UserDeleteDialog({ user, isSelf, onClose }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Користувача видалено");
      router.refresh();
      onClose();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, router, onClose]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="p-6 pb-2">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              {isSelf ? (
                <ShieldAlert className="size-6 text-destructive" />
              ) : (
                <TriangleAlert className="size-6 text-destructive" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isSelf ? "Неможливо видалити" : "Видалити користувача"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-200">
                {isSelf
                  ? "Ви не можете видалити власний обліковий запис"
                  : `Ви впевнені, що хочете видалити цього користувача? Цю дію не можна скасувати.`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {isSelf ? (
          <div className="px-6 pb-8">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Зрозуміло
            </Button>
          </div>
        ) : (
          <form action={formAction} className="px-6 pb-0">
            <input type="hidden" name="id" value={user.id} />

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                  <Mail className="size-4 text-destructive" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {user.name && (
                    <p className="text-xs text-muted-foreground truncate">{user.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 py-4 mt-4 border-t mb-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Скасувати
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                <TriangleAlert className="size-4 mr-1.5" />
                Видалити
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
