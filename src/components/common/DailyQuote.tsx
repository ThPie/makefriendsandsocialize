import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DailyQuote() {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('daily_quotes')
      .select('quote_text')
      .eq('quote_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.quote_text) {
          setQuote(data.quote_text);
        } else {
          supabase
            .from('daily_quotes')
            .select('quote_text')
            .order('quote_date', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data: latest }) => {
              setQuote(latest?.quote_text || '"The only way to have a friend is to be one." — Ralph Waldo Emerson');
            });
        }
      });
  }, []);

  if (!quote) return null;

  return (
    <div className="w-full py-4 border-t border-border">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 text-center">Daily Quote</p>
      <p className="text-sm text-[hsl(var(--accent-gold))] italic font-display leading-relaxed text-center max-w-md mx-auto">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
