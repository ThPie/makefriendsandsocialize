/**
 * Auto-categorization logic for events based on title and description keywords.
 * This runs on the frontend for display purposes only.
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Networking: [
    'networking', 'founders', 'pitch', 'business', 'entrepreneur', 
    'startup', 'professional', 'industry', 'conference', 'meetup',
    'workshop', 'seminar', 'panel', 'fireside', 'keynote'
  ],
  Social: [
    'social', 'party', 'mixer', 'gathering', 'celebration',
    'happy hour', 'cocktail', 'mingle', 'soirée', 'soiree',
    'gala', 'ball', 'reception', 'meet and greet'
  ],
  Dining: [
    'dinner', 'brunch', 'lunch', 'restaurant', 'food', 'culinary',
    'tasting', 'chef', 'cuisine', 'wine', 'whiskey', 'supper',
    'feast', 'banquet', 'degustation'
  ],
  'Art & Culture': [
    'art', 'museum', 'gallery', 'culture', 'exhibition', 'exhibit',
    'theater', 'theatre', 'opera', 'ballet', 'symphony', 'film',
    'cinema', 'poetry', 'literary', 'book', 'reading'
  ],
  Sports: [
    'sports', 'golf', 'tennis', 'fitness', 'hiking', 'outdoor',
    'run', 'marathon', 'yoga', 'wellness', 'ski', 'sailing',
    'polo', 'equestrian', 'cycling', 'swimming'
  ],
  Music: [
    'music', 'concert', 'jazz', 'live', 'band', 'orchestra',
    'dj', 'acoustic', 'performance', 'recital', 'symphony',
    'blues', 'classical', 'rock', 'electronic'
  ],
  Dating: [
    'dating', 'slow dating', 'singles', 'speed dating', 'matchmaking',
    'romance', 'love', 'date night', 'couples'
  ]
};

/**
 * Determines the best category for an event based on its title and description.
 * Returns the category with the most keyword matches, or 'Social' as fallback.
 */
export function categorizeEvent(title: string, description?: string | null): string {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  let bestCategory = 'Social';
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        // Title matches are worth more
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

/**
 * Gets all matching categories for an event (useful for multi-tagging).
 * Returns categories sorted by relevance score.
 */
export function getEventCategories(title: string, description?: string | null): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  const scores: Array<{ category: string; score: number }> = [];
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }
    
    if (score > 0) {
      scores.push({ category, score });
    }
  }
  
  // Sort by score descending and return category names
  return scores
    .sort((a, b) => b.score - a.score)
    .map(s => s.category);
}
