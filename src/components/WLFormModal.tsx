"use client";

import { useEffect, useState } from "react";
import { Twitter, Send, CheckCircle2, X } from "lucide-react";

export default function WLFormModal({
    onClose
}: {
    onClose: () => void;
}) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [formData, setFormData] = useState({
        xUsername: "",
        xCommentLink: "",
        wallet: "",
        tasksCompleted: false
    });
    const [captcha, setCaptcha] = useState<{ a: number; b: number; answer: number } | null>(null);
    const [captchaInput, setCaptchaInput] = useState("");

    // Load canvas-confetti via CDN once on the client
    useEffect(() => {
        if (typeof window === "undefined") return;
        if ((window as any).confetti) return;

        const script = document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const generateCaptcha = () => {
        const a = 1 + Math.floor(Math.random() * 9);
        const b = 1 + Math.floor(Math.random() * 9);
        setCaptcha({ a, b, answer: a + b });
        setCaptchaInput("");
    };

    useEffect(() => {
        generateCaptcha();
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

        if (!formData.tasksCompleted) {
            setErrorMessage("Please complete and confirm the X tasks.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
            return;
        }

        if (!captcha) {
            generateCaptcha();
            setErrorMessage("Please solve the captcha and try again.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
            return;
        }

        const userAnswer = parseInt(captchaInput.trim(), 10);
        if (Number.isNaN(userAnswer) || userAnswer !== captcha.answer) {
            setErrorMessage("Captcha answer is incorrect. Please try again.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
            generateCaptcha();
            return;
        }

        setIsSubmitting(true);

        try {
            // Using Google Apps Script Web App to bypass limits
            await fetch("https://script.google.com/macros/s/AKfycbx492ZZdL-92SZeiqS87zSQVm1K453Pe6z-N-4wgcDpsxohVaZPP7y3z65ZJMM_kS09/exec", {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: JSON.stringify({
                    data: [
                        {
                            timestamp: new Date().toISOString(),
                            xusername: formData.xUsername,
                            tweet: formData.xCommentLink,
                            wallet: formData.wallet
                        }
                    ]
                })
            });

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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
                {/* WORM THEMED CONTAINER */}
                <div
                    className={`relative w-full max-w-lg mt-10 mb-10 bg-slate-900 border-4 border-lime-300/50 rounded-[64px] rounded-br-[120px] rounded-tl-[120px] p-8 shadow-[0_0_80px_rgba(132,204,22,0.3)] transition-transform ${isShaking ? "aw-modal-shake" : ""
                        }`}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-8 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full p-2 hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Worm image peeking out */}
                    <div className="absolute -top-16 -left-10 w-32 h-32 pointer-events-none drop-shadow-[0_10px_20px_rgba(163,230,53,0.4)] hidden sm:block">
                        <img src="/worm.png" alt="Worm" className="w-full h-full object-contain -rotate-12" />
                    </div>

                    <div className="relative z-10 pt-4">
                        {!isSubmitted ? (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold text-lime-300 mb-2 tracking-tight uppercase">
                                        Join the Worm Squad
                                    </h2>
                                    <p className="text-slate-300 font-medium">
                                        Complete the tasks below to apply for the Waitlist. Don't miss out! 🪱
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {!isUnlocked ? (
                                        <div className="flex flex-col items-center justify-center py-2 space-y-4">
                                            <div className="bg-[#1DA1F2]/10 p-6 rounded-3xl border border-[#1DA1F2]/30 text-center space-y-4 w-full">
                                                <Twitter className="w-10 h-10 text-[#1DA1F2] mx-auto mb-2 drop-shadow-[0_0_15px_rgba(29,161,242,0.5)]" />
                                                <h3 className="text-xl font-bold text-white">Step 1: Unlock Form</h3>
                                                <p className="text-sm text-slate-300 mb-4 px-2">
                                                    You must visit our official tweet to Like, Retweet, and Comment before you can fill out this form.
                                                </p>
                                                <a
                                                    href="https://x.com/AbstractWorms/status/2031608713165799441?s=20"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setIsUnlocked(true)}
                                                    className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-2xl font-bold transition-all w-full shadow-[0_0_15px_rgba(29,161,242,0.3)] hover:shadow-[0_0_25px_rgba(29,161,242,0.5)] active:scale-95"
                                                >
                                                    Go to Tweet to Unlock
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Task List */}
                                            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-3">
                                                <h3 className="text-white font-bold flex items-center gap-2">
                                                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                                                    Required Tasks
                                                </h3>
                                                <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                                    <li>Like & Retweet our pinned tweet</li>
                                                    <li>Turn on notifications for our account</li>
                                                    <li>Drop a comment on our tweet</li>
                                                </ul>
                                                <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            required
                                                            className="peer appearance-none w-6 h-6 border-2 border-lime-300 rounded-lg bg-transparent checked:bg-lime-300 checked:border-lime-300 transition-all"
                                                            checked={formData.tasksCompleted}
                                                            onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.checked })}
                                                        />
                                                        <CheckCircle2 className="absolute w-4 h-4 text-slate-900 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-white group-hover:text-lime-200 transition-colors">
                                                        I confirm I have completed the tasks
                                                    </span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-lime-200 mb-1 ml-2">
                                                    X (Twitter) Username
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="@username"
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300 transition-all font-medium"
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
                                                <label className="block text-sm font-semibold text-lime-200 mb-1 ml-2">
                                                    Comment Link (Proof)
                                                </label>
                                                <input
                                                    required
                                                    type="url"
                                                    placeholder="https://x.com/..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300 transition-all font-medium"
                                                    value={formData.xCommentLink}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, xCommentLink: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-lime-200 mb-1 ml-2">
                                                    Crypto Wallet Address
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="0x..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300 transition-all font-medium"
                                                    value={formData.wallet}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, wallet: e.target.value })
                                                    }
                                                />
                                            </div>

                                            {captcha && (
                                                <div className="bg-lime-900/20 p-4 rounded-3xl border border-lime-300/20 flex flex-col sm:flex-row items-center gap-4 justify-between">
                                                    <div className="flex flex-col">
                                                        <label className="text-sm font-semibold text-lime-200">
                                                            Anti-Bot Verification
                                                        </label>
                                                        <span className="text-sm text-slate-300 mt-1">
                                                            Solve: {captcha.a} + {captcha.b} = ?
                                                        </span>
                                                    </div>
                                                    <input
                                                        required
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        placeholder="Answer"
                                                        className="w-full sm:w-24 bg-black/60 border border-lime-300/50 rounded-2xl px-3 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-300 transition-all text-center font-bold text-lg"
                                                        value={captchaInput}
                                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {errorMessage && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                                                    <p className="text-sm text-red-400 font-medium text-center">
                                                        {errorMessage}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full mt-4 flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 rounded-3xl font-extrabold text-lg transition-all shadow-[0_0_25px_rgba(163,230,53,0.4)] hover:shadow-[0_0_40px_rgba(163,230,53,0.7)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wider overflow-hidden relative group"
                                            >
                                                <span className="absolute inset-0 w-full h-full bg-white/30 translate-x-[-100%] group-hover:animate-[sweep_1s_ease-out_forwards]" />
                                                <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                                                <span className="relative z-10">{isSubmitting ? "Wiggling..." : "Apply to WL"}</span>
                                            </button>
                                        </>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-lime-400 blur-2xl opacity-40 rounded-full" />
                                        <CheckCircle2 className="relative w-24 h-24 text-lime-400" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight uppercase">
                                    You're In! 🎉
                                </h2>
                                <p className="text-lime-200 font-medium mb-10 text-lg">
                                    Your application has been received. Keep an eye on your X notifications for updates!
                                </p>

                                <button
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-slate-200 text-slate-900 rounded-3xl font-extrabold text-lg transition-all shadow-lg uppercase tracking-wider"
                                >
                                    Close Window
                                </button>
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
                        transform: translateX(-6px) rotate(-1deg);
                    }
                    40% {
                        transform: translateX(6px) rotate(1deg);
                    }
                    60% {
                        transform: translateX(-6px) rotate(-1deg);
                    }
                    80% {
                        transform: translateX(6px) rotate(1deg);
                    }
                }

                .aw-modal-shake {
                    animation: aw-modal-shake-keyframes 0.4s ease;
                }
            `}</style>
        </>
    );
}
