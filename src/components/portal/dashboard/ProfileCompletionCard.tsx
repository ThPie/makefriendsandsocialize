import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames

interface ProfileCompletionCardProps {
    completionPercentage: number;
    profileFn?: string;
    profileLn?: string;
    tier?: string;
}

export function ProfileCompletionCard({
    completionPercentage,
    profileFn,
    profileLn,
    tier = 'Member'
}: ProfileCompletionCardProps) {

    // Calculate stroke dash based on percentage (radius = 40, circumference ≈ 251.2)
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    const isComplete = completionPercentage === 100;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#1e2b21] shadow-lg border border-white/5">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10 p-6 flex flex-col items-center text-center">
                <h2 className="font-display text-2xl font-semibold text-white mb-6">
                    {tier === 'founder' ? 'Founding Member' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Status`}
                </h2>

                {/* Circular Progress */}
                <div className="relative w-48 h-48 mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            className="text-white/10"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            className="text-[#d4af37]"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f3e5ab" />
                                <stop offset="100%" stopColor="#b8860b" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isComplete ? (
                            <CheckCircle className="w-12 h-12 text-[#d4af37] mb-1" />
                        ) : (
                            <span className="font-display text-4xl font-bold text-white">
                                {completionPercentage}%
                            </span>
                        )}
                        <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                            {isComplete ? 'All Set' : 'Complete'}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-slate-300 mb-6 max-w-[240px] leading-relaxed">
                    {isComplete
                        ? <span className="text-[#d4af37]">Your profile is fully optimized for the best matches.</span>
                        : <>Finish your biography to unlock <span className="text-[#d4af37] font-medium">Gold Status</span> privileges.</>
                    }
                </p>

                {!isComplete && (
                    <Link
                        to="/portal/profile"
                        className="w-full py-3 px-6 rounded-xl bg-[#1a5b2a] hover:bg-[#123f1d] text-white font-medium transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group"
                    >
                        <span>Complete Profile</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>
        </div>
    );
}
