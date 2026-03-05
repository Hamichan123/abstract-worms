"use client";

import { useEffect, useState } from "react";
import { Twitter, Send, CheckCircle2, RotateCcw, Home } from "lucide-react";

export default function WaitlistModal({
    onRestart,
    onExit
}: {
    onRestart: () => void;
    onExit: () => void;
}) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [formData, setFormData] = useState({
        xLink: "",
        xUsername: "",
        wallet: ""
    });

    // Pre-fill tweet intent
    const tweetText = encodeURIComponent(
        "I just ate 20 items and secured @AbstractWorms waitlist! 🐛👑\n\n#AbstractWorms #Web3Gaming"
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    // Load canvas-confetti via CDN once on the client
    useEffect(() => {
        if (typeof window === "undefined") return;
        if ((window as any).confetti) return;

        const script = document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Keep script for subsequent opens; no cleanup needed
        };
    }, []);

    const triggerConfetti = () => {
        if (typeof window === "undefined") return;
        const confetti = (window as any).confetti;
        if (!confetti) return;

        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 }
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 }
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("https://sheetdb.io/api/v1/pdomh1fjv7r6t", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: [
                        {
                            // Map existing form fields to Google Sheet columns
                            twitter_handle: formData.xUsername,
                            tweet_url: formData.xLink,
                            wallet: formData.wallet
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error("SheetDB error");
            }

            setIsSubmitted(true);
            triggerConfetti();
        } catch (err) {
            setErrorMessage("Something went wrong. Please try again.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-color-deep-purple-900/80 backdrop-blur-xl animate-in fade-in duration-500">
                <div
                    className={`w-full max-w-md bg-color-deep-purple-800/90 border border-color-cyan-accent/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden ${
                        isShaking ? "aw-modal-shake" : ""
                    }`}
                >
                    {/* Glow Effects */}
                    <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-color-cyan-accent opacity-20 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-color-lime-green opacity-20 blur-[60px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        {!isSubmitted ? (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                                        Victory! 👑
                                    </h2>
                                    <p className="text-color-cyan-accent font-medium">
                                        You've earned your spot! Share your achievement to join the waitlist.
                                    </p>
                                </div>

                                <a
                                    href={tweetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#1DA1F2]/50 hover:-translate-y-1 mb-6"
                                >
                                    <Twitter className="w-5 h-5 fill-current" />
                                    Tweet Achievement
                                </a>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-white/80 mb-1 ml-1">
                                            Twitter (X) Post Link
                                        </label>
                                        <input
                                            required
                                            type="url"
                                            placeholder="https://x.com/..."
                                            className="w-full bg-color-deep-purple-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-color-lime-green focus:ring-1 focus:ring-color-lime-green transition-all"
                                            value={formData.xLink}
                                            onChange={(e) =>
                                                setFormData({ ...formData, xLink: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/80 mb-1 ml-1">
                                            X Username
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="@username"
                                            className="w-full bg-color-deep-purple-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-color-lime-green focus:ring-1 focus:ring-color-lime-green transition-all"
                                            value={formData.xUsername}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    xUsername: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/80 mb-1 ml-1">
                                            Crypto Wallet Address
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="0x..."
                                            className="w-full bg-color-deep-purple-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-color-lime-green focus:ring-1 focus:ring-color-lime-green transition-all"
                                            value={formData.wallet}
                                            onChange={(e) =>
                                                setFormData({ ...formData, wallet: e.target.value })
                                            }
                                        />
                                    </div>

                                    {errorMessage && (
                                        <p className="text-sm text-red-300 font-medium mt-2">
                                            {errorMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-4 px-4 bg-color-lime-green hover:bg-[#8ee015] text-color-deep-purple-900 rounded-xl font-extrabold text-lg transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        {isSubmitting ? "Submitting..." : "Submit to Waitlist"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-6">
                                    <CheckCircle2 className="w-20 h-20 text-color-lime-green drop-shadow-[0_0_15px_rgba(163,230,53,0.5)]" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                                    Wormlist secured 🎉
                                </h2>
                                <p className="text-color-cyan-accent font-medium mb-8">
                                    Your Abstract Worms whitelist spot is secured. Keep an eye on X for the next
                                    drops and updates.
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={onRestart}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-white/30"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Play Again
                                    </button>
                                    <button
                                        onClick={onExit}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-color-deep-purple-600 hover:bg-color-deep-purple-500 text-white rounded-xl font-bold transition-all shadow-lg"
                                    >
                                        <Home className="w-4 h-4" />
                                        Lobby
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes aw-modal-shake-keyframes {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    20% {
                        transform: translateX(-4px);
                    }
                    40% {
                        transform: translateX(4px);
                    }
                    60% {
                        transform: translateX(-4px);
                    }
                    80% {
                        transform: translateX(4px);
                    }
                }

                .aw-modal-shake {
                    animation: aw-modal-shake-keyframes 0.4s ease;
                }
            `}</style>
        </>
    );
}
