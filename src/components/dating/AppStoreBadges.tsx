import { APP_STORE_URLS } from '@/lib/deep-link-handler';
import appStoreBadge from '@/assets/app-store-badge.svg';
import googlePlayBadge from '@/assets/google-play-badge.png';

interface AppStoreBadgesProps {
  comingSoon?: boolean;
  className?: string;
}

export function AppStoreBadges({ comingSoon = true, className = '' }: AppStoreBadgesProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className}`}>
      {/* App Store Badge */}
      <a 
        href={comingSoon ? undefined : APP_STORE_URLS.ios}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative group ${comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={(e) => comingSoon && e.preventDefault()}
      >
        <div className={`relative ${comingSoon ? 'opacity-70' : 'opacity-100'} transition-all duration-300 ${!comingSoon && 'group-hover:scale-105'}`}>
          <img 
            src={appStoreBadge} 
            alt="Download on the App Store"
            className="h-[40px] md:h-[48px] w-auto"
          />
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
        <div className={`relative ${comingSoon ? 'opacity-70' : 'opacity-100'} transition-all duration-300 ${!comingSoon && 'group-hover:scale-105'}`}>
          <img 
            src={googlePlayBadge} 
            alt="Get it on Google Play"
            className="h-[58px] md:h-[70px] w-auto -my-2"
          />
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
