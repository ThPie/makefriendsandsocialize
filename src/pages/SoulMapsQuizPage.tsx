import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthGateModal } from '@/components/soul-maps/AuthGateModal';
import { AttachmentResults } from '@/components/soul-maps/AttachmentResults';
import { QuizCompletionCTAs } from '@/components/soul-maps/QuizCompletionCTAs';
import { QuizSidebar } from '@/components/soul-maps/QuizSidebar';
import { RelatedQuizzes } from '@/components/soul-maps/RelatedQuizzes';
import {
  attachmentQuestions,
  calculateScores,
  getWinningStyle,
  resultProfiles,
  type AttachmentStyle,
} from '@/components/soul-maps/quizData';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'soul_maps_attachment_answers';

const SoulMapsQuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(AttachmentStyle | null)[]>(
    () => Array(attachmentQuestions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [saved, setSaved] = useState(false);

  const scores = showResults ? calculateScores(answers.filter(Boolean) as AttachmentStyle[]) : null;
  const winningStyle = scores ? getWinningStyle(scores) : null;

  // Build quiz results payload for the auth gate modal
  const quizResultsForEmail = useMemo(() => {
    if (!scores || !winningStyle) return undefined;
    const profile = resultProfiles[winningStyle];
    return {
      winningStyle,
      scores,
      profileTitle: profile.title,
      profileSubtitle: profile.subtitle,
      profileDescription: profile.description,
      traits: profile.traits,
      growthEdge: profile.growthEdge,
    };
  }, [scores, winningStyle]);

  // On mount: check for stored answers after auth redirect
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && user) {
      try {
        const parsed = JSON.parse(stored) as AttachmentStyle[];
        if (parsed.length === attachmentQuestions.length && parsed.every(Boolean)) {
          setAnswers(parsed);
          setShowResults(true);
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch { /* ignore */ }
    }
  }, [user]);

  // Also handle ?showResults=true param
  useEffect(() => {
    if (searchParams.get('showResults') === 'true' && user) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AttachmentStyle[];
          if (parsed.length === attachmentQuestions.length && parsed.every(Boolean)) {
            setAnswers(parsed);
            setShowResults(true);
            sessionStorage.removeItem(STORAGE_KEY);
          }
        } catch { /* ignore */ }
      }
    }
  }, [searchParams, user]);

  // Save results to DB
  useEffect(() => {
    if (showResults && user && scores && winningStyle && !saved) {
      setSaved(true);
      supabase.from('soul_maps_results').insert({
        user_id: user.id,
        quiz_slug: 'attachment-style',
        answers: answers as any,
        result_type: winningStyle,
        scores: scores as any,
      }).then(() => {});
    }
  }, [showResults, user, scores, winningStyle, saved, answers]);

  const selectAnswer = useCallback((style: AttachmentStyle) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = style;
      return next;
    });
  }, [currentQ]);

  const handleNext = () => {
    if (currentQ < attachmentQuestions.length - 1) {
      setCurrentQ((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  const handleSeeResults = () => {
    if (user) {
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      // Calculate scores now so they're available for the email
      const tempScores = calculateScores(answers.filter(Boolean) as AttachmentStyle[]);
      const tempWinning = getWinningStyle(tempScores);
      // Force state so quizResultsForEmail is computed
      setShowResults(true);
      setTimeout(() => {
        setShowResults(false);
        setShowAuthGate(true);
      }, 0);
    }
  };

  // We need scores available even before showResults for the auth gate
  const previewScores = useMemo(() => {
    const validAnswers = answers.filter(Boolean) as AttachmentStyle[];
    if (validAnswers.length === attachmentQuestions.length) {
      return calculateScores(validAnswers);
    }
    return null;
  }, [answers]);

  const previewWinningStyle = previewScores ? getWinningStyle(previewScores) : null;

  const previewQuizResults = useMemo(() => {
    if (!previewScores || !previewWinningStyle) return undefined;
    const profile = resultProfiles[previewWinningStyle];
    return {
      winningStyle: previewWinningStyle,
      scores: previewScores,
      profileTitle: profile.title,
      profileSubtitle: profile.subtitle,
      profileDescription: profile.description,
      traits: profile.traits,
      growthEdge: profile.growthEdge,
    };
  }, [previewScores, previewWinningStyle]);

  const handleEmailSubmitted = () => {
    setShowAuthGate(false);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLastQuestion = currentQ === attachmentQuestions.length - 1;
  const allAnswered = answers.every(Boolean);
  const question = attachmentQuestions[currentQ];
  const progressPct = ((currentQ + 1) / attachmentQuestions.length) * 100;

  const handleRetake = () => {
    setShowResults(false);
    setSaved(false);
    setCurrentQ(0);
    setAnswers(Array(attachmentQuestions.length).fill(null));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showResults && scores && winningStyle) {
    return (
      <>
        <Helmet>
          <title>Your Attachment Style — Soul Maps | MakeFriends & Socialize</title>
        </Helmet>
        <div className="content-container py-24 md:py-32">
          <AttachmentResults scores={scores} winningStyle={winningStyle} />
          <QuizCompletionCTAs onRetake={handleRetake} />
          <RelatedQuizzes />
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              onClick={() => navigate('/soul-maps')}
              className="rounded-full uppercase tracking-widest text-xs"
            >
              ← Back to Soul Maps
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Attachment Style Quiz — Soul Maps | MakeFriends & Socialize</title>
        <meta name="description" content="Discover your attachment style with this 3-minute psychology-backed quiz." />
      </Helmet>

      <div className="content-container py-24 md:py-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="flex-1 min-w-0">
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Question {currentQ + 1} of {attachmentQuestions.length}</span>
                <span>How Do You Love & Connect?</span>
              </div>
              <Progress value={progressPct} className="h-1.5" indicatorClassName="bg-[hsl(var(--accent-gold))]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-[hsl(var(--accent-gold))]">{question.scenario}</p>
                  <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground leading-snug">
                    {question.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(opt.style)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all duration-150 text-sm leading-relaxed",
                        answers[currentQ] === opt.style
                          ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold))]/5 text-foreground"
                          : "border-border/60 bg-card text-foreground/80 hover:border-border hover:bg-accent/30"
                      )}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentQ === 0}
                className="gap-1.5 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSeeResults}
                  disabled={!allAnswered}
                  className="rounded-full px-6 h-10 bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white uppercase tracking-widest text-xs font-medium"
                >
                  See My Results
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!answers[currentQ]}
                  className="gap-1.5 text-muted-foreground"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
              <QuizSidebar />
            </div>
          </div>
        </div>

        <RelatedQuizzes />

        <div className="lg:hidden mt-12">
          <QuizSidebar />
        </div>
      </div>

      <AuthGateModal
        open={showAuthGate}
        onOpenChange={setShowAuthGate}
        redirectPath="/soul-maps/attachment-style?showResults=true"
        onEmailSubmitted={handleEmailSubmitted}
        quizResults={previewQuizResults}
      />
    </>
  );
};

export default SoulMapsQuizPage;
