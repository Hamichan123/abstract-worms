"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-slate-300/80">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-slate-500/60" />
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Abstract Worms logo"
              width={56}
              height={56}
              className="rounded-sm"
            />
            <span className="text-slate-200">Abstract Worms</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="https://x.com/AbstractWorms"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-slate-300/80 hover:text-slate-50 transition-colors"
          >
            <Twitter className="h-4 w-4" />
            <span>Twitter</span>
          </Link>

          <Link
            href="/galerie"
            className="inline-flex items-center gap-2 text-slate-300/80 hover:text-slate-50 transition-colors"
          >
            <span>Galerie</span>
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-medium text-lime-300 border border-lime-400/30">
              Sneak Peeks
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

