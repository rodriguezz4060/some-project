"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { AuthForm } from "../auth/auth-form";

function NavCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
      <Link
        href="/military"
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 rounded-2xl"
      >
        <div className="relative h-72 flex flex-col items-center justify-center gap-5 p-8 text-center rounded-2xl border border-green-500/15 bg-gradient-to-br from-green-500/[0.04] to-transparent transition-all duration-300 ease-out group-hover:border-green-400/35 group-hover:shadow-[0_0_30px_-6px_rgb(74,222,128,0.12)] group-hover:-translate-y-0.5 group-focus-visible:border-green-400/35">
          <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/20 transition-all duration-300 group-hover:bg-green-500/20 group-hover:ring-green-400/30">
            <Shield className="size-7 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Військові</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Облік та управління особовим складом
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Особовий склад
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Підрозділи
            </span>
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-green-400 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            Перейти →
          </span>
        </div>
      </Link>
      <Link
        href="/bzvp"
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-2xl"
      >
        <div className="relative h-72 flex flex-col items-center justify-center gap-5 p-8 text-center rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent transition-all duration-300 ease-out group-hover:border-amber-400/35 group-hover:shadow-[0_0_30px_-6px_rgb(251,191,36,0.12)] group-hover:-translate-y-0.5 group-focus-visible:border-amber-400/35">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:ring-amber-400/30">
            <Crosshair className="size-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">БЗВП</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Базова загальновійськова підготовка
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Навчання
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Озброєння
            </span>
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-amber-400 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            Перейти →
          </span>
        </div>
      </Link>
    </div>
  );
}

function AuthSection() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          БОЄГОТОВНІСТЬ
        </h1>
        <p className="text-sm font-mono text-green-500/70 tracking-[2px]">
          PERSONNEL TRACKER
        </p>
        <p className="text-zinc-400 text-sm">
          Увійдіть для доступу до панелі керування
        </p>
      </div>
      <div className="w-full border border-green-500/15 rounded-2xl p-6 bg-gradient-to-br from-green-500/[0.04] to-transparent">
        <div className="space-y-2 mb-6">
          <h2 className="text-xl font-bold text-white">Вхід</h2>
          <p className="text-sm text-zinc-400">
            Використовуйте облікові дані, надані адміністратором
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}

function BackgroundBlurs() {
  return (
    <>
      <div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
        style={{ animation: "pulse 8s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        style={{ animation: "pulse 10s ease-in-out infinite" }}
      />
    </>
  );
}

export function HomeContent() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (window.location.search.includes("unauthorized=true")) {
      toast.error("Для доступу необхідно авторизуватись");
      window.history.replaceState(null, "", "/");
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden px-4">
        <BackgroundBlurs />
        <AuthSection />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden px-4">
      <BackgroundBlurs />
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-4xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-mono text-zinc-500 tracking-[3px] uppercase">
              Навігація
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Панель керування
          </h1>
          <p className="mt-3 text-zinc-400 text-sm md:text-base max-w-md mx-auto">
            Оберіть розділ для роботи
          </p>
        </div>
        <NavCards />
      </div>
    </div>
  );
}
