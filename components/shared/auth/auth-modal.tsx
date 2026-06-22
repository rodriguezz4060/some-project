"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function AuthModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Функція входу ще не реалізована");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:text-blue-500">
          <LogIn className="size-4" />
          Вхід
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="max-w-180 grid grid-cols-1 md:grid-cols-[38%_62%] gap-0 p-0 overflow-hidden"
      >
        <div className="relative hidden md:block h-full min-h-110 overflow-hidden">
          <Image
            src="/auth-illustration.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent" />
        </div>

        <div className="flex flex-col justify-center gap-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Вхід
            </h2>
            <p className="text-sm text-zinc-400">
              Увійдіть у свій обліковий запис
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Пошта</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full">
              Увійти
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
