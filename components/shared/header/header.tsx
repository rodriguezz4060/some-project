import React from "react";
import Link from "next/link";
import { cn } from "@root/lib/utils";
import { Container } from "../container";
import { AuthModal } from "../auth/auth-modal";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <nav
      className={cn(
        "border-b y-10 border-green-500/30 bg-zinc-950/95 backdrop-blur-xl sticky top-0 z-50",
        "shadow-[0_1px_5px_rgb(74,222,128,0.15)]",
        className,
      )}
      aria-label="Головна навігація"
    >
      <Container className="flex items-center justify-between py-4  max-w-310">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl border border-green-500/50 bg-zinc-900 flex items-center justify-center transition-all group-hover:border-green-400">
              <span className="text-green-400 text-xl font-bold">⚡</span>
            </div>

            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                БОЄГОТОВНІСТЬ
              </h1>
              <p className="text-xs font-mono text-green-500/70 tracking-[2px] -mt-1">
                PERSONNEL TRACKER
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <AuthModal />
        </div>
      </Container>
    </nav>
  );
};
