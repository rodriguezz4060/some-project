"use client";

import { useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";
import { UserMenu } from "./user-menu";

export function AuthModal() {
  const { data: session, status } = useSession();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (status === "loading" && !mounted) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (session?.user) {
    return <UserMenu />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <LogIn className="size-4" />
          Вхід
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="max-w-180 grid grid-cols-1 md:grid-cols-[38%_62%] gap-0 p-0 overflow-hidden"
      >
        <div className="flex flex-col justify-center gap-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Вхід
            </h2>
            <p className="text-sm text-zinc-400">
              Увійдіть у свій обліковий запис
            </p>
          </div>

          <AuthForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
