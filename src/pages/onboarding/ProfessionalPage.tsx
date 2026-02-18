import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ProfessionalPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        jobTitle: "",
        company: "",
        industry: "",
    });

    const handleContinue = () => {
        // Navigate to next step (Goals - assuming step 3)
        navigate("/onboarding/goals");
    };

    return (
        <div className="min-h-screen w-full bg-[#f6f8f6] dark:bg-[#102215] font-display text-slate-900 dark:text-white overflow-hidden flex flex-col items-center">
            <header className="flex items-center justify-between p-4 pb-2 sticky top-0 z-10 w-full max-w-md bg-[#f6f8f6]/95 dark:bg-[#102215]/95 backdrop-blur-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-600 dark:text-slate-400 text-sm font-semibold tracking-wide uppercase">
                    Step 2 of 5
                </h2>
                <div className="size-10"></div> {/* Spacer for centering */}
            </header>

            {/* Progress Bar */}
            <div className="px-6 py-2 w-full max-w-md">
                <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-[#13ec49] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: "40%" }}
                    ></div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pt-6 pb-24 max-w-md mx-auto w-full">
                {/* Header Text */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 tracking-tight">
                        Your Professional Identity
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                        Tell us what you do. This helps our algorithm suggest relevant
                        connections and exclusive groups.
                    </p>
                </div>

                {/* Form Fields */}
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleContinue();
                    }}
                >
                    {/* Job Title Input */}
                    <div className="flex flex-col gap-2 group">
                        <label
                            className="text-sm font-medium text-slate-700 dark:text-slate-200 group-focus-within:text-[#13ec49] transition-colors"
                            htmlFor="job-title"
                        >
                            Current Job Title
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#13ec49] transition-colors material-symbols-outlined text-[20px]">
                                work
                            </span>
                            <input
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#13ec49]/50 focus:border-[#13ec49] transition-all duration-200"
                                id="job-title"
                                placeholder="e.g. Product Manager"
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) =>
                                    setFormData({ ...formData, jobTitle: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Company Input */}
                    <div className="flex flex-col gap-2 group">
                        <label
                            className="text-sm font-medium text-slate-700 dark:text-slate-200 group-focus-within:text-[#13ec49] transition-colors"
                            htmlFor="company"
                        >
                            Company
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#13ec49] transition-colors material-symbols-outlined text-[20px]">
                                business
                            </span>
                            <input
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#13ec49]/50 focus:border-[#13ec49] transition-all duration-200"
                                id="company"
                                placeholder="e.g. Acme Corp"
                                type="text"
                                value={formData.company}
                                onChange={(e) =>
                                    setFormData({ ...formData, company: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Industry Dropdown */}
                    <div className="flex flex-col gap-2 group relative">
                        <label
                            className="text-sm font-medium text-slate-700 dark:text-slate-200 group-focus-within:text-[#13ec49] transition-colors"
                            htmlFor="industry"
                        >
                            Industry
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#13ec49] transition-colors material-symbols-outlined text-[20px]">
                                domain
                            </span>
                            <select
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-10 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#13ec49]/50 focus:border-[#13ec49] transition-all duration-200 appearance-none cursor-pointer"
                                id="industry"
                                value={formData.industry}
                                onChange={(e) =>
                                    setFormData({ ...formData, industry: e.target.value })
                                }
                            >
                                <option className="text-slate-400" disabled value="">
                                    Select an industry...
                                </option>
                                <option className="text-slate-900 bg-white" value="tech">
                                    Technology
                                </option>
                                <option className="text-slate-900 bg-white" value="finance">
                                    Finance
                                </option>
                                <option className="text-slate-900 bg-white" value="healthcare">
                                    Healthcare
                                </option>
                                <option className="text-slate-900 bg-white" value="education">
                                    Education
                                </option>
                                <option className="text-slate-900 bg-white" value="creative">
                                    Creative Arts
                                </option>
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined">
                                expand_more
                            </span>
                        </div>
                    </div>
                </form>
            </main>

            {/* Bottom Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f6f8f6] via-[#f6f8f6] to-transparent dark:from-[#102215] dark:via-[#102215] dark:to-transparent pt-12">
                <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                    <button className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white transition-colors">
                        Skip
                    </button>
                    <button
                        onClick={handleContinue}
                        className="flex-1 bg-[#13ec49] hover:bg-[#0fd641] text-[#102215] font-bold text-lg py-4 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(19,236,73,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,73,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        Continue
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
