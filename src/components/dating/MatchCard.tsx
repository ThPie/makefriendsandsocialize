import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ADMIN_BASE } from '@/lib/route-paths';

interface DatingProfile {
  id: string;
  display_name: string;
  age: number;
  gender: string;
  location: string | null;
  occupation: string | null;
}

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
  status: string;
  matched_profile?: DatingProfile;
}

interface MatchCardProps {
  match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  const profile = match.matched_profile;

  if (!profile) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    if (score >= 75) return "bg-green-500/20 text-green-500 border-green-500/30";
    return "bg-blue-500/20 text-blue-500 border-blue-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Great";
    return "Good";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border/50">
      <CardContent className="p-0">
        {/* Header with score */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{profile.display_name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.age} • {profile.gender}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Badge className={`text-lg font-bold px-3 py-1 ${getScoreColor(match.compatibility_score)}`}>
              {match.compatibility_score}%
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{getScoreLabel(match.compatibility_score)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          {(profile.location || profile.occupation) && (
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile.occupation}
                </span>
              )}
            </div>
          )}

          {/* Match reason */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <p className="text-sm text-foreground italic">"{match.match_reason}"</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/admin/dating/${profile.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
