import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Upload, Plus, X, MapPin, Globe, Mail } from "lucide-react";
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

    return (
        <form onSubmit={onSubmit} className="space-y-8">
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
                            Recommended: Square image, at least 200x200px
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
                            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                            placeholder="Your Business Name"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="e.g., Technology, Consulting, Design"
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="City, Country"
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://www.example.com"
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
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
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
