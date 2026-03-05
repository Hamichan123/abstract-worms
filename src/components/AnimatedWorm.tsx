"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedWorm() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wormRef = useRef<HTMLImageElement | null>(null);
    const crownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current || !wormRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Intro spin + bounce
            tl.from(containerRef.current, {
                opacity: 0,
                y: 40,
                scale: 0.85,
                rotate: -20,
                duration: 1.2
            }).to(
                containerRef.current,
                {
                    rotate: 0,
                    y: 0,
                    scale: 1,
                    ease: "elastic.out(1, 0.7)",
                    duration: 1.4
                },
                "<"
            );

            // Idle float / undulate
            gsap.to(wormRef.current, {
                y: -12,
                duration: 3.2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // Crown sparkle pulse
            if (crownRef.current) {
                gsap.to(crownRef.current, {
                    filter: "drop-shadow(0 0 18px rgba(250,204,21,0.95))",
                    scale: 1.12,
                    duration: 1.6,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });
            }

            // Mouse parallax / slight tilt
            const handleMove = (e: MouseEvent) => {
                const bounds = containerRef.current!.getBoundingClientRect();
                const cx = bounds.left + bounds.width / 2;
                const cy = bounds.top + bounds.height / 2;
                const dx = (e.clientX - cx) / bounds.width;
                const dy = (e.clientY - cy) / bounds.height;

                gsap.to(containerRef.current, {
                    rotateY: dx * 10,
                    rotateX: -dy * 6,
                    duration: 0.5,
                    ease: "sine.out",
                    transformPerspective: 800
                });
            };

            window.addEventListener("mousemove", handleMove);

            return () => {
                window.removeEventListener("mousemove", handleMove);
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative h-full rounded-[32px] border border-white/10 bg-slate-950/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] flex items-center justify-center overflow-hidden will-change-transform"
        >
            {/* Subtle inner nebula */}
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_0%,rgba(190,242,100,0.22),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(56,189,248,0.24),transparent_60%)]" />

            {/* Crown overlay */}
            <div
                ref={crownRef}
                className="pointer-events-none absolute top-[18%] left-1/2 -translate-x-1/2 w-12 h-12"
            >
                <div className="w-full h-full bg-[conic-gradient(from_220deg_at_50%_20%,#fef08a,#facc15,#f97316,#fde68a,#facc15)] rounded-b-[40%] rounded-t-[999px] shadow-[0_0_22px_rgba(250,204,21,0.8)]" />
            </div>

            {/* Worm image */}
            <img
                ref={wormRef}
                src="/worm.png"
                alt="Abstract Worm"
                className="relative h-[72%] object-contain drop-shadow-[0_24px_40px_rgba(190,242,100,0.65)] will-change-transform"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />

            {/* Ground shadow */}
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 w-[56%] h-8 rounded-[999px] bg-black/70 blur-2xl opacity-80" />
        </div>
    );
}

