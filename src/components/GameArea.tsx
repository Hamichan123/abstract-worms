"use client";

import { useEffect, useRef, useState } from "react";
import WaitlistModal from "./WaitlistModal";

const TILE_SIZE = 30;
const GRID_WIDTH = 25; // number of tiles
const GRID_HEIGHT = 20;

type Point = { x: number; y: number };

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
};

export default function GameArea({ onExit }: { onExit: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const WIN_SCORE = 10;

    // Game state refs (to avoid relying on React re-renders in the loop)
    const snakeRef = useRef<Point[]>([
        { x: 12, y: 10 },
        { x: 12, y: 11 },
        { x: 12, y: 12 }
    ]);
    const directionRef = useRef<Point>({ x: 0, y: -1 }); // Default moving UP
    const nextDirectionRef = useRef<Point>({ x: 0, y: -1 });
    const appleRef = useRef<Point>({ x: 5, y: 5 });
    const speedRef = useRef<number>(220); // ms per step (higher = slower)

    const lastUpdateRef = useRef<number>(0);
    const requestRef = useRef<number>(0);
    const headImageRef = useRef<HTMLImageElement | null>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const eatAnimationRef = useRef<{ x: number; y: number; progress: number } | null>(null);
    const turnAnimationRef = useRef<number>(0);
    const lastDirectionVisualRef = useRef<Point>({ x: 0, y: -1 });
    const accelerateHeldRef = useRef<boolean>(false);
    const previousSnakeRef = useRef<Point[]>([
        { x: 12, y: 10 },
        { x: 12, y: 11 },
        { x: 12, y: 12 }
    ]);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playEatSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.05);
            osc.type = "sine";
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } catch (_) {}
    };

    const playVictorySound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(freq, now);
                osc.type = "sine";
                const start = now + i * 0.12;
                const end = start + 0.2;
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, end);
                osc.start(start);
                osc.stop(end);
            });
        } catch (_) {}
    };

    // Initialize image once
    useEffect(() => {
        const img = new Image();
        img.src = "/wormhead.png";
        img.onload = () => {
            headImageRef.current = img;
        };
    }, []);

    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const drawSnakeSegment = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        wobbleOffset: number
    ) => {
        const cx = x * TILE_SIZE + TILE_SIZE / 2;
        const cy = y * TILE_SIZE + TILE_SIZE / 2 + wobbleOffset;

        const gradient = ctx.createRadialGradient(
            cx - radius / 3,
            cy - radius / 3,
            radius / 4,
            cx,
            cy,
            radius
        );
        gradient.addColorStop(0, "#ecfccb");
        gradient.addColorStop(0.35, "#bef264");
        gradient.addColorStop(0.7, "#22c55e");
        gradient.addColorStop(1, "#22d3ee");

        ctx.save();
        ctx.shadowColor = "rgba(190, 242, 100, 0.6)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 1.1, radius, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const drawSnakeHead = (
        ctx: CanvasRenderingContext2D,
        head: Point,
        direction: Point,
        wobbleOffset: number,
        turnFlashStrength: number
    ) => {
        const baseX = head.x * TILE_SIZE + TILE_SIZE / 2;
        const baseY = head.y * TILE_SIZE + TILE_SIZE / 2 + wobbleOffset;

        ctx.save();
        ctx.translate(baseX, baseY);

        let angle = 0;
        if (direction.x === 1) angle = Math.PI / 2;
        if (direction.x === -1) angle = -Math.PI / 2;
        if (direction.y === 1) angle = Math.PI;
        if (direction.y === -1) angle = 0;
        ctx.rotate(angle);

        const scale = 1 + 0.12 * turnFlashStrength;
        ctx.scale(scale, scale);

        if (headImageRef.current) {
            ctx.shadowColor = "rgba(190, 242, 100, 0.7)";
            ctx.shadowBlur = 18;
            ctx.drawImage(
                headImageRef.current,
                -TILE_SIZE / 1.2,
                -TILE_SIZE / 1.2,
                TILE_SIZE * 1.6,
                TILE_SIZE * 1.6
            );
        } else {
            const radius = TILE_SIZE / 2;
            const gradient = ctx.createRadialGradient(
                -radius / 3,
                -radius / 3,
                radius / 4,
                0,
                0,
                radius
            );
            gradient.addColorStop(0, "#ecfccb");
            gradient.addColorStop(0.4, "#bef264");
            gradient.addColorStop(1, "#16a34a");

            ctx.shadowColor = "rgba(190, 242, 100, 0.7)";
            ctx.shadowBlur = 18;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 1.1, radius, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#0f172a";
            const eyeOffsetX = radius * 0.25;
            const eyeOffsetY = -radius * 0.1;
            ctx.beginPath();
            ctx.arc(-eyeOffsetX, eyeOffsetY, radius * 0.16, 0, Math.PI * 2);
            ctx.arc(eyeOffsetX, eyeOffsetY, radius * 0.16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fefce8";
            ctx.beginPath();
            ctx.arc(-eyeOffsetX - radius * 0.03, eyeOffsetY - radius * 0.04, radius * 0.07, 0, Math.PI * 2);
            ctx.arc(eyeOffsetX - radius * 0.03, eyeOffsetY - radius * 0.04, radius * 0.07, 0, Math.PI * 2);
            ctx.fill();

            // Crown
            ctx.save();
            ctx.translate(0, -radius * 1.1);
            ctx.scale(0.9, 0.9);
            ctx.beginPath();
            ctx.moveTo(-radius * 0.7, 0);
            ctx.lineTo(-radius * 0.3, -radius * 0.9);
            ctx.lineTo(0, -radius * 0.4);
            ctx.lineTo(radius * 0.3, -radius * 0.9);
            ctx.lineTo(radius * 0.7, 0);
            ctx.closePath();
            ctx.fillStyle = "#facc15";
            ctx.shadowColor = "rgba(250, 204, 21, 0.8)";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    };

    const drawApple = (ctx: CanvasRenderingContext2D, time: number) => {
        const apple = appleRef.current;
        const cx = apple.x * TILE_SIZE + TILE_SIZE / 2;
        const cy = apple.y * TILE_SIZE + TILE_SIZE / 2;

        const pulse = 0.08 * Math.sin(time / 200) + 1;
        const baseRadius = TILE_SIZE / 2.6;
        const radius = baseRadius * pulse;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1.05, 1.15);

        ctx.shadowColor = "rgba(248, 113, 113, 0.9)";
        ctx.shadowBlur = 22;

        const gradient = ctx.createRadialGradient(
            -radius * 0.4,
            -radius * 0.4,
            radius * 0.2,
            0,
            0,
            radius * 1.2
        );
        gradient.addColorStop(0, "#fee2e2");
        gradient.addColorStop(0.2, "#fecaca");
        gradient.addColorStop(0.55, "#ef4444");
        gradient.addColorStop(1, "#991b1b");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-radius, 0);
        ctx.bezierCurveTo(-radius, -radius, 0, -radius * 1.3, 0, -radius * 0.2);
        ctx.bezierCurveTo(0, -radius * 1.3, radius, -radius, radius, 0);
        ctx.bezierCurveTo(radius, radius * 1.1, 0, radius * 1.4, 0, radius);
        ctx.bezierCurveTo(0, radius * 1.4, -radius, radius * 1.1, -radius, 0);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(254, 249, 195, 0.85)";
        ctx.beginPath();
        ctx.ellipse(-radius * 0.35, -radius * 0.15, radius * 0.25, radius * 0.18, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = "#431407";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.9);
        ctx.quadraticCurveTo(radius * 0.1, -radius * 1.3, radius * 0.3, -radius * 1.1);
        ctx.stroke();

        // Leaf
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.moveTo(radius * 0.3, -radius * 1.05);
        ctx.quadraticCurveTo(radius * 0.9, -radius * 1.1, radius * 0.7, -radius * 0.6);
        ctx.quadraticCurveTo(radius * 0.4, -radius * 0.6, radius * 0.3, -radius * 1.05);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, dt: number) => {
        if (!dt) return;
        const particles = particlesRef.current;
        if (!particles.length) return;

        const next: Particle[] = [];
        for (const p of particles) {
            const lifeRatio = p.life / p.maxLife;
            const eased = easeInOutSine(1 - lifeRatio);

            const nx = p.x + p.vx * dt * 0.001;
            const ny = p.y + p.vy * dt * 0.001 + eased * 0.02;

            p.x = nx;
            p.y = ny;
            p.life -= dt;
            if (p.life <= 0) continue;

            const alpha = Math.max(0, lifeRatio);
            const radius = (TILE_SIZE / 5) * (0.4 + 0.6 * eased);

            ctx.save();
            ctx.globalAlpha = alpha;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
            gradient.addColorStop(0, "rgba(250, 250, 250, 1)");
            gradient.addColorStop(0.4, "rgba(253, 224, 71, 1)");
            gradient.addColorStop(1, "rgba(250, 204, 21, 0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            next.push(p);
        }
        particlesRef.current = next;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const tagName = target?.tagName;
            const isTypingElement =
                tagName === "INPUT" ||
                tagName === "TEXTAREA" ||
                target?.isContentEditable;

            // Don't hijack keyboard when the user is typing in the victory modal / any input
            if (isTypingElement) return;

            const dir = directionRef.current;

            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    e.preventDefault();
                    if (dir.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    e.preventDefault();
                    if (dir.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    e.preventDefault();
                    if (dir.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    e.preventDefault();
                    if (dir.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
                    break;
                case " ":
                    e.preventDefault();
                    accelerateHeldRef.current = true;
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === " ") {
                accelerateHeldRef.current = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const spawnApple = (snake: Point[]) => {
        let newApple: Point;
        while (true) {
            newApple = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            // Check if apple spawned on snake
            if (!snake.some(segment => segment.x === newApple.x && segment.y === newApple.y)) {
                break;
            }
        }
        appleRef.current = newApple;
    };

    const draw = (ctx: CanvasRenderingContext2D, time: number) => {
        const width = GRID_WIDTH * TILE_SIZE;
        const height = GRID_HEIGHT * TILE_SIZE;

        const dt = lastFrameTimeRef.current ? time - lastFrameTimeRef.current : 0;
        lastFrameTimeRef.current = time;

        ctx.clearRect(0, 0, width, height);

        // Background gradient (space/night style)
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#020617");
        bgGradient.addColorStop(0.45, "#1e1b4b");
        bgGradient.addColorStop(1, "#020617");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Soft vignette
        const vignette = ctx.createRadialGradient(
            width / 2,
            height / 3,
            width / 4,
            width / 2,
            height / 2,
            (width * 3) / 4
        );
        vignette.addColorStop(0, "rgba(15,23,42,0)");
        vignette.addColorStop(1, "rgba(15,23,42,0.7)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Apple & particles
        drawApple(ctx, time);
        updateAndDrawParticles(ctx, dt);

        const snake = snakeRef.current;

        const stepDuration = accelerateHeldRef.current
            ? Math.max(70, speedRef.current * 0.55)
            : speedRef.current;
        const t = Math.min(1, Math.max(0, (time - lastUpdateRef.current) / stepDuration));
        const easedT = easeInOutSine(t);

        const wobbleAmplitude = 2;
        const wobbleSpeed = 500;

        // Body segments
        for (let i = snake.length - 1; i > 0; i--) {
            const segment = snake[i];
            const previous = previousSnakeRef.current[i] ?? segment;
            const ix = previous.x + (segment.x - previous.x) * easedT;
            const iy = previous.y + (segment.y - previous.y) * easedT;

            const wobblePhase = time / wobbleSpeed + i * 0.4;
            const wobbleOffset = Math.sin(wobblePhase) * wobbleAmplitude;

            const radius = (TILE_SIZE / 2) - 3;
            drawSnakeSegment(ctx, ix, iy, radius, wobbleOffset);
        }

        // Head
        const head = snake[0];
        const previousHead = previousSnakeRef.current[0] ?? head;
        const headX = previousHead.x + (head.x - previousHead.x) * easedT;
        const headY = previousHead.y + (head.y - previousHead.y) * easedT;

        const wobbleHeadPhase = time / wobbleSpeed;
        const wobbleHeadOffset = Math.sin(wobbleHeadPhase) * wobbleAmplitude;

        const dir = lastDirectionVisualRef.current;
        const turnStrength = easeInOutSine(Math.min(1, turnAnimationRef.current));
        drawSnakeHead(ctx, { x: headX, y: headY }, dir, wobbleHeadOffset, turnStrength);

        // Eat animation overlay at last apple position
        const eatAnim = eatAnimationRef.current;
        if (eatAnim) {
            eatAnim.progress = Math.min(1, eatAnim.progress + dt / 180);
            const p = eatAnim.progress;
            const scale = 1 + 0.8 * Math.sin(p * Math.PI);
            const alpha = 1 - p;

            const cx = eatAnim.x * TILE_SIZE + TILE_SIZE / 2;
            const cy = eatAnim.y * TILE_SIZE + TILE_SIZE / 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha;
            ctx.shadowColor = "rgba(250, 250, 250, 0.9)";
            ctx.shadowBlur = 24;

            const radius = TILE_SIZE / 3;
            const gradient = ctx.createRadialGradient(0, -radius * 0.3, radius * 0.2, 0, 0, radius);
            gradient.addColorStop(0, "#fefce8");
            gradient.addColorStop(0.3, "#fde68a");
            gradient.addColorStop(1, "#f59e0b");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            if (p >= 1) {
                eatAnimationRef.current = null;
            }
        }
    };

    const update = (time: number) => {
        if (score >= WIN_SCORE) return; // Stop if won

        const effectiveSpeed = accelerateHeldRef.current
            ? Math.max(70, speedRef.current * 0.55)
            : speedRef.current;
        if (time - lastUpdateRef.current > effectiveSpeed) {
            const previousSnake = [...snakeRef.current];
            previousSnakeRef.current = previousSnake;

            const dir = nextDirectionRef.current;
            const prevDir = directionRef.current;
            directionRef.current = dir;
            lastDirectionVisualRef.current = dir;

            if (prevDir.x !== dir.x || prevDir.y !== dir.y) {
                turnAnimationRef.current = 1;
            } else if (turnAnimationRef.current > 0) {
                turnAnimationRef.current = Math.max(0, turnAnimationRef.current - (time - lastUpdateRef.current) / 240);
            }

            const head = snakeRef.current[0];
            const newHead = { x: head.x + dir.x, y: head.y + dir.y };

            // Wall collision -> game over (reset)
            if (
                newHead.x < 0 ||
                newHead.x >= GRID_WIDTH ||
                newHead.y < 0 ||
                newHead.y >= GRID_HEIGHT
            ) {
                snakeRef.current = [
                    { x: 12, y: 10 },
                    { x: 12, y: 11 },
                    { x: 12, y: 12 }
                ];
                directionRef.current = { x: 0, y: -1 };
                nextDirectionRef.current = { x: 0, y: -1 };
                lastDirectionVisualRef.current = { x: 0, y: -1 };
                previousSnakeRef.current = [
                    { x: 12, y: 10 },
                    { x: 12, y: 11 },
                    { x: 12, y: 12 }
                ];
                particlesRef.current = [];
                eatAnimationRef.current = null;
                setScore(0);
                lastUpdateRef.current = time;
                requestRef.current = requestAnimationFrame(update);
                return;
            }

            // Self Collision Check
            if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                // Simple restart on death
                snakeRef.current = [
                    { x: 12, y: 10 },
                    { x: 12, y: 11 },
                    { x: 12, y: 12 }
                ];
                directionRef.current = { x: 0, y: -1 };
                nextDirectionRef.current = { x: 0, y: -1 };
                lastDirectionVisualRef.current = { x: 0, y: -1 };
                previousSnakeRef.current = [
                    { x: 12, y: 10 },
                    { x: 12, y: 11 },
                    { x: 12, y: 12 }
                ];
                particlesRef.current = [];
                eatAnimationRef.current = null;
                setScore(0);
                lastUpdateRef.current = time;
                requestRef.current = requestAnimationFrame(update);
                return;
            }

            const newSnake = [newHead, ...snakeRef.current];

            // Apple Collision
            if (newHead.x === appleRef.current.x && newHead.y === appleRef.current.y) {
                setScore(s => {
                    const next = s + 1;
                    if (next >= WIN_SCORE) playVictorySound();
                    return next;
                });
                playEatSound();

                const appleGridX = appleRef.current.x;
                const appleGridY = appleRef.current.y;
                const centerX = appleGridX * TILE_SIZE + TILE_SIZE / 2;
                const centerY = appleGridY * TILE_SIZE + TILE_SIZE / 2;

                const particleCount = 10;
                const particles: Particle[] = [];
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
                    const speed = 70 + Math.random() * 70;
                    particles.push({
                        x: centerX,
                        y: centerY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 20,
                        life: 260 + Math.random() * 160,
                        maxLife: 260 + Math.random() * 160
                    });
                }
                particlesRef.current = [...particlesRef.current, ...particles];
                eatAnimationRef.current = { x: appleGridX, y: appleGridY, progress: 0 };

                spawnApple(newSnake);
                // Increase speed by 20% per apple (20 per 100)
                speedRef.current = Math.max(90, speedRef.current * 0.8);
            } else {
                newSnake.pop(); // Remove tail
            }

            snakeRef.current = newSnake;
            lastUpdateRef.current = time;
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) draw(ctx, time);
        }

        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [score]); // Restart anim loop dependency on score correctly (if it hit 10)

    return (
        <div className="relative w-full min-h-screen bg-color-deep-purple-900 overflow-hidden text-color-foreground flex">
            {/* Instructions - left of game */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-sm p-6 gap-4">
                <h3 className="text-sm font-bold tracking-widest uppercase text-lime-300/90 border-b border-white/10 pb-2">
                    How to play
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <li><span className="text-lime-400 font-medium">Steer</span> — W-A-S-D or Arrow keys</li>
                    <li><span className="text-lime-400 font-medium">Speed up</span> — Hold Space</li>
                    <li><span className="text-lime-400 font-medium">Goal</span> — Eat 10 apples (game context ended — play for fun)</li>
                    <li><span className="text-amber-400/90 font-medium">Avoid</span> — Walls and your own tail</li>
                </ul>
            </aside>

            {/* Game area */}
            <div className="relative flex-1 flex items-center justify-center min-h-screen">
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-4">
                <button
                    onClick={onExit}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all border border-white/20 text-white"
                >
                    Exit to Lobby
                </button>
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex w-full max-w-xl flex-col items-center gap-3">
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(163,230,53,0.35)]">
                    <div
                        className="h-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 transition-[width] duration-200 ease-out"
                        style={{ width: `${Math.min(1, score / WIN_SCORE) * 100}%` }}
                    />
                </div>
                <div className="pointer-events-none bg-black/50 px-6 py-1.5 rounded-full backdrop-blur-sm text-xs md:text-sm font-medium tracking-widest uppercase text-white shadow-lg">
                    W-A-S-D or Arrows to steer · Hold Space to accelerate
                </div>
            </div>

            {/* 2D Canvas */}
            <div className="relative shadow-[0_0_50px_rgba(34,211,238,0.2)] border-4 border-color-deep-purple-600 rounded-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={GRID_WIDTH * TILE_SIZE}
                    height={GRID_HEIGHT * TILE_SIZE}
                    className="bg-color-deep-purple-800 touch-none"
                />
            </div>

            {/* Victory Modal */}
            {score >= WIN_SCORE && (
                <WaitlistModal onRestart={() => {
                    snakeRef.current = [
                        { x: 12, y: 10 },
                        { x: 12, y: 11 },
                        { x: 12, y: 12 }
                    ];
                    directionRef.current = { x: 0, y: -1 };
                    nextDirectionRef.current = { x: 0, y: -1 };
                    speedRef.current = 220;
                    setScore(0);
                }} onExit={onExit} />
            )}
            </div>
        </div>
    );
}
