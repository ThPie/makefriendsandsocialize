# Architecture Recommendations for 400K Users

## Overview

This document outlines the architecture optimizations implemented and recommended for scaling to 400,000 users without moving to microservices.

## Current Implementation

### 1. Database Caching Strategy

We've implemented a hybrid caching strategy using:

#### Client-Side Memory Cache
- In-memory JavaScript Map for instant access
- Automatic TTL management
- Cache invalidation on demand

#### Database-Backed Cache (PostgreSQL)
- `cache_metadata` table for persistent caching
- Functions: `get_cached_data()`, `set_cached_data()`, `cleanup_expired_cache()`
- Edge functions can populate cache with proper TTLs

#### Cache TTLs by Data Type
| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Homepage Stats | 15 min | Infrequent changes, high read volume |
| Event Listings | 5 min | Moderate change frequency |
| Blog Posts | 1 hour | Rarely change after publish |
| Business Directory | 10 min | Moderate change frequency |

### 2. Database Indexes

Created indexes for common query patterns at scale:

```sql
-- Journal/Blog
idx_journal_posts_published (is_published, published_at DESC)
idx_journal_posts_category (category)
idx_journal_posts_tags (USING GIN)
idx_blog_comments_post (post_id, created_at DESC)
idx_blog_likes_post (post_id)
idx_blog_bookmarks_user (user_id)

-- Events
idx_events_date_status (date, status)
idx_events_featured (is_featured) WHERE is_featured = true

-- Business
idx_business_profiles_visible (is_visible, status)

-- Users & Dating
idx_profiles_onboarding (onboarding_completed)
idx_dating_profiles_active (is_active, status)
idx_memberships_active (user_id, status) WHERE status = 'active'

-- Notifications
idx_notification_queue_pending (status, created_at) WHERE status = 'pending'
```

### 3. Connection Pooling

Supabase handles connection pooling automatically via PgBouncer. For 400K users:

**Recommended Settings (in Supabase Dashboard):**
- Pool Mode: Transaction (default, recommended)
- Pool Size: 15-20 connections per region
- Enable Statement caching

### 4. Edge Functions for Heavy Operations

All CPU/network-intensive operations use Edge Functions:
- OSINT scanning
- Email sending
- Match computation
- Lead discovery

## Recommended CDN Setup (Cloudflare)

### Step 1: Add Cloudflare to Domain
1. Create Cloudflare account
2. Add your domain
3. Update nameservers at registrar
4. Enable "Full (Strict)" SSL mode

### Step 2: Configure Caching Rules
```
Page Rules:
1. *.lovable.app/api/* - Cache Level: Bypass
2. *.lovable.app/static/* - Cache Level: Standard, Edge TTL: 1 month
3. *.lovable.app/*.js - Cache Level: Standard, Edge TTL: 1 week
4. *.lovable.app/*.css - Cache Level: Standard, Edge TTL: 1 week
5. *.lovable.app/images/* - Cache Level: Standard, Edge TTL: 1 month
```

### Step 3: Enable Additional Features
- Auto Minify: JavaScript, CSS, HTML
- Brotli Compression: On
- HTTP/3 (QUIC): On
- Early Hints: On
- Rocket Loader: Off (conflicts with React)

### Step 4: Firewall Rules
```
Rate Limiting:
- API endpoints: 100 requests per minute per IP
- Auth endpoints: 5 requests per minute per IP
- Form submissions: 10 per minute per IP
```

## Performance Targets at 400K Users

| Metric | Target | Current |
|--------|--------|---------|
| Page Load (TTI) | < 2s | Monitor |
| API Response (p95) | < 200ms | Monitor |
| Database Query (p95) | < 50ms | Monitor |
| Edge Function (p95) | < 500ms | Monitor |

## Monitoring Recommendations

1. **Supabase Dashboard**: Monitor database metrics
2. **Cloudflare Analytics**: CDN performance
3. **Browser DevTools**: Core Web Vitals
4. **Custom Logging**: Edge function performance

## Scaling Triggers

Consider additional optimization if:
- Database CPU > 70% sustained
- Connection pool saturation > 80%
- API latency p95 > 500ms
- Error rate > 1%

## Why Monolith Works at 400K

At 400K users, you likely have:
- ~10K daily active users
- ~50K page views/day
- ~5K API calls/minute peak

This load is well within a single Supabase instance capability when:
- Proper indexing is in place ✓
- Caching reduces read load ✓
- Heavy operations are async (Edge Functions) ✓
- CDN handles static assets ✓

Microservices add complexity that isn't justified until:
- >1M active users
- Team size >20 developers
- Distinct scaling requirements per service
