import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Check, Camera, X } from 'lucide-react';
import { PushNotificationToggle } from '@/components/portal/PushNotificationToggle';

const INTERESTS = [
  'Art & Culture', 'Wine & Dining', 'Travel', 'Fashion', 'Architecture',
  'Literature', 'Music', 'Philanthropy', 'Entrepreneurship', 'Wellness'
];

const BRANDS = [
  'Hermès', 'Loro Piana', 'Brunello Cucinelli', 'Tom Ford', 'Ralph Lauren',
  'Zegna', 'Dior', 'Chanel', 'Gucci', 'Prada'
];

export default function PortalProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [valuesInPartner, setValuesInPartner] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setSignatureStyle(profile.signature_style || '');
      setSelectedBrands(profile.favorite_brands || []);
      setValuesInPartner(profile.values_in_partner || '');
      setSelectedInterests(profile.interests || []);
      setAvatarUrls(profile.avatar_urls || []);
      setIsVisible(profile.is_visible || false);
      setCountry(profile.country || '');
      setState(profile.state || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        bio,
        signature_style: signatureStyle,
        favorite_brands: selectedBrands,
        values_in_partner: valuesInPartner,
        interests: selectedInterests,
        avatar_urls: avatarUrls,
        is_visible: isVisible,
        country,
        state,
        city,
      })
      .eq('id', user.id);

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    await refreshProfile();
    toast.success('Profile updated successfully');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (avatarUrls.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setAvatarUrls(prev => [...prev, publicUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const urlToRemove = avatarUrls[index];
    
    // Extract file path from URL for deletion
    try {
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split('/profile-photos/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage
          .from('profile-photos')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    setAvatarUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || 'M';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Craft your digital identity for Make Friends and Socialize
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Existing photos */}
              {avatarUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Avatar className="h-32 w-32 rounded-lg">
                    <AvatarImage src={url} className="object-cover" />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {avatarUrls.length < 3 && (
                <label className="h-32 w-32 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Upload up to 3 high-quality photos. Portrait orientation recommended.
            </p>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell fellow members about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Style Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">My Signature Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="signatureStyle">Describe Your Style</Label>
              <Textarea
                id="signatureStyle"
                placeholder="Timeless elegance with a modern edge..."
                value={signatureStyle}
                onChange={(e) => setSignatureStyle(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Brands That Resonate</Label>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedBrands.includes(brand)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent text-foreground border-border hover:border-primary'
                    }`}
                  >
                    {brand}
                    {selectedBrands.includes(brand) && <Check className="inline ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values & Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Values & Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="values">What I Value in a Connection</Label>
              <Textarea
                id="values"
                placeholder="Intellectual curiosity, shared appreciation for the finer things..."
                value={valuesInPartner}
                onChange={(e) => setValuesInPartner(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent text-foreground border-border hover:border-primary'
                    }`}
                  >
                    {interest}
                    {selectedInterests.includes(interest) && <Check className="inline ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="California"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Los Angeles"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your location helps us connect you with nearby members and events.
            </p>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-foreground font-medium">Make my profile visible to other members</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, Fellow and Founder members can discover your profile
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <PushNotificationToggle />

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
