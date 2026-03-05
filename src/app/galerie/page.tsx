import Image from "next/image";
import { getSneakPeeks } from "@/lib/sneakPeeks";

export default function GaleriePage() {
  const sneakPeeks = getSneakPeeks();

  return (
    <main className="relative min-h-screen px-4 pt-20 pb-16 flex flex-col items-center overflow-hidden">
      <section className="relative z-10 w-full max-w-5xl mt-8 mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400/80">
          Collection Sneak Peeks
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-50 tracking-[0.16em]">
          Galerie
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-300/85 max-w-2xl mx-auto">
          A rotating window into the Abstract Worms universe. Early looks at crowns, traits,
          and deep-space scenes from upcoming drops.
        </p>
      </section>

      {sneakPeeks.length === 0 ? (
        <section className="relative z-10 w-full max-w-5xl text-center text-slate-400/80 text-sm">
          No sneak peeks found yet. Drop images into{" "}
          <code className="px-1 py-0.5 rounded bg-slate-900/60 border border-slate-700/70 text-[11px]">
            public/sneek-peeks
          </code>{" "}
          and refresh.
        </section>
      ) : (
        <section className="relative z-10 w-full max-w-5xl grid gap-6 md:grid-cols-3">
          {sneakPeeks.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(15,23,42,0.85)]"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-none"
                />
              </div>
              <div className="px-4 pb-4 pt-2 text-left">
                <h2 className="text-sm font-semibold text-slate-50 tracking-[0.16em] uppercase">
                  {item.title}
                </h2>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

