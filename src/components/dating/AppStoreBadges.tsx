import { APP_STORE_URLS } from '@/lib/deep-link-handler';

interface AppStoreBadgesProps {
  comingSoon?: boolean;
  className?: string;
}

export function AppStoreBadges({ comingSoon = true, className = '' }: AppStoreBadgesProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      {/* App Store Badge */}
      <a 
        href={comingSoon ? undefined : APP_STORE_URLS.ios}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative group ${comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={(e) => comingSoon && e.preventDefault()}
      >
        <div className={`relative ${comingSoon ? 'opacity-60 grayscale' : 'opacity-100'} transition-all duration-300 ${!comingSoon && 'group-hover:scale-105'}`}>
          <svg 
            width="140" 
            height="42" 
            viewBox="0 0 140 42" 
            className="drop-shadow-md"
            aria-label="Download on the App Store"
          >
            <rect width="140" height="42" rx="6" fill="#000"/>
            <text x="70" y="14" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="system-ui, -apple-system, sans-serif">
              Download on the
            </text>
            <text x="70" y="29" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">
              App Store
            </text>
          </svg>
        </div>
        {comingSoon && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow-md">
            Soon
          </span>
        )}
      </a>

      {/* Google Play Badge */}
      <a 
        href={comingSoon ? undefined : APP_STORE_URLS.android}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative group ${comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={(e) => comingSoon && e.preventDefault()}
      >
        <div className={`relative ${comingSoon ? 'opacity-60 grayscale' : 'opacity-100'} transition-all duration-300 ${!comingSoon && 'group-hover:scale-105'}`}>
          <svg 
            width="140" 
            height="42" 
            viewBox="0 0 140 42" 
            className="drop-shadow-md"
            aria-label="Get it on Google Play"
          >
            <rect width="140" height="42" rx="6" fill="#000"/>
            <text x="70" y="14" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="system-ui, -apple-system, sans-serif">
              GET IT ON
            </text>
            <text x="70" y="29" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">
              Google Play
            </text>
          </svg>
        </div>
        {comingSoon && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow-md">
            Soon
          </span>
        )}
      </a>
    </div>
  );
}
