import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const INTERESTS = [
    "Fine Dining",
    "Sailing",
    "Horology",
    "Crypto",
    "Arts",
    "Tech",
    "Travel",
    "Concierge",
    "Private Aviation",
    "Opera",
    "Architecture",
    "History",
    "Golf",
    "Polo",
    "Skiing",
    "Startups",
    "Wine",
];

export default function InterestsPage() {
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([
        "Fine Dining",
        "Sailing",
        "Horology",
        "Crypto",
    ]);

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleContinue = () => {
        // Navigate to next step (Review)
        navigate("/onboarding/review");
    };

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden flex flex-col items-center">
            <div className="relative flex h-full min-h-[100dvh] w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
                {/* Top Navigation Area */}
                <div className="flex items-center justify-between p-4 pt-6 pb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-900 dark:text-white">
                            arrow_back
                        </span>
                    </button>
                    <div className="flex-1"></div>
                    <button className="text-sm font-semibold text-[#f2b90d] hover:opacity-80 transition-opacity">
                        Skip
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                            className="h-1.5 rounded-full bg-[#f2b90d] transition-all duration-500 ease-out"
                            style={{ width: "80%" }}
                        ></div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500 dark:text-white/40 text-right">
                        Step 4 of 5
                    </p>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
                    {/* Headers */}
                    <div className="pt-4 pb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3 text-slate-900 dark:text-white">
                            Your <span className="text-[#f2b90d]">Interests</span>
                        </h1>
                        <p className="text-base text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                            Curate your experience. Select at least 3 topics that define your
                            lifestyle to personalize your feed.
                        </p>
                    </div>

                    {/* Interest Chips Grid */}
                    <div className="flex flex-wrap gap-3 pb-8">
                        {INTERESTS.map((interest) => {
                            const isSelected = selectedInterests.includes(interest);
                            return (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={cn(
                                        "group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95",
                                        isSelected
                                            ? "bg-[#f2b90d]"
                                            : "bg-white border border-slate-200 dark:border-white/10 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isSelected
                                                ? "text-background-dark font-semibold"
                                                : "text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white"
                                        )}
                                    >
                                        {interest}
                                    </span>
                                    <span
                                        className={cn(
                                            "material-symbols-outlined text-[18px]",
                                            isSelected
                                                ? "text-background-dark"
                                                : "text-slate-400 dark:text-white/40 group-hover:text-[#f2b90d] transition-colors"
                                        )}
                                    >
                                        {isSelected ? "check" : "add"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent z-10 pt-16">
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 h-14 rounded-full border border-slate-300 dark:border-white/10 bg-transparent text-slate-900 dark:text-white font-bold text-base hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleContinue}
                            className="flex-[2] h-14 rounded-full bg-[#f2b90d] text-background-dark font-bold text-base hover:bg-[#f2b90d]/90 transition-colors shadow-[0_0_20px_rgba(242,185,13,0.3)]"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
