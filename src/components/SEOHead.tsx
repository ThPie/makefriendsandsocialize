import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  event?: {
    name: string;
    startDate: string;
    endDate?: string;
    location?: {
      name: string;
      address?: string;
    };
    description?: string;
    image?: string;
    organizer?: string;
  };
  noIndex?: boolean;
}

const BASE_URL = 'https://makefriends.social';
const DEFAULT_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';
const SITE_NAME = 'MakeFriends Social Club';

export function SEOHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = 'website',
  article,
  event,
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullUrl = `${BASE_URL}${location.pathname}`;
  const fullDescription = description || 'A private social club for professionals who value authentic connections.';

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    updateMetaTag('description', fullDescription);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', fullDescription, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', SITE_NAME, 'property');

    // Twitter
    updateMetaTag('twitter:title', fullTitle, 'name');
    updateMetaTag('twitter:description', fullDescription, 'name');
    updateMetaTag('twitter:image', image, 'name');
    updateMetaTag('twitter:card', 'summary_large_image', 'name');

    // Article specific
    if (article) {
      if (article.publishedTime) {
        updateMetaTag('article:published_time', article.publishedTime, 'property');
      }
      if (article.modifiedTime) {
        updateMetaTag('article:modified_time', article.modifiedTime, 'property');
      }
      if (article.author) {
        updateMetaTag('article:author', article.author, 'property');
      }
      if (article.section) {
        updateMetaTag('article:section', article.section, 'property');
      }
    }

    // Update canonical link
    updateLinkTag('canonical', fullUrl);

    // Add structured data
    if (event) {
      addEventStructuredData(event);
    } else if (article) {
      addArticleStructuredData({
        headline: title || '',
        description: fullDescription,
        image,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime,
        author: article.author,
        url: fullUrl,
      });
    }

    // Cleanup function to remove added structured data
    return () => {
      const dynamicScripts = document.querySelectorAll('script[data-dynamic-ld]');
      dynamicScripts.forEach((script) => script.remove());
    };
  }, [title, description, image, type, article, event, noIndex, fullTitle, fullDescription, fullUrl]);

  return null;
}

function updateMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}

function addEventStructuredData(event: NonNullable<SEOProps['event']>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    description: event.description,
    image: event.image,
    location: event.location ? {
      '@type': 'Place',
      name: event.location.name,
      address: event.location.address,
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: event.organizer || 'MakeFriends Social Club',
      url: BASE_URL,
    },
  };

  addStructuredData(schema);
}

function addArticleStructuredData(article: {
  headline: string;
  description: string;
  image: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || 'MakeFriends Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MakeFriends Social Club',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };

  addStructuredData(schema);
}

function addStructuredData(schema: Record<string, unknown>) {
  // Remove existing dynamic structured data
  const existing = document.querySelector('script[data-dynamic-ld]');
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic-ld', 'true');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export default SEOHead;
