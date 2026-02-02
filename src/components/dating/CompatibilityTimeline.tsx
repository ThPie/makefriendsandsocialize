/**
 * Compatibility Timeline
 * Visual timeline showing relationship milestone predictions
 * and long-term compatibility forecast
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Calendar,
    Heart,
    Home,
    Users,
    Plane,
    Target,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MilestoneItem {
    title: string;
    description: string;
    icon: typeof Heart;
    timeframe: string;
    confidence: number;
    achieved?: boolean;
}

interface CompatibilityTimelineProps {
    milestones?: MilestoneItem[];
    className?: string;
}

const DEFAULT_MILESTONES: MilestoneItem[] = [
    {
        title: 'First Connection',
        description: 'Deep conversation and shared interests spark connection',
        icon: Sparkles,
        timeframe: 'Week 1-2',
        confidence: 95,
        achieved: true,
    },
    {
        title: 'Relationship Foundation',
        description: 'Building trust and understanding communication styles',
        icon: Heart,
        timeframe: '1-3 months',
        confidence: 88,
    },
    {
        title: 'Meet the Family',
        description: 'Introducing each other to close family and friends',
        icon: Users,
        timeframe: '3-6 months',
        confidence: 82,
    },
    {
        title: 'Shared Adventures',
        description: 'First major trip or adventure together',
        icon: Plane,
        timeframe: '6-12 months',
        confidence: 75,
    },
    {
        title: 'Future Planning',
        description: 'Discussing long-term goals and life together',
        icon: Target,
        timeframe: '1-2 years',
        confidence: 70,
    },
    {
        title: 'Building Home',
        description: 'Moving in together or major life decision',
        icon: Home,
        timeframe: '2+ years',
        confidence: 65,
    },
];

export const CompatibilityTimeline = ({
    milestones = DEFAULT_MILESTONES,
    className,
}: CompatibilityTimelineProps) => {
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return 'bg-emerald-500';
        if (confidence >= 70) return 'bg-blue-500';
        if (confidence >= 55) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 85) return 'Very Likely';
        if (confidence >= 70) return 'Likely';
        if (confidence >= 55) return 'Possible';
        return 'Uncertain';
    };

    return (
        <Card className={cn(
            'border-dating-terracotta/20 bg-gradient-to-br from-dating-cream/40 to-white',
            className
        )}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-full bg-dating-terracotta/10">
                        <Calendar className="h-5 w-5 text-dating-terracotta" />
                    </div>
                    Relationship Timeline
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    AI-predicted milestones based on your compatibility
                </p>
            </CardHeader>

            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div
                        className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-dating-terracotta via-dating-terracotta/50 to-dating-terracotta/20"
                        aria-hidden="true"
                    />

                    <div className="space-y-6">
                        {milestones.map((milestone, index) => {
                            const Icon = milestone.icon;
                            return (
                                <motion.div
                                    key={milestone.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex gap-4"
                                >
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                                            milestone.achieved
                                                ? 'bg-dating-terracotta border-dating-terracotta text-white'
                                                : 'bg-white border-dating-terracotta/30 text-dating-terracotta'
                                        )}
                                    >
                                        {milestone.achieved ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-6">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-medium text-sm flex items-center gap-2">
                                                    {milestone.title}
                                                    {milestone.achieved && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs bg-emerald-100 text-emerald-700"
                                                        >
                                                            Achieved
                                                        </Badge>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {milestone.description}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs shrink-0"
                                            >
                                                {milestone.timeframe}
                                            </Badge>
                                        </div>

                                        {/* Confidence bar */}
                                        {!milestone.achieved && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${milestone.confidence}%` }}
                                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            getConfidenceColor(milestone.confidence)
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground min-w-20">
                                                    {getConfidenceLabel(milestone.confidence)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer note */}
                <div className="mt-4 pt-4 border-t border-dating-terracotta/10">
                    <p className="text-xs text-muted-foreground text-center italic">
                        Predictions based on shared values, life goals, and communication compatibility
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompatibilityTimeline;
