import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    twitterCard?: 'summary' | 'summary_large_image';
    schema?: object | object[];
}

export const SEO = ({
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    schema,
}: SEOProps) => {
    const siteTitle = 'MakeFriends | Private Social Club for Professionals';
    const fullTitle = title ? `${title} | MakeFriends` : siteTitle;
    const defaultDescription = 'A private social club for professionals who value authentic connections. Weekly curated events, vetted members, and meaningful business connections.';
    const defaultKeywords = 'private social club, professional networking, social networking NYC, curated events, business connections';
    const siteUrl = 'https://makefriendsandsocialize.com';
    const fullDescription = description || defaultDescription;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonical || siteUrl} />
            <meta name="robots" content="index, follow, all" />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || fullDescription} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonical || siteUrl} />
            <meta property="og:image" content={ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png'} />
            <meta property="og:site_name" content="MakeFriends Social Club" />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            <meta name="twitter:description" content={ogDescription || fullDescription} />
            <meta name="twitter:image" content={ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png'} />

            {/* Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
                </script>
            )}
        </Helmet>
    );
};
