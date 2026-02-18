import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function BasicInfoPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dob: "",
    });

    const handleContinue = () => {
        // Navigate to next step (Professional - assumed step 2)
        navigate("/onboarding/professional");
    };

    return (
        <div className="min-h-screen w-full bg-[#f6f8f6] dark:bg-[#102215] font-display text-slate-900 dark:text-white flex flex-col items-center justify-between antialiased selection:bg-[#11d442] selection:text-black">
            {/* Main Content Wrapper */}
            <div className="w-full max-w-md flex flex-col flex-grow px-6 py-4 relative">
                {/* Progress Indicators */}
                <div className="flex w-full flex-row items-center justify-center gap-2 pt-2 pb-6">
                    <div className="h-1.5 flex-1 rounded-full bg-[#11d442] shadow-[0_0_10px_rgba(17,212,66,0.5)]"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-[#1a3322]/50"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-[#1a3322]/50"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-[#1a3322]/50"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-[#1a3322]/50"></div>
                </div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8 animate-fade-in-up">
                    <h1 className="text-4xl font-medium tracking-tight text-slate-900 dark:text-white">
                        Begin Your Journey
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-lg font-light">
                        Let's start with the basics.
                    </p>
                </div>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="relative group cursor-pointer">
                        {/* Avatar Circle */}
                        <div
                            className="relative h-32 w-32 rounded-full bg-[#1a3322] border-2 border-white/10 flex items-center justify-center overflow-hidden bg-cover bg-center shadow-2xl transition-all duration-300 group-hover:border-[#11d442]/50"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCDr5Rvfye-exDZ68exs7qaocfjV1i6gs_jM5-w84jVcbyuqI_bQH_6pnFzkpLCvAP7Y7WmM5OsT1dNDcd_ad2WJ4xbF569QTLQJBQyAP7Zp9t8iAuDnH2Re1OZ63IAWseykYig6z--OoRv8lYHlrVs_3wGdf6jMMJHMLDOrg3CyJJlcgsIY40PzfHn5bBdfLi9pAv5V2t-KgreSU_F6V77nbjy478DkQLEYE4RLKYv2SM_Ofkp8D9w1pD7saHMe7MscRtaO1V8Wo')",
                            }}
                        >
                            {/* Overlay for empty state if needed */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                        {/* Gold Plus Button */}
                        <button className="absolute bottom-0 right-1 h-10 w-10 rounded-full bg-[#1a3322] border border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95">
                            <span
                                className="material-symbols-outlined text-[#D4AF37]"
                                style={{ fontSize: "24px" }}
                            >
                                add_a_photo
                            </span>
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-white/50 text-sm font-medium tracking-wide uppercase">
                        Add Photo
                    </p>
                </div>

                {/* Form Inputs */}
                <div className="flex flex-col gap-5 w-full">
                    {/* First Name */}
                    <label className="group flex flex-col gap-2">
                        <span className="text-slate-700 dark:text-white/80 text-base font-medium ml-1">
                            First Name
                        </span>
                        <div className="relative flex items-center">
                            <input
                                className="w-full h-14 rounded-xl bg-white dark:bg-[#1a3322] border border-slate-200 dark:border-white/10 px-4 pl-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442] focus:outline-none transition-all"
                                placeholder="Enter your first name"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                            />
                            <span className="material-symbols-outlined absolute left-4 text-slate-400 dark:text-white/40 group-focus-within:text-[#11d442] transition-colors">
                                person
                            </span>
                        </div>
                    </label>

                    {/* Last Name */}
                    <label className="group flex flex-col gap-2">
                        <span className="text-slate-700 dark:text-white/80 text-base font-medium ml-1">
                            Last Name
                        </span>
                        <div className="relative flex items-center">
                            <input
                                className="w-full h-14 rounded-xl bg-white dark:bg-[#1a3322] border border-slate-200 dark:border-white/10 px-4 pl-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442] focus:outline-none transition-all"
                                placeholder="Enter your last name"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                            />
                            <span className="material-symbols-outlined absolute left-4 text-slate-400 dark:text-white/40 group-focus-within:text-[#11d442] transition-colors">
                                badge
                            </span>
                        </div>
                    </label>

                    {/* Date of Birth */}
                    <label className="group flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-700 dark:text-white/80 text-base font-medium ml-1">
                                Date of Birth
                            </span>
                            <span className="text-slate-400 dark:text-white/40 text-xs italic mb-1">
                                Must be 21+
                            </span>
                        </div>
                        <div className="relative flex items-center">
                            <input
                                className="w-full h-14 rounded-xl bg-white dark:bg-[#1a3322] border border-slate-200 dark:border-white/10 px-4 pl-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442] focus:outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                placeholder="Select date"
                                type="date"
                                value={formData.dob}
                                onChange={(e) =>
                                    setFormData({ ...formData, dob: e.target.value })
                                }
                            />
                            <span className="material-symbols-outlined absolute left-4 text-slate-400 dark:text-white/40 group-focus-within:text-[#11d442] transition-colors">
                                calendar_today
                            </span>
                        </div>
                    </label>
                </div>

                <div className="flex-grow"></div>
                {/* Spacer to push buttons down */}

                {/* Navigation Buttons */}
                <div className="w-full mt-8 pb-4 flex flex-col gap-3">
                    <button
                        onClick={handleContinue}
                        className="w-full h-14 rounded-xl bg-[#11d442] text-[#102215] text-lg font-bold shadow-[0_4px_20px_rgba(17,212,66,0.3)] hover:bg-[#11d442]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        Next Step
                        <span className="material-symbols-outlined text-xl">
                            arrow_forward
                        </span>
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full h-12 rounded-xl text-slate-500 dark:text-white/60 text-base font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
