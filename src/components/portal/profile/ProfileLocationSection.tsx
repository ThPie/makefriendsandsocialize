import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { LocationCombobox } from "@/components/ui/location-combobox";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { COUNTRIES, getRegionsForCountry } from "@/lib/location-data";

interface ProfileLocationSectionProps {
    country: string;
    setCountry: (value: string) => void;
    state: string;
    setState: (value: string) => void;
    city: string;
    setCity: (value: string) => void;
    isDetectingLocation: boolean;
    detectLocation: () => Promise<void>;
}

export const ProfileLocationSection = ({
    country,
    setCountry,
    state,
    setState,
    city,
    setCity,
    isDetectingLocation,
    detectLocation,
}: ProfileLocationSectionProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground mb-4">Location</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                >
                    {isDetectingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                    )}
                    Detect My Location
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <LocationCombobox
                        value={country}
                        onValueChange={(value) => {
                            setCountry(value);
                            // Reset state when country changes
                            if (value !== country) {
                                setState('');
                            }
                        }}
                        options={COUNTRIES}
                        placeholder="Select country"
                        searchPlaceholder="Search countries..."
                        emptyMessage="No countries found."
                        allowCustom={true}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    {getRegionsForCountry(country).length > 0 ? (
                        <LocationCombobox
                            value={state}
                            onValueChange={setState}
                            options={getRegionsForCountry(country)}
                            placeholder="Select state"
                            searchPlaceholder="Search states..."
                            emptyMessage="No states found."
                            allowCustom={true}
                        />
                    ) : (
                        <Input
                            id="state"
                            placeholder="State / Province"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <CityAutocomplete
                        value={city}
                        onValueChange={setCity}
                        country={country}
                        state={state}
                        placeholder="Search for a city..."
                    />
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                Your location helps us connect you with nearby members and events.
            </p>
        </div>
    );
};
