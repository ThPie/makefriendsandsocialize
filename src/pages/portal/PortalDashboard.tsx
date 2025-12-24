import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Calendar, Heart, Crown, ArrowRight } from 'lucide-react';
import { SubmitReview } from '@/components/portal/SubmitReview';

export default function PortalDashboard() {
  const { profile, membership, canAccessMatchmaking } = useAuth();

  const quickActions = [
    {
      title: 'Complete Your Profile',
      description: 'Add photos and refine your style profile',
      icon: User,
      href: '/portal/profile',
      show: true,
    },
    {
      title: 'Browse The Network',
      description: canAccessMatchmaking 
        ? 'Discover like-minded members'
        : 'Upgrade to Fellow to access introductions',
      icon: Users,
      href: '/portal/network',
      show: true,
      locked: !canAccessMatchmaking,
    },
    {
      title: 'Your Connections',
      description: canAccessMatchmaking 
        ? 'View your introduction requests'
        : 'Upgrade to unlock member introductions',
      icon: Heart,
      href: '/portal/connections',
      show: canAccessMatchmaking,
      locked: !canAccessMatchmaking,
    },
    {
      title: 'Upcoming Events',
      description: 'RSVP to exclusive gatherings',
      icon: Calendar,
      href: '/portal/events',
      show: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Welcome back, {profile?.first_name || 'Member'}
        </h1>
        <p className="text-muted-foreground">
          Your exclusive access to Make Friends and Socialize
        </p>
      </div>

      {/* Upgrade Banner for Patrons */}
      {membership?.tier === 'patron' && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">Unlock The Network</h3>
                <p className="text-muted-foreground text-sm">
                  Upgrade to Fellow membership to access curated introductions
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/membership">
                Upgrade Membership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.filter(a => a.show).map((action) => (
          <Card 
            key={action.title}
            className={`group hover-lift transition-all ${
              action.locked ? 'opacity-75' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${
                  action.locked ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  <action.icon className={`h-6 w-6 ${
                    action.locked ? 'text-muted-foreground' : 'text-primary'
                  }`} />
                </div>
                {action.locked && (
                  <Crown className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="font-display text-xl">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {action.description}
              </p>
              <Button 
                asChild 
                variant={action.locked ? 'outline' : 'default'}
                className="w-full"
              >
                <Link to={action.locked ? '/membership' : action.href}>
                  {action.locked ? 'Upgrade to Access' : 'View'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Completion */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  profile.avatar_urls?.length ? 'bg-primary' : 'bg-muted'
                }`}>
                  {profile.avatar_urls?.length ? (
                    <span className="text-primary-foreground text-xs">✓</span>
                  ) : null}
                </div>
                <span className={profile.avatar_urls?.length ? 'text-foreground' : 'text-muted-foreground'}>
                  Profile photos uploaded
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  profile.signature_style ? 'bg-primary' : 'bg-muted'
                }`}>
                  {profile.signature_style ? (
                    <span className="text-primary-foreground text-xs">✓</span>
                  ) : null}
                </div>
                <span className={profile.signature_style ? 'text-foreground' : 'text-muted-foreground'}>
                  Signature style defined
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  profile.bio ? 'bg-primary' : 'bg-muted'
                }`}>
                  {profile.bio ? (
                    <span className="text-primary-foreground text-xs">✓</span>
                  ) : null}
                </div>
                <span className={profile.bio ? 'text-foreground' : 'text-muted-foreground'}>
                  Bio written
                </span>
              </div>
            </div>
            {(!profile.avatar_urls?.length || !profile.signature_style || !profile.bio) && (
              <Button asChild variant="outline" className="mt-6">
                <Link to="/portal/profile">
                  Complete Your Profile
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Review */}
      <SubmitReview />
    </div>
  );
}
