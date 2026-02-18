import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const GOALS = [
    {
        id: "network",
        title: "Expand My Network",
        description: "Connect with professionals",
        icon: "groups",
    },
    {
        id: "social",
        title: "Attend Social Events",
        description: "Parties, mixers & more",
        icon: "celebration",
    },
    {
        id: "dating",
        title: "Find a Partner",
        description: "Slow dating approach",
        icon: "favorite",
    },
    {
        id: "business",
        title: "Business Synergy",
        description: "Partnerships & deals",
        icon: "handshake",
    },
];

export default function GoalsPage() {
    const navigate = useNavigate();
    const [selectedGoals, setSelectedGoals] = useState<string[]>(["social"]);

    const toggleGoal = (goalId: string) => {
        setSelectedGoals((prev) =>
            prev.includes(goalId)
                ? prev.filter((id) => id !== goalId)
                : [...prev, goalId]
        );
    };

    const handleContinue = () => {
        // Navigate to next step (Interests - assuming step 4)
        navigate("/onboarding/interests");
    };

    return (
        <div className="min-h-screen w-full bg-[#f6f8f6] dark:bg-[#112115] font-display text-slate-900 dark:text-white overflow-hidden flex flex-col items-center">
            {/* Top Status Bar Area (Spacer) */}
            <div className="h-12 w-full shrink-0"></div>

            {/* Navigation Header */}
            <div className="flex items-center justify-between px-4 pb-2 pt-2 w-full max-w-md">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white hover:text-[#14b83d] transition-colors flex size-10 items-center justify-center rounded-full active:bg-white/10"
                >
                    <span className="material-symbols-outlined text-[24px]">
                        arrow_back_ios_new
                    </span>
                </button>
                <button className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white text-base font-medium leading-normal shrink-0 px-2 py-1 transition-colors">
                    Skip
                </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#14b83d] uppercase tracking-wider">
                        Step 3 of 5
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-white/40">
                        60%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-full bg-[#14b83d] rounded-full transition-all duration-500 ease-out"
                        style={{ width: "60%" }}
                    ></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide w-full max-w-md">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl md:text-[32px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                        What brings you here?
                    </h1>
                    <p className="text-slate-600 dark:text-white/60 text-lg font-normal leading-relaxed">
                        Select all that apply to help us curate your feed.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {GOALS.map((goal) => {
                        const isSelected = selectedGoals.includes(goal.id);
                        return (
                            <div
                                key={goal.id}
                                onClick={() => toggleGoal(goal.id)}
                                className="relative group cursor-pointer"
                            >
                                <div
                                    className={cn(
                                        "flex items-center p-4 rounded-xl border transition-all duration-300 active:scale-[0.98]",
                                        isSelected
                                            ? "bg-[#1a4d2e] border-[#D4AF37]"
                                            : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex items-center justify-center size-12 rounded-full transition-colors mr-4 shrink-0",
                                            isSelected
                                                ? "bg-[rgba(20,184,61,0.2)] text-[#14b83d]"
                                                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/80"
                                        )}
                                    >
                                        <span className="material-symbols-outlined">
                                            {goal.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-slate-900 dark:text-white text-lg font-semibold leading-tight mb-0.5">
                                            {goal.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-white/40 text-sm">
                                            {goal.description}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            "transition-all duration-300 absolute top-4 right-4 text-[#D4AF37]",
                                            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                        )}
                                    >
                                        <span className="material-symbols-outlined fill-1">
                                            check_circle
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#f6f8f6] via-[#f6f8f6]/95 to-transparent dark:from-[#112115] dark:via-[#112115]/95 dark:to-transparent pt-12">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleContinue}
                        className="w-full bg-[#14b83d] hover:bg-[#14b83d]/90 text-white font-bold text-lg h-14 rounded-full shadow-lg shadow-[#14b83d]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        Continue
                        <span className="material-symbols-outlined text-[20px] font-bold">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
