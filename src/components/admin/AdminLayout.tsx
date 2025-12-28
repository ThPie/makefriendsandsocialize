import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  LogOut,
  Loader2,
  ArrowLeft,
  Shield,
  Calendar,
  Image,
  Settings,
  UserCog,
  Quote,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Applications', url: '/admin/applications', icon: FileText },
  { title: 'Members', url: '/admin/members', icon: Users },
  { title: 'Slow Dating', url: '/admin/dating', icon: Sparkles },
  { title: 'Events', url: '/admin/events', icon: Calendar },
  { title: 'Connections', url: '/admin/connections', icon: Heart },
  { title: 'Testimonials', url: '/admin/testimonials', icon: Quote },
  { title: 'Content', url: '/admin/content', icon: Image },
  { title: 'Roles', url: '/admin/roles', icon: UserCog },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    
    if (!isLoading && user && !isAdmin) {
      navigate('/portal');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h1 className="font-display text-xl text-foreground">Admin</h1>
                <p className="text-xs text-muted-foreground">Make Friends and Socialize</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-6 pt-6 border-t border-border">
              <Link
                to="/portal"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Portal</span>
              </Link>
            </div>
          </SidebarContent>

          <div className="p-4 mt-auto border-t border-border">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 flex items-center h-16 px-4 border-b border-border bg-background/95 backdrop-blur md:hidden">
            <SidebarTrigger />
            <span className="ml-4 font-display text-lg">Admin Dashboard</span>
          </header>

          <div className="p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
