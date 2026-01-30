/**
 * Text validation utilities for detecting gibberish and low-quality content
 */

export interface GibberishCheckResult {
  isGibberish: boolean;
  reason?: string;
}

/**
 * Detects if text appears to be gibberish (random keyboard smashing, etc.)
 * Uses multiple heuristics:
 * 1. Vowel ratio check - Real text has ~35-50% vowels
 * 2. Consonant cluster check - More than 5 consecutive consonants is unusual
 * 3. Repeated character pattern - Same char 3+ times in a row
 * 4. Word length distribution - Real text has short words like "a", "the", "is"
 */
export function isGibberish(text: string): GibberishCheckResult {
  // Skip short texts - they might be abbreviations or nicknames
  if (text.length < 20) {
    return { isGibberish: false };
  }

  // Clean the text - keep only letters for analysis
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  
  // If very little alphabetic content, skip check
  if (cleaned.length < 10) {
    return { isGibberish: false };
  }

  // Check 1: Vowel ratio (English typically ~35-50%)
  const vowels = cleaned.match(/[aeiou]/g)?.length || 0;
  const vowelRatio = vowels / cleaned.length;
  
  if (vowelRatio < 0.15) {
    return { 
      isGibberish: true, 
      reason: 'Your bio contains unusual letter patterns. Please write something meaningful.' 
    };
  }
  
  if (vowelRatio > 0.7) {
    return { 
      isGibberish: true, 
      reason: 'Your bio contains unusual letter patterns. Please write something meaningful.' 
    };
  }

  // Check 2: Consonant clusters (>5 consecutive is very unusual in English)
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(cleaned)) {
    return { 
      isGibberish: true, 
      reason: 'Your bio appears to contain random characters. Please write a real bio.' 
    };
  }

  // Check 3: Repeated characters (>3 same char in a row)
  if (/(.)\1{3,}/.test(cleaned)) {
    return { 
      isGibberish: true, 
      reason: 'Your bio contains repeated characters. Please write something meaningful.' 
    };
  }

  // Check 4: Word length distribution
  // Real text typically has many short words (a, the, is, in, to, etc.)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length > 5) {
    const shortWords = words.filter(w => w.length <= 3).length;
    const shortWordRatio = shortWords / words.length;
    
    // Real English text usually has at least 10-20% short words
    if (shortWordRatio < 0.1) {
      return { 
        isGibberish: true, 
        reason: 'Your bio has an unusual pattern. Please write naturally.' 
      };
    }
  }

  // Check 5: Single long "word" without spaces (keyboard smash)
  if (words.length === 1 && cleaned.length > 15) {
    return { 
      isGibberish: true, 
      reason: 'Please write a proper bio with multiple words.' 
    };
  }

  return { isGibberish: false };
}

/**
 * Validates bio content for quality
 * Returns error message if invalid, null if valid
 */
export function validateBio(bio: string, minLength = 50): string | null {
  const trimmed = bio.trim();
  
  if (trimmed.length < minLength) {
    return `Bio must be at least ${minLength} characters`;
  }
  
  const gibberishCheck = isGibberish(trimmed);
  if (gibberishCheck.isGibberish) {
    return gibberishCheck.reason || 'Please write a meaningful bio';
  }
  
  return null;
}
