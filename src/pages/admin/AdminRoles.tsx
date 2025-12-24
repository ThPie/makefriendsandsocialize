import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Shield, Search, UserPlus, Trash2, Loader2, Users } from 'lucide-react';

interface UserWithRole {
  id: string;
  role: 'admin' | 'member';
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export default function AdminRoles() {
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      setAllProfiles(profilesData || []);

      const users = (rolesData || []).map((role) => {
        const profile = profilesData?.find(p => p.id === role.user_id);
        return {
          id: role.user_id,
          role: role.role as 'admin' | 'member',
          created_at: role.created_at,
          profile: profile ? { first_name: profile.first_name, last_name: profile.last_name } : undefined,
        };
      });

      setUsersWithRoles(users);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', selectedUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (existing) {
        toast.error('User is already an admin');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUserId, role: 'admin' });

      if (error) throw error;

      toast.success('Admin role assigned successfully');
      setIsDialogOpen(false);
      setSelectedUserId('');
      fetchData();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin access from this user?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success('Admin role removed');
      fetchData();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const getUserDisplayName = (user: UserWithRole) => {
    if (user.profile?.first_name || user.profile?.last_name) {
      return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
    }
    return user.id.slice(0, 8) + '...';
  };

  const filteredUsers = usersWithRoles.filter((user) => {
    const name = getUserDisplayName(user).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || user.id.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">User Roles</h1>
          <p className="text-muted-foreground mt-1">Manage admin access</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Admin Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignRole} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.first_name || profile.last_name
                          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                          : profile.id.slice(0, 8) + '...'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedUserId}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign Admin'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{usersWithRoles.length}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No admins found' : 'No administrators yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{getUserDisplayName(user)}</p>
                      <p className="text-xs text-muted-foreground">Since {format(new Date(user.created_at), 'PP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/10 text-red-500">Admin</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRole(user.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
