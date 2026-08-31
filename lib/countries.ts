// A broad (~198 entry) country list for the onboarding "find my business" step.
// Not a canonical ISO 3166 list — good enough for a searchable picker in a prototype.
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Republic of)", "Congo (DRC)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Other",
];

// Curated real cities for a handful of markets we lean on in the demo narrative.
// Everything else falls back to generic branch labels generated from the country name.
const CITY_POOL: Record<string, string[]> = {
  Zambia: ["Lusaka", "Ndola", "Kitwe", "Livingstone", "Kabwe"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
  Nigeria: ["Lagos", "Abuja", "Port Harcourt", "Kano"],
  Ghana: ["Accra", "Kumasi", "Takoradi"],
  Egypt: ["Cairo", "Alexandria", "Giza"],
  "United States": ["New York", "Chicago", "Austin", "Denver", "Seattle"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth"],
  India: ["Mumbai", "Bengaluru", "Delhi", "Chennai"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  France: ["Paris", "Lyon", "Marseille", "Toulouse"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
};

const GENERIC_BRANCH_LABELS = ["Head Office", "North Branch", "South Branch", "Regional Depot"];

export function citiesFor(country: string): string[] {
  return CITY_POOL[country] ?? GENERIC_BRANCH_LABELS;
}

// Rough IANA timezone -> country hints, just enough to make the "we think you're
// based in X" shortcut work for common cases. No permission prompt, no network call.
const TIMEZONE_COUNTRY_HINTS: Record<string, string> = {
  "Africa/Lusaka": "Zambia",
  "Africa/Johannesburg": "South Africa",
  "Africa/Nairobi": "Kenya",
  "Africa/Lagos": "Nigeria",
  "Africa/Accra": "Ghana",
  "Africa/Cairo": "Egypt",
  "Africa/Casablanca": "Morocco",
  "Africa/Addis_Ababa": "Ethiopia",
  "America/New_York": "United States",
  "America/Chicago": "United States",
  "America/Denver": "United States",
  "America/Los_Angeles": "United States",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "America/Mexico_City": "Mexico",
  "America/Sao_Paulo": "Brazil",
  "America/Bogota": "Colombia",
  "America/Argentina/Buenos_Aires": "Argentina",
  "Europe/London": "United Kingdom",
  "Europe/Dublin": "Ireland",
  "Europe/Paris": "France",
  "Europe/Berlin": "Germany",
  "Europe/Madrid": "Spain",
  "Europe/Rome": "Italy",
  "Europe/Amsterdam": "Netherlands",
  "Europe/Lisbon": "Portugal",
  "Europe/Moscow": "Russia",
  "Europe/Warsaw": "Poland",
  "Asia/Dubai": "United Arab Emirates",
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Karachi": "Pakistan",
  "Asia/Kolkata": "India",
  "Asia/Dhaka": "Bangladesh",
  "Asia/Bangkok": "Thailand",
  "Asia/Jakarta": "Indonesia",
  "Asia/Singapore": "Singapore",
  "Asia/Hong_Kong": "Hong Kong",
  "Asia/Shanghai": "China",
  "Asia/Tokyo": "Japan",
  "Asia/Seoul": "South Korea",
  "Australia/Sydney": "Australia",
  "Australia/Melbourne": "Australia",
  "Pacific/Auckland": "New Zealand",
};

// Kept as a plain top-level function (not called inline during render) — see the
// callers, which read it once via a lazy useState initializer.
export function guessCountry(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRY_HINTS[tz] ?? null;
  } catch {
    return null;
  }
}
