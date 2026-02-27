import { TransitionLink } from '@/components/ui/TransitionLink';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hexagon, Diamond, BringToFront, Circle } from 'lucide-react';

interface CirclesMegamenuProps {
    isTransparent?: boolean;
}

export function CirclesMegamenu({ isTransparent = false }: CirclesMegamenuProps) {
    return (
        <div className="group relative h-full">
            <button className={cn(
                "hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 h-full",
                isTransparent ? "text-white/90 hover:text-white" : "text-foreground hover:text-[hsl(var(--accent-gold))]"
            )}>
                Circles
                <ChevronDown className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown Container */}
            <div className="absolute top-[100%] right-0 -mr-64 xl:-mr-80 w-[960px] max-w-[95vw] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-[100] pt-4">
                {/* Pointer Triangle intentionally omitted to match the clean rounded glass look of the reference */}

                {/* Content Box - matching the exact reference layout: Left dark panel, right white options */}
                <div className="bg-[#FAF9F6] dark:bg-card border border-border/40 rounded-[32px] shadow-2xl overflow-hidden flex flex-row min-h-[420px] max-h-[85vh]">

                    {/* LEFT PANEL - The dark rounded container inside */}
                    <div className="w-[300px] m-2 rounded-[24px] overflow-hidden relative flex flex-col justify-between p-8 bg-[#1A1A1A]">
                        {/* Background Image with heavy overlay */}
                        <img
                            src="/images/gallery/event-1.jpg"
                            alt="Services"
                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80"></div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <h2 className="text-white text-3xl font-display leading-[1.1] tracking-tight">
                                Multiple Exclusive<br />Circles
                            </h2>
                            <p className="text-white/80 text-sm font-light leading-relaxed mb-4">
                                Choose where you fit best, or apply to join them all for a fully encompassing social experience.
                            </p>
                            <span className="text-[hsl(var(--accent-gold))] text-xs font-semibold uppercase tracking-widest mt-2">
                                Exclusive Network
                            </span>
                        </div>

                        {/* Bottom image layer context if needed */}
                        <div className="relative z-10 mt-auto">
                            {/* Empty spacing block in the reference to push text up */}
                        </div>
                    </div>

                    {/* RIGHT PANEL - The list of services */}
                    <div className="flex-1 p-8 flex flex-col bg-[#FAF9F6] dark:bg-card relative overflow-y-auto">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">

                            {/* Column 1: Special Services */}
                            <div>
                                <h3 className="text-muted-foreground font-light text-sm mb-3">Our Circles</h3>
                                <div className="flex flex-col gap-2">
                                    <TransitionLink to="/founders-circle" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <Hexagon strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">Founders Circle</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">For entrepreneurs and executives.</p>
                                        </div>
                                    </TransitionLink>

                                    <TransitionLink to="/circles/the-gentlemen" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <Diamond strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">The Gentlemen</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">Focusing on substantive connections.</p>
                                        </div>
                                    </TransitionLink>

                                    <TransitionLink to="/slow-dating" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <BringToFront strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                    <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">Slow Dating</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">Handpicked introductions for meaningful connections.</p>
                                        </div>
                                    </TransitionLink>
                                </div>
                            </div>

                            {/* Column 2: More Circles */}
                            <div>
                                <h3 className="text-muted-foreground font-light text-sm mb-3">More Circles</h3>
                                <div className="flex flex-col gap-2">
                                    <TransitionLink to="/circles/the-partners" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <Circle strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">Couple's Circle</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">Exclusive experiences for couples.</p>
                                        </div>
                                    </TransitionLink>

                                    <TransitionLink to="/circles/the-pursuits" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <Circle strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">Active & Outdoor</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">Adventures and active lifestyle.</p>
                                        </div>
                                    </TransitionLink>

                                    <TransitionLink to="/circles/the-ladies-society" className="bg-white dark:bg-background rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group border border-transparent hover:border-[hsl(var(--accent-gold))]/30">
                                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
                                            <Circle strokeWidth={1} className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm group-hover:text-[hsl(var(--accent-gold))] transition-colors">The Ladies Society</h4>
                                            <p className="text-muted-foreground font-light text-[13px] mt-0.5">Inspiring females connecting.</p>
                                        </div>
                                    </TransitionLink>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Help CTA area */}
                        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-4 border-t border-border/10 shrink-0 gap-4">
                            <div className="max-w-xs">
                                <h4 className="text-foreground font-medium text-sm mb-1">Looking for a specific circle?</h4>
                                <p className="text-muted-foreground text-sm font-light">We have a concierge waiting to assist you.</p>
                            </div>
                            <TransitionLink
                                to="/contact"
                                className="bg-[#111111] hover:bg-black text-white px-8 py-3 rounded-full text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
                            >
                                Contact us
                            </TransitionLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
