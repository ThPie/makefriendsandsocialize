import { useNavigate } from "react-router-dom";

export default function ReviewPage() {
    const navigate = useNavigate();

    const handleComplete = () => {
        // Complete onboarding and navigate to dashboard or home
        navigate("/portal");
    };

    return (
        <div className="min-h-screen w-full bg-[#f6f8f6] dark:bg-[#102215] font-display text-slate-900 dark:text-white antialiased selection:bg-[#0fbd3b] selection:text-white">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Header & Navigation */}
                <header className="sticky top-0 z-10 bg-[#f6f8f6]/95 dark:bg-[#102215]/95 backdrop-blur-md border-b border-[#0fbd3b]/10">
                    <div className="flex items-center p-4 pb-2 justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[#0fbd3b]/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                arrow_back_ios_new
                            </span>
                        </button>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
                            Review
                        </h2>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2 px-6 pb-4">
                        <div className="flex justify-between items-end">
                            <p className="text-[#0fbd3b] text-sm font-semibold tracking-wide uppercase">
                                Step 5 of 5
                            </p>
                            <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                100%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#0fbd3b]/20">
                            <div
                                className="h-1.5 rounded-full bg-[#0fbd3b] transition-all duration-500 ease-out"
                                style={{ width: "100%" }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col p-6 gap-6 pb-32">
                    <h1 className="text-3xl font-medium text-center text-slate-900 dark:text-white">
                        Review Your Profile
                    </h1>

                    {/* Profile Overview */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="relative group cursor-pointer">
                            <div className="h-32 w-32 rounded-full border-4 border-[#0fbd3b]/20 p-1">
                                <div
                                    className="h-full w-full rounded-full bg-cover bg-center bg-no-repeat shadow-inner"
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARZvumVsyvkIf8ZnmaPkF5RR5Zjcr9y1PPqdKtmjRvapE3ii5G2TsP9Ze7t4Cvi5X6sL5dUCyurbdH4N7lWyTIGz4Qs5WkPYBuoQaY9SeuRlcxIGvNvAOjEi768ScZz-xrcln6xWPJntGpsNCpZ_uUn-ITDx5up2bDya_kWqTxcmb7RrPb69Uz0LoKEr0C-AZ4ELZ1sO1-jUmLG1Aujv51HIEUcwG03SciKmiE_0V2L_CX99Ne1ftUb9byZzoQgjjssQAWjOAUxGc")',
                                    }}
                                ></div>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#0fbd3b] text-white rounded-full p-2 shadow-lg border-2 border-[#102215] flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold">Alex Morgan</h2>
                            <p className="text-slate-500 dark:text-gray-400 text-lg">
                                Product Designer at TechFlow
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="space-y-4">
                        {/* Basic Info Card */}
                        <section className="relative bg-white dark:bg-[#1a2e21] rounded-xl p-5 border border-slate-200 dark:border-[#0fbd3b]/10 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-[#0fbd3b]/5 pb-2">
                                <h3 className="text-lg font-bold text-[#0fbd3b] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">
                                        person
                                    </span>
                                    Basic Info
                                </h3>
                                <button className="text-slate-400 hover:text-[#0fbd3b] transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">
                                        edit
                                    </span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Email
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        alex.morgan@example.com
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Location
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        San Francisco, CA
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Phone
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        +1 (555) 123-4567
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Professional Details Card */}
                        <section className="relative bg-white dark:bg-[#1a2e21] rounded-xl p-5 border border-slate-200 dark:border-[#0fbd3b]/10 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-[#0fbd3b]/5 pb-2">
                                <h3 className="text-lg font-bold text-[#0fbd3b] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">
                                        work
                                    </span>
                                    Professional
                                </h3>
                                <button className="text-slate-400 hover:text-[#0fbd3b] transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">
                                        edit
                                    </span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Role
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        Senior Product Designer
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Company
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        TechFlow Inc.
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                                        Experience
                                    </span>
                                    <span className="col-span-2 text-sm text-slate-900 dark:text-white font-medium">
                                        8 Years
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Interests Card */}
                        <section className="relative bg-white dark:bg-[#1a2e21] rounded-xl p-5 border border-slate-200 dark:border-[#0fbd3b]/10 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-[#0fbd3b]/5 pb-2">
                                <h3 className="text-lg font-bold text-[#0fbd3b] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">
                                        interests
                                    </span>
                                    Interests
                                </h3>
                                <button className="text-slate-400 hover:text-[#0fbd3b] transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">
                                        edit
                                    </span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "UX Research",
                                    "Accessibility",
                                    "Prototyping",
                                    "Mentorship",
                                    "Design Systems",
                                ].map((interest) => (
                                    <span
                                        key={interest}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0fbd3b]/10 text-[#0fbd3b] border border-[#0fbd3b]/20"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Code of Conduct Checkbox */}
                        <div className="pt-4 px-1">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        className="peer size-5 cursor-pointer appearance-none rounded border border-slate-400 dark:border-slate-500 bg-transparent transition-all checked:border-[#0fbd3b] checked:bg-[#0fbd3b] hover:border-[#0fbd3b] focus:outline-none focus:ring-2 focus:ring-[#0fbd3b]/20 focus:ring-offset-2 focus:ring-offset-[#102215]"
                                        type="checkbox"
                                        defaultChecked
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none">
                                        check
                                    </span>
                                </div>
                                <div className="text-sm leading-tight text-slate-600 dark:text-gray-300">
                                    I agree to the{" "}
                                    <a
                                        className="text-[#0fbd3b] hover:underline font-semibold decoration-[#0fbd3b]/50"
                                        href="/rules"
                                    >
                                        Code of Conduct
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        className="text-[#0fbd3b] hover:underline font-semibold decoration-[#0fbd3b]/50"
                                        href="/privacy"
                                    >
                                        Privacy Policy
                                    </a>{" "}
                                    of the community.
                                </div>
                            </label>
                        </div>
                    </div>
                </main>

                {/* Sticky Bottom Action */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-20 max-w-md mx-auto">
                    <button
                        onClick={handleComplete}
                        className="w-full bg-[#0fbd3b] hover:bg-[#0fbd3b]/90 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-[#0fbd3b]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Complete Setup
                        <span className="material-symbols-outlined">check_circle</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
