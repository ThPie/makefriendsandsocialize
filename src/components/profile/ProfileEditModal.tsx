
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSection?: 'basic' | 'professional' | 'photos';
}

export function ProfileEditModal({ isOpen, onClose, initialSection = 'basic' }: ProfileEditModalProps) {
    const { user, profile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        job_title: '',
        company: '',
        industry: '',
        linkedin_url: '',
        city: '',
        country: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                bio: profile.bio || '',
                job_title: profile.job_title || '',
                company: profile.company || '',
                industry: profile.industry || '',
                linkedin_url: profile.linkedin_url || '',
                city: profile.city || '',
                country: profile.country || '',
            });
        }
    }, [profile, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profile updated successfully');
            onClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-[#1a231b] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Edit Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#1a5b2a] uppercase tracking-wider">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 focus:border-[#1a5b2a] min-h-[100px]"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#1a5b2a] uppercase tracking-wider">Professional</h3>
                        <div className="space-y-2">
                            <Label htmlFor="job_title">Job Title</Label>
                            <Input
                                id="job_title"
                                name="job_title"
                                value={formData.job_title}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                            <Input
                                id="linkedin_url"
                                name="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={handleChange}
                                className="bg-white/5 border-white/10 focus:border-[#1a5b2a]"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#1a5b2a] hover:bg-[#1a5b2a]/90 text-white">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
