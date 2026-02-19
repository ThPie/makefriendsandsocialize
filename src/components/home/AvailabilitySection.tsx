import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Star } from 'lucide-react';

export const AvailabilitySection = () => {
    return (
        <section className="w-full px-6 py-24 bg-[#0a0f0a] flex justify-center">
            <div className="max-w-md w-full p-12 rounded-3xl bg-[#141f17] border border-white/5 text-center relative overflow-hidden group hover:bg-[#141f17]/80 transition-colors duration-500 shadow-2xl">

                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#d4af37]/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0a1f0f] mb-6 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                        <Star className="w-6 h-6 fill-current" />
                    </div>

                    <h3 className="font-display text-3xl text-white italic mb-4">
                        Limited Availability
                    </h3>

                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        Membership is by application or invitation only. Applications are reviewed quarterly.
                    </p>

                    <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-[#d4af37]/30 text-white hover:bg-[#d4af37] hover:text-[#0a1f0f] hover:border-[#d4af37] transition-all duration-300 px-8 py-6 uppercase tracking-widest text-xs font-bold"
                    >
                        <TransitionLink to="/membership">
                            Check Status
                        </TransitionLink>
                    </Button>
                </div>
            </div>
        </section>
    );
};
