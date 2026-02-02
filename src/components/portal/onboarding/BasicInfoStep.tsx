import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Camera, Loader2, MapPin } from 'lucide-react';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';

interface BasicInfoStepProps {
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    photos: string[];
    isUploading: boolean;
    handlePhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePhoto: (index: number) => void;
    isDetectingLocation: boolean;
    locationDetected: boolean;
    country: string;
    setCountry: (val: string) => void;
    state: string;
    setState: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    countries: any[];
    states: any[];
}

export const BasicInfoStep = ({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    photos,
    isUploading,
    handlePhotoSelect,
    removePhoto,
    isDetectingLocation,
    locationDetected,
    country,
    setCountry,
    state,
    setState,
    city,
    setCity,
    countries,
    states,
}: BasicInfoStepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-white mb-2">Welcome! Let's get started</h1>
                <p className="text-white/60">Tell us a bit about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName" className="text-white">First Name *</Label>
                    <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="John"
                    />
                </div>
                <div>
                    <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                    <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <Label className="text-white mb-2 block">Profile Photo</Label>
                <div className="flex gap-4 items-center">
                    {photos.map((photo, i) => (
                        <div key={i} className="relative">
                            <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {photos.length < 3 && (
                        <label className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                            {isUploading ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : (
                                <>
                                    <Camera className="h-6 w-6 text-white/60" />
                                    <span className="text-xs text-white/60 mt-1">Add</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    )}
                </div>
                <p className="text-white/40 text-xs mt-2">Add up to 3 photos (optional but recommended)</p>
            </div>

            {isDetectingLocation ? (
                <div className="flex items-center gap-2 text-white/60 text-sm py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Detecting your location...</span>
                </div>
            ) : (
                <>
                    {locationDetected && (country || city) && (
                        <div className="flex items-center gap-2 text-primary text-sm mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>Location detected - you can adjust if needed</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-white">Country</Label>
                            <LocationCombobox
                                value={country}
                                onValueChange={(val) => {
                                    setCountry(val);
                                    setState('');
                                    setCity('');
                                }}
                                options={countries}
                                placeholder="Select country"
                                searchPlaceholder="Search countries..."
                            />
                        </div>
                        <div>
                            <Label className="text-white">State/Province</Label>
                            <LocationCombobox
                                value={state}
                                onValueChange={setState}
                                options={states}
                                placeholder="Select state"
                                searchPlaceholder="Search states..."
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-white">City *</Label>
                        <CityAutocomplete
                            value={city}
                            onValueChange={setCity}
                            country={country}
                            state={state}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
