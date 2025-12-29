import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CityResult {
  display_name: string;
  name: string;
  lat: string;
  lon: string;
}

interface CityAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  country?: string;
  state?: string;
  placeholder?: string;
}

export function CityAutocomplete({
  value,
  onValueChange,
  country,
  state,
  placeholder = "Search for a city...",
}: CityAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [cities, setCities] = React.useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchCities = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    setIsLoading(true);

    try {
      // Build the search query with country/state context
      let searchQuery = query;
      if (state) searchQuery += `, ${state}`;
      if (country) searchQuery += `, ${country}`;

      const params = new URLSearchParams({
        q: searchQuery,
        format: "json",
        addressdetails: "1",
        limit: "8",
        featuretype: "city",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            "Accept-Language": "en",
            // Nominatim requires a valid User-Agent
            "User-Agent": "MakeFriends/1.0",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch cities");

      const data = await response.json();
      
      // Filter to get unique city names and prioritize cities
      const uniqueCities: CityResult[] = [];
      const seenNames = new Set<string>();
      
      for (const result of data) {
        // Extract city name from address or use the display name
        const cityName = result.address?.city || 
                        result.address?.town || 
                        result.address?.village ||
                        result.name;
        
        if (cityName && !seenNames.has(cityName.toLowerCase())) {
          seenNames.add(cityName.toLowerCase());
          uniqueCities.push({
            display_name: result.display_name,
            name: cityName,
            lat: result.lat,
            lon: result.lon,
          });
        }
      }

      setCities(uniqueCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, [country, state]);

  // Debounce the search
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchCities(searchValue);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue, searchCities]);

  const handleSelect = (cityName: string) => {
    onValueChange(cityName);
    setOpen(false);
    setSearchValue("");
    setCities([]);
  };

  const handleCustomInput = () => {
    if (searchValue.trim()) {
      onValueChange(searchValue.trim());
      setOpen(false);
      setSearchValue("");
      setCities([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-background hover:bg-background"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border border-border shadow-lg z-50">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search cities..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : cities.length === 0 ? (
              <CommandEmpty>
                {searchValue.length >= 2 ? (
                  <button
                    onClick={handleCustomInput}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent cursor-pointer"
                  >
                    Use "{searchValue}"
                  </button>
                ) : searchValue.length > 0 ? (
                  <span className="text-sm text-muted-foreground">Type at least 2 characters...</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Start typing to search</span>
                )}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {cities.map((city, index) => (
                  <CommandItem
                    key={`${city.name}-${index}`}
                    value={city.name}
                    onSelect={() => handleSelect(city.name)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === city.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{city.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {city.display_name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
