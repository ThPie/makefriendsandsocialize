import React from 'react';
import { Helmet } from 'react-helmet-async';

export const JsonLd = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://www.makefriendsandsocialize.com/#organization",
                "name": "Make Friends and Socialize",
                "url": "https://www.makefriendsandsocialize.com",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.makefriendsandsocialize.com/logo.png"
                },
                "sameAs": [
                    "https://www.instagram.com/makefriendsandsocialize",
                    "https://www.facebook.com/makefriendsandsocialize"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "https://www.makefriendsandsocialize.com/#website",
                "url": "https://www.makefriendsandsocialize.com",
                "name": "Make Friends and Socialize",
                "description": "Premium social club and curated events for meaningful connections.",
                "publisher": {
                    "@id": "https://www.makefriendsandsocialize.com/#organization"
                }
            }
        ]
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};
