import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface MemberAvatarsProps {
  avatarUrls: string[];
  memberCount: number;
  isLoading?: boolean;
}

export const MemberAvatars = ({ avatarUrls, memberCount, isLoading }: MemberAvatarsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="flex -space-x-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-full bg-white/20 border-2 border-white/30"
            />
          ))}
        </div>
        <div className="h-5 w-32 bg-white/20 rounded" />
      </div>
    );
  }

  const displayAvatars = avatarUrls.slice(0, 5);
  const remainingCount = memberCount > 5 ? memberCount - 5 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-3">
        {displayAvatars.map((url, index) => (
          <Avatar
            key={index}
            className="h-10 w-10 border-2 border-white/80 shadow-lg ring-2 ring-black/10 transition-transform hover:scale-110 hover:z-10"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <AvatarImage
              src={url}
              alt={`Member ${index + 1}`}
              loading="eager"
              decoding="async"
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs font-medium">
              <Users className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-primary text-primary-foreground text-xs font-bold shadow-lg">
            +{remainingCount > 999 ? '999+' : remainingCount}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white drop-shadow-md">
          {memberCount.toLocaleString()}+ Members
        </span>
        <span className="text-sm text-white/80 drop-shadow-sm">Join our community</span>
      </div>
    </div>
  );
};
