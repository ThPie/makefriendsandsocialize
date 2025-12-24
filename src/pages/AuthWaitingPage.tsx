import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function AuthWaitingPage() {
  const navigate = useNavigate();
  const { user, applicationStatus, membership, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    
    // If approved, redirect to portal
    if (applicationStatus === 'approved' || membership?.status === 'active') {
      navigate('/portal');
    }
  }, [user, applicationStatus, membership, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="mb-8">
          {applicationStatus === 'rejected' ? (
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="h-10 w-10 text-destructive" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-secondary-foreground mb-4">
          {applicationStatus === 'rejected' 
            ? 'Application Not Accepted'
            : 'Application Received'
          }
        </h1>

        <p className="text-muted-foreground text-lg mb-8">
          {applicationStatus === 'rejected' ? (
            'We appreciate your interest, but we are unable to offer membership at this time. We wish you the very best.'
          ) : (
            'Thank you for applying to The Gathering Society. Our membership committee is reviewing your application with the care it deserves. We will be in touch within 48 hours.'
          )}
        </p>

        {applicationStatus !== 'rejected' && (
          <div className="bg-card rounded-lg p-6 mb-8">
            <h3 className="font-display text-xl text-card-foreground mb-4">What Happens Next</h3>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">Committee Review</p>
                  <p className="text-muted-foreground text-sm">Our team carefully reviews each application</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">Personal Invitation</p>
                  <p className="text-muted-foreground text-sm">You'll receive an email with your membership details</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">Access Granted</p>
                  <p className="text-muted-foreground text-sm">Begin your journey with exclusive access to events and introductions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/">Return to Homepage</Link>
          </Button>
          <Button asChild>
            <Link to="/events">Browse Upcoming Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
