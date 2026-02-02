/**
 * Match Insights Card
 * Shows detailed AI-powered explanation of why two profiles match
 * Displays compatibility factors, conversation starters, and shared values
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    Sparkles,
    Heart,
    Target,
    MessageCircle,
    Users,
    Star,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    TrendingUp,
    Smile,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompatibilityFactor {
    name: string;
    score: number;
    icon: typeof Heart;
    description: string;
    color: string;
}

interface MatchInsightsCardProps {
    matchExplanation?: string;
    compatibilityScore: number;
    sharedValues?: string[];
    conversationStarters?: string[];
    compatibilityFactors?: CompatibilityFactor[];
    className?: string;
}

const DEFAULT_FACTORS: CompatibilityFactor[] = [
    {
        name: 'Values Alignment',
        score: 92,
        icon: Heart,
        description: 'Strong overlap in core life values',
        color: 'text-rose-500',
    },
    {
        name: 'Communication Style',
        score: 88,
        icon: MessageCircle,
        description: 'Compatible communication preferences',
        color: 'text-blue-500',
    },
    {
        name: 'Life Goals',
        score: 85,
        icon: Target,
        description: 'Aligned vision for the future',
        color: 'text-emerald-500',
    },
    {
        name: 'Lifestyle Match',
        score: 78,
        icon: Users,
        description: 'Similar daily routines and habits',
        color: 'text-amber-500',
    },
];

const DEFAULT_STARTERS = [
    "Ask about their favorite hiking trail nearby",
    "Share your thoughts on work-life balance",
    "Discuss your mutual love of coffee culture",
];

const DEFAULT_VALUES = [
    'Growth Mindset',
    'Family First',
    'Adventure',
    'Authenticity',
    'Kindness',
];

export const MatchInsightsCard = ({
    matchExplanation = "Based on our AI analysis, you share a remarkable alignment in core values, particularly around personal growth and family. Your communication styles complement each other, with both of you valuing honest, direct conversation.",
    compatibilityScore,
    sharedValues = DEFAULT_VALUES,
    conversationStarters = DEFAULT_STARTERS,
    compatibilityFactors = DEFAULT_FACTORS,
    className,
}: MatchInsightsCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 75) return 'text-blue-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Exceptional';
        if (score >= 75) return 'Strong';
        if (score >= 60) return 'Good';
        return 'Moderate';
    };

    return (
        <Card className={cn(
            'border-dating-terracotta/20 bg-gradient-to-br from-dating-cream/40 to-white',
            'shadow-lg hover:shadow-xl transition-shadow duration-300',
            className
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-full bg-dating-terracotta/10">
                            <Sparkles className="h-5 w-5 text-dating-terracotta" />
                        </div>
                        Match Insights
                    </CardTitle>
                    <div className="text-right">
                        <div className={cn(
                            'text-2xl font-bold',
                            getScoreColor(compatibilityScore)
                        )}>
                            {compatibilityScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {getScoreLabel(compatibilityScore)} Match
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* AI Explanation */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-dating-terracotta/5 to-transparent border border-dating-terracotta/10">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-dating-terracotta/10 mt-0.5">
                            <Lightbulb className="h-4 w-4 text-dating-terracotta" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {matchExplanation}
                        </p>
                    </div>
                </div>

                {/* Shared Values */}
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Shared Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {sharedValues.map((value) => (
                            <Badge
                                key={value}
                                variant="secondary"
                                className="bg-dating-terracotta/10 text-dating-terracotta hover:bg-dating-terracotta/20"
                            >
                                {value}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Expandable Section */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" />
                            Show Detailed Analysis
                        </>
                    )}
                </Button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {/* Compatibility Breakdown */}
                            <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    Compatibility Breakdown
                                </h4>
                                <div className="space-y-3">
                                    {compatibilityFactors.map((factor) => {
                                        const Icon = factor.icon;
                                        return (
                                            <div key={factor.name} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={cn('h-4 w-4', factor.color)} />
                                                        <span className="font-medium">{factor.name}</span>
                                                    </div>
                                                    <span className={cn('font-semibold', getScoreColor(factor.score))}>
                                                        {factor.score}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={factor.score}
                                                    className="h-1.5"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {factor.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Conversation Starters */}
                            <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Smile className="h-4 w-4 text-blue-500" />
                                    Conversation Starters
                                </h4>
                                <ul className="space-y-2">
                                    {conversationStarters.map((starter, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-dating-terracotta font-medium min-w-4">
                                                {index + 1}.
                                            </span>
                                            {starter}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default MatchInsightsCard;
