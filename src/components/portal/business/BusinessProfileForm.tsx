import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Upload, Plus, X, MapPin, Globe, Mail, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const BUSINESS_CATEGORIES = [
    'Technology',
    'Finance',
    'Fashion',
    'Health',
    'Food & Beverage',
    'Professional Services',
    'Real Estate',
    'Other'
];

interface BusinessProfileFormProps {
    formData: {
        business_name: string;
        description: string;
        industry: string;
        category: string;
        website: string;
        contact_email: string;
        location: string;
        services: string[];
        logo_url: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    isUploading: boolean;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    newService: string;
    setNewService: (value: string) => void;
    addService: () => void;
    removeService: (service: string) => void;
    isEdit?: boolean;
}

export const BusinessProfileForm = ({
    formData,
    setFormData,
    onSubmit,
    isSaving,
    isUploading,
    handleLogoUpload,
    newService,
    setNewService,
    addService,
    removeService,
    isEdit = false,
}: BusinessProfileFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isScraping, setIsScraping] = useState(false);
    const [scraped, setScraped] = useState(false);
    const [websiteUrl, setWebsiteUrl] = useState(formData.website || "");

    const handleScrapeWebsite = async () => {
        if (!websiteUrl.trim()) {
            toast.error("Please enter a website URL");
            return;
        }

        setIsScraping(true);
        setScraped(false);
        try {
            const { data, error } = await supabase.functions.invoke('scrape-business-website', {
                body: { url: websiteUrl.trim() },
            });

            if (error) throw error;

            // Autofill form with scraped data (only fill empty fields)
            setFormData((prev: typeof formData) => ({
                ...prev,
                website: data.website || prev.website || websiteUrl,
                business_name: data.business_name || prev.business_name,
                description: data.description || prev.description,
                industry: data.industry || prev.industry,
                logo_url: data.logo_url || prev.logo_url,
                location: data.location || prev.location,
                services: data.services?.length ? data.services : prev.services,
            }));

            setScraped(true);
            toast.success("Website info extracted! Review and edit the details below.");
        } catch (err) {
            console.error('Scrape error:', err);
            toast.error("Could not extract website info. Please fill in the details manually.");
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {/* Website URL - First Step */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-2">
                    {isEdit ? "Website" : "Get Started"}
                </h2>
                {!isEdit && (
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your website URL and we'll automatically fill in your business details.
                    </p>
                )}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={websiteUrl}
                            onChange={(e) => {
                                setWebsiteUrl(e.target.value);
                                setFormData((prev: typeof formData) => ({ ...prev, website: e.target.value }));
                                setScraped(false);
                            }}
                            placeholder="https://www.yourbusiness.com"
                            className="pl-10"
                        />
                    </div>
                    <Button
                        type="button"
                        variant={scraped ? "outline" : "default"}
                        onClick={handleScrapeWebsite}
                        disabled={isScraping || !websiteUrl.trim()}
                        className="min-w-[140px]"
                    >
                        {isScraping ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Scanning...
                            </>
                        ) : scraped ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Scanned
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Auto-Fill
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Logo */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Business Logo</h2>
                <div className="flex items-center gap-6">
                    {formData.logo_url ? (
                        <img
                            src={formData.logo_url}
                            alt="Business logo"
                            className="w-24 h-24 rounded-xl object-contain bg-muted"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-primary" />
                        </div>
                    )}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Upload Logo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.logo_url ? "Logo detected from website. You can replace it." : "Recommended: Square image, at least 200x200px"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Basic Information</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="business_name">Business Name *</Label>
                        <Input
                            id="business_name"
                            value={formData.business_name}
                            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, business_name: e.target.value }))}
                            placeholder="Your Business Name"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, industry: e.target.value }))}
                            placeholder="e.g., Technology, Consulting, Design"
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {BUSINESS_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, description: e.target.value }))}
                            placeholder="Tell us about your business..."
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {formData.description.length}/500 characters
                        </p>
                    </div>
                </div>
            </div>

            {/* Services */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Services</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {formData.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                            {service}
                            <button
                                type="button"
                                onClick={() => removeService(service)}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="Add a service..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    />
                    <Button type="button" variant="outline" onClick={addService}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Contact Information</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, location: e.target.value }))}
                                placeholder="City, Country"
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, contact_email: e.target.value }))}
                                placeholder="business@example.com"
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="min-w-[150px]"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isEdit ? "Save Changes" : "Submit for Review"}
                </Button>
            </div>
        </form>
    );
};
