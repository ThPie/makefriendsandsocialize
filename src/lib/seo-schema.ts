import { getBaseDomain, isSlowDatingSubdomain } from '@/lib/subdomain-utils';

// Helper to get current site URL
const getSiteUrl = () => {
    // Check if we are in a browser environment
    if (typeof window === 'undefined') return 'https://makefriendsandsocialize.com';

    const baseDomain = getBaseDomain();
    const subdomain = isSlowDatingSubdomain() ? 'slowdating.' : '';
    return `https://${subdomain}${baseDomain}`;
};

// Helper to convert "7:00 PM" to "19:00:00"
function convertTo24Hour(timeStr: string): string {
    try {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    } catch (e) {
        return '19:00:00';
    }
}

export const generateOrganizationSchema = () => {
    const siteUrl = getSiteUrl();
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MakeFriends Social Club",
        "url": siteUrl,
        "logo": "https://lovable.dev/opengraph-image-p98pqg.png",
        "description": "A private social club for professionals in NYC offering curated events and matchmaking.",
        "sameAs": [
            "https://instagram.com/makefriendsandsocialize",
            "https://www.meetup.com/makefriendsandsocialize"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "New York",
            "addressRegion": "NY",
            "addressCountry": "US"
        }
    };
};

export const generateEventSchema = (event: any) => {
    const siteUrl = getSiteUrl();
    // Construct start date/time ISO string
    const startDate = event.time
        ? `${event.date}T${convertTo24Hour(event.time)}`
        : `${event.date}T19:00:00`;

    return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.title,
        "startDate": startDate,
        "endDate": startDate,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
            "@type": "Place",
            "name": event.venue_name || event.location || "Private Venue",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": event.city || "New York",
                "addressRegion": "NY",
                "addressCountry": "US"
            }
        },
        "image": [
            event.image_url || "https://lovable.dev/opengraph-image-p98pqg.png"
        ],
        "description": event.description,
        "offers": {
            "@type": "Offer",
            "url": `${siteUrl}/events/${event.id}`,
            "price": "0",
            "priceCurrency": "USD",
            "availability": event.capacity && event.rsvp_count >= event.capacity
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock"
        },
        "organizer": {
            "@type": "Organization",
            "name": "MakeFriends Social Club",
            "url": siteUrl
        }
    };
};

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => {
    const siteUrl = getSiteUrl();
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${siteUrl}${item.item}`
        }))
    };
};
