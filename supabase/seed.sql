-- =====================================================
-- SEED DATA FOR TESTING
-- Run this after migrations to populate test data
-- =====================================================

-- Note: This creates test data in public tables only
-- Real users must be created through auth.users (handled separately)

-- =====================================================
-- 1. TEST EVENTS (5-7 upcoming events)
-- =====================================================

INSERT INTO public.events (
  id, title, description, date, time, location, venue_name, venue_address,
  city, country, capacity, rsvp_count, tier, status, is_featured, 
  tags, source, image_url, ticket_price, currency, waitlist_enabled
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'Summer Rooftop Networking Mixer',
  'Join us for an exclusive evening of networking on one of NYC''s most stunning rooftops. Connect with fellow professionals, entrepreneurs, and creatives while enjoying craft cocktails and panoramic city views. Business casual attire recommended.',
  (CURRENT_DATE + INTERVAL '7 days')::date,
  '18:30',
  'Manhattan, New York',
  'The Skylark Rooftop',
  '200 W 39th St, New York, NY 10018',
  'New York',
  'United States',
  75,
  23,
  'patron',
  'upcoming',
  true,
  ARRAY['networking', 'social', 'rooftop'],
  'manual',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  45,
  'USD',
  true
),
(
  'e1000000-0000-0000-0000-000000000002',
  'Wine Tasting & Art Gallery Evening',
  'Experience an exquisite pairing of fine wines and contemporary art. Our sommelier will guide you through a curated selection of wines from renowned vineyards, while you explore works from emerging local artists. Limited to 40 guests for an intimate experience.',
  (CURRENT_DATE + INTERVAL '14 days')::date,
  '19:00',
  'SoHo, New York',
  'Gallery Rouge',
  '127 Prince St, New York, NY 10012',
  'New York',
  'United States',
  40,
  31,
  'fellow',
  'upcoming',
  true,
  ARRAY['wine', 'art', 'culture', 'members-only'],
  'manual',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
  85,
  'USD',
  true
),
(
  'e1000000-0000-0000-0000-000000000003',
  'Startup Founders Breakfast',
  'A morning gathering for startup founders and aspiring entrepreneurs. Share insights, challenges, and opportunities over a gourmet breakfast. Featuring a 15-minute lightning talk from a successful founder.',
  (CURRENT_DATE + INTERVAL '10 days')::date,
  '08:00',
  'Midtown, New York',
  'The Wing',
  '25 West 45th St, New York, NY 10036',
  'New York',
  'United States',
  30,
  12,
  'patron',
  'upcoming',
  false,
  ARRAY['business', 'startup', 'breakfast', 'networking'],
  'manual',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
  35,
  'USD',
  false
),
(
  'e1000000-0000-0000-0000-000000000004',
  'Private Dinner: French Cuisine Experience',
  'An intimate dinner experience featuring a 5-course French tasting menu prepared by Chef Antoine Dubois. Wine pairings included. Dress code: Smart elegant. Exclusively for Fellow and Founder members.',
  (CURRENT_DATE + INTERVAL '21 days')::date,
  '19:30',
  'Upper East Side, New York',
  'Maison Pierre',
  '792 Madison Ave, New York, NY 10065',
  'New York',
  'United States',
  16,
  14,
  'founder',
  'upcoming',
  true,
  ARRAY['dining', 'french', 'exclusive', 'members-only'],
  'manual',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  195,
  'USD',
  true
),
(
  'e1000000-0000-0000-0000-000000000005',
  'Jazz & Cocktails Night',
  'Unwind with live jazz performances and handcrafted cocktails at this speakeasy-style venue. The perfect blend of classic ambiance and modern networking. Smart casual dress code.',
  (CURRENT_DATE + INTERVAL '5 days')::date,
  '20:00',
  'West Village, New York',
  'The Blue Note',
  '131 W 3rd St, New York, NY 10012',
  'New York',
  'United States',
  60,
  45,
  'patron',
  'upcoming',
  false,
  ARRAY['jazz', 'music', 'cocktails', 'social'],
  'manual',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
  55,
  'USD',
  true
),
(
  'e1000000-0000-0000-0000-000000000006',
  'Tech Leaders Roundtable',
  'An invitation-only discussion with CTOs and tech leaders from NYC''s top companies. Topics include AI adoption, team scaling, and the future of work. Continental breakfast provided.',
  (CURRENT_DATE + INTERVAL '28 days')::date,
  '09:00',
  'Financial District, New York',
  'WeWork One Wall Street',
  '1 Wall St, New York, NY 10005',
  'New York',
  'United States',
  25,
  8,
  'founder',
  'upcoming',
  true,
  ARRAY['tech', 'leadership', 'business', 'exclusive'],
  'manual',
  'https://images.unsplash.com/photo-1560439514-e960a3ef5019?w=800',
  75,
  'USD',
  false
),
(
  'e1000000-0000-0000-0000-000000000007',
  'Wellness & Meditation Retreat',
  'A half-day wellness experience featuring guided meditation, yoga, and mindfulness workshops. Includes organic brunch and wellness gift bag. Perfect for recharging mid-week.',
  (CURRENT_DATE + INTERVAL '18 days')::date,
  '10:00',
  'Brooklyn, New York',
  'The Standard High Line',
  '848 Washington St, New York, NY 10014',
  'New York',
  'United States',
  35,
  19,
  'fellow',
  'upcoming',
  false,
  ARRAY['wellness', 'meditation', 'yoga', 'self-care'],
  'manual',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  65,
  'USD',
  true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. SAMPLE JOURNAL POSTS (4 blog posts)
-- =====================================================

INSERT INTO public.journal_posts (
  id, slug, title, excerpt, content, category, tags,
  cover_image, is_published, published_at, reading_time_minutes, view_count
) VALUES
(
  'j1000000-0000-0000-0000-000000000001',
  'art-of-meaningful-networking',
  'The Art of Meaningful Networking: Beyond Business Cards',
  'Discover how to build genuine connections that last a lifetime, rather than collecting contacts you''ll never call.',
  '# The Art of Meaningful Networking

In an age of LinkedIn connections and virtual meetings, the true essence of networking often gets lost. Let''s explore how to create connections that matter.

## Why Most Networking Fails

The typical networking event feels transactional. You exchange business cards, make small talk, and promise to "grab coffee sometime" – a promise rarely kept. This approach fails because it lacks authenticity and genuine curiosity.

## The Three Pillars of Meaningful Connections

### 1. Curiosity Over Convenience

Instead of scanning the room for the most "useful" person to talk to, approach conversations with genuine curiosity. Ask questions that go beyond job titles:
- What are you passionate about outside of work?
- What''s a project you''re proud of that never made your resume?
- What would you do if you had an extra day each week?

### 2. Give Before You Ask

The most successful networkers are generous with their time, knowledge, and connections. Before asking "What can you do for me?" consider "How can I help you?"

### 3. Follow Through With Purpose

A connection without follow-up is just a forgotten conversation. Within 48 hours of meeting someone interesting:
- Send a personalized message referencing your conversation
- Share an article, book, or resource relevant to what you discussed
- Introduce them to someone who could help with their goals

## Building Your Network Intentionally

Quality trumps quantity every time. Focus on building a smaller network of people you genuinely enjoy and respect. These relationships compound over time, creating opportunities neither party could have predicted.

## The Long Game

The best networking doesn''t feel like networking at all. It feels like building friendships with fascinating people. Play the long game, be generous, and watch your network become your greatest asset.',
  'Lifestyle',
  ARRAY['networking', 'career', 'relationships', 'personal-growth'],
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
  true,
  (CURRENT_DATE - INTERVAL '5 days')::timestamp with time zone,
  6,
  342
),
(
  'j1000000-0000-0000-0000-000000000002',
  'navigating-nyc-private-dining-scene',
  'Navigating NYC''s Private Dining Scene: An Insider''s Guide',
  'From hidden speakeasies to chef''s tables, discover the exclusive dining experiences that define New York''s culinary elite.',
  '# Navigating NYC''s Private Dining Scene

New York City''s dining scene extends far beyond its Michelin-starred restaurants. For those in the know, a world of exclusive, members-only, and private dining experiences awaits.

## The Hidden Gems

### Chef''s Tables Worth Seeking

The most coveted seats in New York aren''t in dining rooms – they''re in kitchens. Here''s where to look:

**Eleven Madison Park Kitchen Experience**
Limited to 8 guests, watch the ballet of a world-class kitchen while enjoying a personalized tasting menu.

**Per Se Salon**
A more intimate alternative to the main dining room, with direct chef interaction.

### Private Clubs with Exceptional Dining

**The Core Club**
Where finance meets fine dining. Their members-only restaurant rivals any standalone establishment.

**Soho House**
Multiple locations, each with unique culinary identities. The rooftop at Meatpacking remains a favorite.

## How to Access the Inaccessible

1. **Build Relationships, Not Just Reservations**
   Regular patrons at a restaurant often get access to experiences never advertised publicly.

2. **Join Curated Communities**
   Clubs like ours organize exclusive dining experiences that would be impossible to access individually.

3. **Embrace Off-Peak Timing**
   Chef''s tables and special experiences are more available Tuesday through Thursday.

## The Etiquette of Private Dining

- Arrive precisely on time
- Trust the chef – dietary restrictions aside, accept the journey
- Keep phone usage minimal
- Engage with staff and fellow diners
- Tip generously – these experiences often involve extra staff effort

## Worth the Wait List

Some experiences require patience. The Aviary NYC (with the Office speakeasy), and various popup experiences by visiting international chefs, are worth putting your name down for months in advance.

The best meal you''ll have in New York might not be at the most famous restaurant. It might be in a hidden room, at a table you didn''t know existed.',
  'Dining',
  ARRAY['dining', 'nyc', 'food', 'exclusive', 'restaurants'],
  'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800',
  true,
  (CURRENT_DATE - INTERVAL '12 days')::timestamp with time zone,
  8,
  567
),
(
  'j1000000-0000-0000-0000-000000000003',
  'slow-dating-revolution',
  'The Slow Dating Revolution: Why Quality Trumps Quantity',
  'In a world of endless swipes, discover the power of intentional, curated dating experiences.',
  '# The Slow Dating Revolution

Dating apps have given us quantity. Perhaps too much of it. The endless scroll, the paradox of choice, the burnout. There''s a better way.

## The Problem with Modern Dating

### Swipe Fatigue is Real

Studies show the average dating app user spends 10+ hours per week swiping. Yet satisfaction rates with matches remain dismally low. We''re optimizing for volume, not value.

### The Illusion of Choice

Having unlimited options sounds liberating. In practice, it often leads to commitment hesitation and the persistent feeling that someone "better" might be just one more swipe away.

## Enter Slow Dating

The concept is simple: fewer, higher-quality matches with more context and intentionality. Here''s how it works:

### 1. Curated Matching

Instead of algorithms based on photos and witty bios, slow dating relies on deeper compatibility factors:
- Values and life goals
- Communication styles
- Lifestyle compatibility
- Verified backgrounds

### 2. One Match at a Time

Focusing on one potential connection allows you to be fully present. No parallel conversations. No keeping options open. Just genuine exploration.

### 3. Real-World First

Skip weeks of texting that may or may not lead anywhere. Meet in curated settings designed for genuine conversation.

## The Experience

When you join a slow dating program:

1. Complete a comprehensive compatibility profile
2. Meet with a matchmaker who understands nuance
3. Receive one carefully selected match
4. Meet at a planned venue and time
5. Provide feedback to refine future matches

## Is It Worth It?

The success rate of intentional matchmaking far exceeds that of app-based dating. When both parties are invested, vetted, and aligned on intentions, magic can happen.

## Our Approach

Our slow dating program connects members who are serious about finding partnership. No games, no ghosting, no endless small talk. Just two people who''ve been thoughtfully matched, meeting in beautiful settings, with the space to discover genuine connection.

The future of dating isn''t faster. It''s slower, deeper, and infinitely more rewarding.',
  'Dating',
  ARRAY['dating', 'relationships', 'love', 'lifestyle', 'matchmaking'],
  'https://images.unsplash.com/photo-1511306404404-ad607bd7c601?w=800',
  true,
  (CURRENT_DATE - INTERVAL '20 days')::timestamp with time zone,
  7,
  891
),
(
  'j1000000-0000-0000-0000-000000000004',
  'building-your-personal-board-of-directors',
  'Building Your Personal Board of Directors',
  'The most successful people don''t navigate life alone. Learn how to assemble your own advisory council.',
  '# Building Your Personal Board of Directors

Every Fortune 500 company has a board of directors – trusted advisors who provide guidance, accountability, and different perspectives. Why shouldn''t you have one too?

## What is a Personal Board?

Think of it as your inner circle of advisors. Not friends who tell you what you want to hear, but people who:
- Challenge your assumptions
- Expand your perspective
- Hold you accountable
- Open doors you didn''t know existed
- Support you through difficulties

## The Five Seats on Your Board

### 1. The Mentor

Someone 10-20 years ahead in your journey who''s walked the path you''re walking. They see around corners you can''t yet see.

**How to find them:** Professional associations, executive coaching networks, or simply asking someone you admire for a coffee.

### 2. The Peer

Someone at your level facing similar challenges. You learn together, share honestly, and push each other.

**How to find them:** Mastermind groups, peer learning circles, or professional networks at your career stage.

### 3. The Connector

Someone with an expansive network who thinks of you when opportunities arise. They know everyone and love making introductions.

**How to find them:** Community builders, event organizers, and natural networkers you meet at industry events.

### 4. The Expert

Someone with deep expertise in an area crucial to your success. They help you make better decisions in their domain.

**How to find them:** Industry conferences, specialized professional groups, or through your existing network''s referrals.

### 5. The Coach

Someone focused on your growth and development who asks better questions than they give answers.

**How to find them:** Professional coaching organizations, recommendations from successful peers, or executive coaching programs.

## Maintaining Your Board

- **Schedule regular check-ins** – quarterly for most members, monthly for your closest advisor
- **Come prepared** – have specific questions or challenges to discuss
- **Give back** – even to those "above" you, you have value to offer
- **Update your composition** – as you evolve, so should your board

## The Meta-Board

The most successful people have boards for different aspects of life:
- Career board
- Personal development board
- Health and wellness advisors
- Financial advisors

## Start Today

You don''t need to formalize this immediately. Start by identifying who already plays these roles in your life, however informally. Then look at the gaps and start filling them intentionally.

Your success is not a solo journey. Build the team that helps you win.',
  'Career',
  ARRAY['career', 'mentorship', 'networking', 'personal-development', 'success'],
  'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800',
  true,
  (CURRENT_DATE - INTERVAL '30 days')::timestamp with time zone,
  9,
  724
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. SAMPLE GALLERY ITEMS
-- =====================================================

INSERT INTO public.gallery_items (id, image_url, caption, order_index, event_id)
VALUES
  ('g1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Networking event at sunset rooftop', 1, NULL),
  ('g1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', 'Wine tasting experience', 2, NULL),
  ('g1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800', 'Business breakfast networking', 3, NULL),
  ('g1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1529543544277-750e1a7fcf74?w=800', 'Private dinner experience', 4, NULL),
  ('g1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'Culinary masterclass', 5, NULL),
  ('g1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800', 'Members celebrating', 6, NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. SAMPLE NEWSLETTER SUBSCRIBERS
-- =====================================================

INSERT INTO public.newsletter_subscribers (email, source, is_active)
VALUES
  ('newsletter1@example.com', 'website', true),
  ('newsletter2@example.com', 'event', true),
  ('newsletter3@example.com', 'referral', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. MEETUP STATS (for social proof)
-- =====================================================

INSERT INTO public.meetup_stats (member_count, previous_member_count, joined_this_week, rating, avatar_urls)
VALUES (
  2847,
  2801,
  46,
  4.8,
  ARRAY[
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
  ]
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTE: User-related data (profiles, memberships, etc.)
-- must be created through Supabase Auth first.
-- The handle_new_user() trigger automatically creates
-- profile and membership records when users sign up.
-- =====================================================

-- To create test users, use Supabase Dashboard or:
-- 1. Sign up through the app with test emails
-- 2. Or use supabase auth admin API

SELECT 'Seed data inserted successfully!' as status;
