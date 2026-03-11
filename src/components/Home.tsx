"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GameArea from "@/components/GameArea";
import AnimatedWorm from "@/components/AnimatedWorm";
import { createStarField } from "@/utils/particles";
import type { SneakPeek } from "@/lib/sneakPeeks";
import WLFormModal from "@/components/WLFormModal";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_GRADIENTS = [
  "from-lime-300/40 via-emerald-300/30 to-cyan-300/40",
  "from-cyan-300/40 via-sky-300/30 to-indigo-400/40",
  "from-amber-300/40 via-rose-300/30 to-violet-400/40",
];

export default function Home({ sneakPeeks = [] }: { sneakPeeks: SneakPeek[] }) {
  const [gameState, setGameState] = useState<"lobby" | "playing">("lobby");
  const [isWLFormOpen, setIsWLFormOpen] = useState(false);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const finalCtaRef = useRef<HTMLDivElement | null>(null);

  const stars = useMemo(() => {
    if (typeof window === "undefined") return [];
    const isMobile = window.innerWidth < 640;
    return createStarField(isMobile ? 30 : 70);
  }, []);

  const previewPeeks = sneakPeeks.slice(0, 3);

  useEffect(() => {
    if (gameState !== "lobby") return;

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current, {
          opacity: 0,
          y: 32,
          duration: 1.1,
          ease: "power3.out",
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll(".feature-card"), {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 70%",
          },
          y: 40,
          opacity: 0,
          rotateX: -12,
          stagger: 0.18,
          duration: 0.9,
          ease: "power3.out",
        });
      }

      if (statsRef.current) {
        const statNumbers = statsRef.current.querySelectorAll("[data-stat-number]");
        statNumbers.forEach((el) => {
          const target = Number((el as HTMLElement).dataset.statNumber || 0);
          const obj = { value: 0 };
          gsap.to(obj, {
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
            },
            value: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              (el as HTMLElement).innerText = Math.floor(obj.value).toString();
            },
          });
        });
      }

      if (finalCtaRef.current) {
        gsap.fromTo(
          finalCtaRef.current,
          { scale: 0.92, opacity: 0 },
          {
            scrollTrigger: {
              trigger: finalCtaRef.current,
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
            scale: 1,
            opacity: 1,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [gameState]);

  if (gameState === "playing") {
    return <GameArea onExit={() => setGameState("lobby")} />;
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden px-4">
      {/* Animated nebula background + starfield */}
      <div className="nebula-background">
        <div className="nebula-layer" />
        <div className="star-field">
          {stars.map((s) => (
            <div
              key={s.id}
              className="star"
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDuration: `${s.duration}s, 1.8s`,
                animationDelay: `${s.delay}s, ${s.delay / 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main glass hero card */}
      <section
        ref={heroRef}
        className="relative z-10 w-full max-w-5xl mt-20 mb-20 rounded-3xl border border-white/10 bg-white/5 bg-clip-padding backdrop-blur-2xl shadow-[0_0_80px_rgba(15,23,42,0.9)] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-14 px-6 md:px-10 py-10 md:py-14">
          {/* Left: Title + copy + CTA */}
          <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-amber-300/90">
              Game context ended
            </div>

            <div className="space-y-4">
              <h1
                ref={heroTitleRef}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.08em] md:tracking-[0.12em] text-center md:text-left"
              >
                <span className="block text-slate-50 drop-shadow-[0_0_20px_rgba(15,23,42,0.9)]">
                  ABSTRACT
                </span>
                <span className="block text-lime-300 drop-shadow-[0_0_20px_rgba(132,204,22,0.9)]">
                  WORMS
                </span>
              </h1>

              <p className="text-sm md:text-base lg:text-lg font-medium text-[#94A3B8] max-w-md md:max-w-lg mx-auto md:mx-0">
                The play-to-WL game context has ended. You can still play the arcade and explore
                the Abstract Worms collection. Stay tuned for future drops. 🎉🍎
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 pt-2">
              <button
                onClick={() => setIsWLFormOpen(true)}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm md:text-base font-bold tracking-wide rounded-full bg-slate-900 border-2 border-lime-300 text-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_0_40px_rgba(132,204,22,0.6)] hover:bg-lime-900/30 active:scale-95 uppercase"
              >
                Apply to WL
              </button>

              <button
                onClick={() => setGameState("playing")}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm md:text-base font-semibold tracking-wide rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 text-slate-900 shadow-[0_0_45px_rgba(74,222,128,0.7)] transition-all duration-200 hover:scale-110 hover:shadow-[0_0_80px_rgba(74,222,128,0.95)] active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 opacity-40" />
                <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-1/3 bg-gradient-to-r from-white/40 via-white/80 to-transparent translate-x-[-120%] group-hover:animate-[sweep_1.4s_ease-out_forwards] animate-[sweep_3s_ease-out_infinite]" />

                <div className="btn-orbit-ring">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="btn-orbit-dot"
                      style={{
                        animation: `spin-orbit 6s linear infinite`,
                        animationDelay: `${i * 0.6}s`,
                        transformOrigin: "50px 50%",
                      }}
                    />
                  ))}
                </div>

                <Play className="relative w-4 h-4 md:w-5 md:h-5 fill-slate-900" />
                <span className="relative uppercase tracking-[0.24em]">
                  Play Arcade
                </span>
              </button>

              <div className="text-[11px] md:text-xs text-slate-400/80">
                <p className="font-medium uppercase tracking-[0.22em]">
                  Game context ended — play for fun
                </p>
                <p className="mt-1 text-slate-500">
                  Keyboard only • No gas
                </p>
              </div>
            </div>
          </div>

          {/* Right: Animated Worm visual */}
          <div className="flex-1 flex items-center justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md aspect-[4/3]">
              <div className="absolute inset-8 rounded-[32px] bg-[radial-gradient(circle_at_20%_0%,rgba(190,242,100,0.32),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(45,212,191,0.3),transparent_55%)] opacity-80 blur-xl" />

              <AnimatedWorm />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        ref={featuresRef}
        className="relative z-10 w-full max-w-5xl mb-20 grid gap-6 md:grid-cols-3"
      >
        {[
          {
            title: "Play-to-WL",
            body: "Game context ended. Play arcade for fun. Keyboard only - No gas forever 🪱",
          },
          {
            title: "Worm Squad",
            body: "555 unique neon worms. Crowns, shades, wild hair—collect 'em all 😎",
          },
          {
            title: "Seasonal Drops",
            body: "Limited Szn 1 drop. Top combos win rare worms + crowns 🎉",
          },
        ].map((card, i) => (
          <article
            key={card.title}
            className="feature-card relative rounded-2xl border border-lime-300/25 bg-white/5 backdrop-blur-xl px-6 py-7 shadow-[0_0_40px_rgba(132,204,22,0.45)]"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-lime-300/20 opacity-60" />
            <div className="relative space-y-2">
              <h3 className="text-xl font-semibold text-lime-200 tracking-[0.18em] uppercase">
                {card.title}
              </h3>
              <p className="text-base text-slate-100/85">{card.body}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Galerie preview - 3 sneak peeks */}
      <section
        ref={statsRef}
        className="relative z-10 w-full max-w-5xl mb-24 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl px-6 md:px-10 py-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between"
      >
        <div className="space-y-3 max-w-md">
          <p className="text-[11px] uppercase tracking-[0.24em] text-lime-300/80">
            Galerie Preview
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50">
            Sneak peeks from the Abstract Worms collection.
          </h2>
          <p className="text-sm text-slate-300/80">
            Scroll through a few of the juiciest worms, then dive into the full galerie to see the
            rest of the squad.
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => {
              const peek = previewPeeks[i];
              const gradient = PLACEHOLDER_GRADIENTS[i];
              const hiddenThird = i === 2 ? "hidden sm:block" : "";
              if (peek) {
                return (
                  <a
                    key={peek.id}
                    href="/galerie"
                    className={`relative h-20 w-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 ${hiddenThird}`}
                  >
                    <Image
                      src={peek.src}
                      alt={peek.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </a>
                );
              }
              return (
                <div
                  key={i}
                  className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} ${hiddenThird}`}
                />
              );
            })}
          </div>
          <a
            href="/galerie"
            className="inline-flex items-center justify-center px-6 py-2 rounded-full border border-lime-300/60 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-200 hover:bg-lime-300/10 transition-colors"
          >
            View Full Galerie
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={finalCtaRef}
        className="relative z-10 w-full max-w-4xl mb-24 rounded-3xl border border-lime-300/40 bg-gradient-to-r from-lime-300/10 via-emerald-300/10 to-cyan-300/10 backdrop-blur-2xl px-6 md:px-10 py-10 text-center shadow-[0_0_50px_rgba(34,197,94,0.6)]"
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50 mb-4 tracking-[0.22em] uppercase">
          Drop into the Grid
        </h2>
        <p className="text-sm md:text-base text-slate-200/85 max-w-2xl mx-auto mb-6">
          Game context has ended. You can still hit play, dodge yourself, and crown your worm — or
          explore the galerie and stay tuned for the next Abstract Worms drop.
        </p>
        <button
          onClick={() => setGameState("playing")}
          className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-slate-50 text-slate-900 font-semibold text-sm md:text-base tracking-[0.18em] uppercase shadow-[0_0_35px_rgba(226,232,240,0.75)] transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <span className="relative">
            Enter Arcade
            <span className="pointer-events-none absolute -inset-1 rounded-full border border-lime-300/70 opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
          </span>
        </button>
      </section>

      {isWLFormOpen && <WLFormModal onClose={() => setIsWLFormOpen(false)} />}
    </main>
  );
}
