// Popular countries for dropdown
export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Belgium",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Ireland",
  "Portugal",
  "Japan",
  "Singapore",
  "Hong Kong",
  "United Arab Emirates",
  "New Zealand",
  "Mexico",
  "Brazil",
  "Argentina",
  "South Africa",
  "India",
  "South Korea",
  "Israel",
  "Poland",
  "Czech Republic",
  "Greece",
  "Finland",
  "Luxembourg",
];

// US States
export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
];

// Canadian Provinces
export const CANADIAN_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

// UK Countries/Regions
export const UK_REGIONS = [
  "England", "Scotland", "Wales", "Northern Ireland"
];

// Australian States
export const AUSTRALIAN_STATES = [
  "New South Wales", "Victoria", "Queensland", "Western Australia",
  "South Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"
];

// German States
export const GERMAN_STATES = [
  "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
  "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland",
  "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
];

// Get states/provinces for a country
export function getRegionsForCountry(country: string): string[] {
  switch (country) {
    case "United States":
      return US_STATES;
    case "Canada":
      return CANADIAN_PROVINCES;
    case "United Kingdom":
      return UK_REGIONS;
    case "Australia":
      return AUSTRALIAN_STATES;
    case "Germany":
      return GERMAN_STATES;
    default:
      return [];
  }
}
