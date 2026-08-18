import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildNavigationLinks = (plan?: any) => {
  const publicLinks = [
    { label: "Home", url: "/" },
    { label: "About us", url: "/about-us" },
    { label: "Need to Know", url: "/need-to-know" },

  ];

  const memberLinks: { label: string; url: string }[] = [];

  if (plan?.aiPoweredSearch) {
    memberLinks.push({ label: "Assistant", url: "/assistant" });
  }

  if (plan?.bookingHistory) {
    memberLinks.push({ label: "Booking Log", url: "/assistant/booking-log" });
  }

  if (plan?.conciergeAccess) {
    memberLinks.push({
      label: "Concierge Chat",
      url: "/assistant/chat-with-agent",
    });
  }

  memberLinks.push({
    label: "My Preferences",
    url: "/assistant/settings/personal-preferences",
  });

  return {
    publicLinks,
    memberLinks,
  };
};

export const cuisineOptions = [
  { label: "Italian", value: "italian" },
  { label: "Chinese", value: "chinese" },
  { label: "Japanese", value: "japanese" },
  { label: "Mexican", value: "mexican" },
  { label: "Indian", value: "indian" },
  { label: "French", value: "french" },
  { label: "Thai", value: "thai" },
  { label: "Spanish", value: "spanish" },
  { label: "Mediterranean", value: "mediterranean" },
  { label: "Korean", value: "korean" },
  { label: "Turkish", value: "turkish" },
  { label: "Greek", value: "greek" },
  { label: "Vietnamese", value: "vietnamese" },
  { label: "Lebanese", value: "lebanese" },
  { label: "American", value: "american" },
  { label: "Caribbean", value: "caribbean" },
  { label: "Brazilian", value: "brazilian" },
  { label: "Ethiopian", value: "ethiopian" },
  { label: "Moroccan", value: "moroccan" },
  { label: "Peruvian", value: "peruvian" },
  { label: "Argentinian", value: "argentinian" },
  { label: "Russian", value: "russian" },
  { label: "German", value: "german" },
  { label: "Portuguese", value: "portuguese" },
  { label: "Filipino", value: "filipino" },
  { label: "Malaysian", value: "malaysian" },
  { label: "Indonesian", value: "indonesian" },
  { label: "Pakistani", value: "pakistani" },
  { label: "Afghan", value: "afghan" },
  { label: "Central Asian", value: "central-asian" },
];

export const diningOptions = [
  { label: "Casual Dining", value: "casual" },
  { label: "Fine Dining", value: "fine-dining" },
  { label: "Fast Casual", value: "fast-casual" },
  { label: "Street Food", value: "street-food" },
  { label: "Buffet", value: "buffet" },
  { label: "Family Style", value: "family-style" },
  { label: "Cafe", value: "cafe" },
  { label: "Brunch", value: "brunch" },
  { label: "Food Tasting", value: "tasting-menu" },
  { label: "Vegan / Vegetarian", value: "vegan" },
  { label: "BBQ & Grill", value: "bbq" },
  { label: "Seafood", value: "seafood" },
  { label: "Fusion", value: "fusion" },
  { label: "Pop-up Dining", value: "popup" },
  { label: "Food Court", value: "food-court" },
  { label: "Buffet Brunch", value: "buffet-brunch" },
  { label: "Dessert Bar", value: "dessert-bar" },
  { label: "Wine Bar", value: "wine-bar" },
  { label: "Cocktail Lounge", value: "cocktail-lounge" },
  { label: "Supper Club", value: "supper-club" },
  { label: "Tapas Bar", value: "tapas-bar" },
  { label: "Ramen Shop", value: "ramen-shop" },
  { label: "Pizza Parlor", value: "pizza-parlor" },
  { label: "Burger Joint", value: "burger-joint" },
  { label: "Bistro", value: "bistro" },
  { label: "Diner", value: "diner" },
  { label: "Ice Cream Parlor", value: "ice-cream-parlor" },
  { label: "Juice Bar", value: "juice-bar" },
  { label: "Bakery", value: "bakery" },
  { label: "Tea House", value: "tea-house" },
];

export const seatingOptions = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Window Seat", value: "window" },
  { label: "Private Booth", value: "booth" },
  { label: "Rooftop", value: "rooftop" },
  { label: "Terrace", value: "terrace" },
  { label: "Garden", value: "garden" },
  { label: "Bar Seating", value: "bar" },
  { label: "Chef’s Table", value: "chefs-table" },
  { label: "Lounge Area", value: "lounge" },
  { label: "High-top Table", value: "high-top" },
  { label: "Low Seating", value: "low-seating" },
  { label: "Tatami Seating", value: "tatami" },
  { label: "Poolside", value: "poolside" },
  { label: "Patio", value: "patio" },
  { label: "Balcony", value: "balcony" },
  { label: "Corner Table", value: "corner" },
  { label: "Communal Table", value: "communal" },
  { label: "Cabana", value: "cabana" },
  { label: "Terrace Lounge", value: "terrace-lounge" },
  { label: "Garden Gazebo", value: "garden-gazebo" },
  { label: "Fireplace Area", value: "fireplace" },
  { label: "Mezzanine", value: "mezzanine" },
  { label: "Patio Lounge", value: "patio-lounge" },
  { label: "Open Kitchen", value: "open-kitchen" },
  { label: "Deck", value: "deck" },
  { label: "Cabinet Table", value: "cabinet" },
  { label: "Sunroom", value: "sunroom" },
  { label: "Terrace Garden", value: "terrace-garden" },
];

export const cityOptions = [
  { label: "New York", value: "new-york" },
  { label: "Los Angeles", value: "los-angeles" },
  { label: "Chicago", value: "chicago" },
  { label: "Houston", value: "houston" },
  { label: "Phoenix", value: "phoenix" },
  { label: "Philadelphia", value: "philadelphia" },
  { label: "San Antonio", value: "san-antonio" },
  { label: "San Diego", value: "san-diego" },
  { label: "Dallas", value: "dallas" },
  { label: "San Jose", value: "san-jose" },

  { label: "London", value: "london" },
  { label: "Manchester", value: "manchester" },
  { label: "Birmingham", value: "birmingham" },
  { label: "Liverpool", value: "liverpool" },
  { label: "Leeds", value: "leeds" },
  { label: "Paris", value: "paris" },
  { label: "Marseille", value: "marseille" },
  { label: "Lyon", value: "lyon" },
  { label: "Nice", value: "nice" },
  { label: "Toulouse", value: "toulouse" },

  { label: "Berlin", value: "berlin" },
  { label: "Munich", value: "munich" },
  { label: "Hamburg", value: "hamburg" },
  { label: "Frankfurt", value: "frankfurt" },
  { label: "Cologne", value: "cologne" },
  { label: "Rome", value: "rome" },
  { label: "Milan", value: "milan" },
  { label: "Naples", value: "naples" },
  { label: "Florence", value: "florence" },
  { label: "Venice", value: "venice" },

  { label: "Madrid", value: "madrid" },
  { label: "Barcelona", value: "barcelona" },
  { label: "Valencia", value: "valencia" },
  { label: "Seville", value: "seville" },
  { label: "Bilbao", value: "bilbao" },
  { label: "Lisbon", value: "lisbon" },
  { label: "Porto", value: "porto" },
  { label: "Prague", value: "prague" },
  { label: "Vienna", value: "vienna" },
  { label: "Budapest", value: "budapest" },

  { label: "Amsterdam", value: "amsterdam" },
  { label: "Rotterdam", value: "rotterdam" },
  { label: "Brussels", value: "brussels" },
  { label: "Antwerp", value: "antwerp" },
  { label: "Zurich", value: "zurich" },
  { label: "Geneva", value: "geneva" },
  { label: "Stockholm", value: "stockholm" },
  { label: "Gothenburg", value: "gothenburg" },
  { label: "Oslo", value: "oslo" },
  { label: "Bergen", value: "bergen" },

  { label: "Copenhagen", value: "copenhagen" },
  { label: "Helsinki", value: "helsinki" },
  { label: "Reykjavik", value: "reykjavik" },
  { label: "Dublin", value: "dublin" },
  { label: "Edinburgh", value: "edinburgh" },
  { label: "Glasgow", value: "glasgow" },
  { label: "Warsaw", value: "warsaw" },
  { label: "Krakow", value: "krakow" },
  { label: "Gdansk", value: "gdansk" },
  { label: "Wroclaw", value: "wroclaw" },

  { label: "Istanbul", value: "istanbul" },
  { label: "Ankara", value: "ankara" },
  { label: "Izmir", value: "izmir" },
  { label: "Antalya", value: "antalya" },
  { label: "Bursa", value: "bursa" },

  { label: "Dubai", value: "dubai" },
  { label: "Abu Dhabi", value: "abu-dhabi" },
  { label: "Sharjah", value: "sharjah" },
  { label: "Doha", value: "doha" },
  { label: "Riyadh", value: "riyadh" },
  { label: "Jeddah", value: "jeddah" },
  { label: "Mecca", value: "mecca" },
  { label: "Medina", value: "medina" },
  { label: "Muscat", value: "muscat" },
  { label: "Kuwait City", value: "kuwait-city" },

  { label: "Karachi", value: "karachi" },
  { label: "Lahore", value: "lahore" },
  { label: "Islamabad", value: "islamabad" },
  { label: "Rawalpindi", value: "rawalpindi" },
  { label: "Faisalabad", value: "faisalabad" },
  { label: "Multan", value: "multan" },
  { label: "Gujranwala", value: "gujranwala" },
  { label: "Sialkot", value: "sialkot" },
  { label: "Peshawar", value: "peshawar" },
  { label: "Quetta", value: "quetta" },

  { label: "Delhi", value: "delhi" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Chennai", value: "chennai" },
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Kolkata", value: "kolkata" },
  { label: "Pune", value: "pune" },
  { label: "Ahmedabad", value: "ahmedabad" },
  { label: "Jaipur", value: "jaipur" },
  { label: "Chandigarh", value: "chandigarh" },

  { label: "Dhaka", value: "dhaka" },
  { label: "Chittagong", value: "chittagong" },
  { label: "Kathmandu", value: "kathmandu" },
  { label: "Colombo", value: "colombo" },
  { label: "Male", value: "male" },

  { label: "Bangkok", value: "bangkok" },
  { label: "Chiang Mai", value: "chiang-mai" },
  { label: "Phuket", value: "phuket" },
  { label: "Pattaya", value: "pattaya" },
  { label: "Singapore", value: "singapore" },
  { label: "Kuala Lumpur", value: "kuala-lumpur" },
  { label: "Penang", value: "penang" },
  { label: "Jakarta", value: "jakarta" },
  { label: "Bali", value: "bali" },
  { label: "Surabaya", value: "surabaya" },

  { label: "Manila", value: "manila" },
  { label: "Cebu", value: "cebu" },
  { label: "Davao", value: "davao" },
  { label: "Hanoi", value: "hanoi" },
  { label: "Ho Chi Minh City", value: "ho-chi-minh-city" },
  { label: "Da Nang", value: "da-nang" },
  { label: "Seoul", value: "seoul" },
  { label: "Busan", value: "busan" },
  { label: "Incheon", value: "incheon" },
  { label: "Tokyo", value: "tokyo" },

  { label: "Osaka", value: "osaka" },
  { label: "Kyoto", value: "kyoto" },
  { label: "Nagoya", value: "nagoya" },
  { label: "Yokohama", value: "yokohama" },
  { label: "Sapporo", value: "sapporo" },

  { label: "Beijing", value: "beijing" },
  { label: "Shanghai", value: "shanghai" },
  { label: "Shenzhen", value: "shenzhen" },
  { label: "Guangzhou", value: "guangzhou" },
  { label: "Chengdu", value: "chengdu" },

  { label: "Hong Kong", value: "hong-kong" },
  { label: "Macau", value: "macau" },
  { label: "Taipei", value: "taipei" },
  { label: "Kaohsiung", value: "kaohsiung" },

  { label: "Sydney", value: "sydney" },
  { label: "Melbourne", value: "melbourne" },
  { label: "Brisbane", value: "brisbane" },
  { label: "Perth", value: "perth" },
  { label: "Adelaide", value: "adelaide" },

  { label: "Auckland", value: "auckland" },
  { label: "Wellington", value: "wellington" },
  { label: "Christchurch", value: "christchurch" },

  { label: "Cape Town", value: "cape-town" },
  { label: "Johannesburg", value: "johannesburg" },
  { label: "Durban", value: "durban" },
  { label: "Pretoria", value: "pretoria" },

  { label: "Cairo", value: "cairo" },
  { label: "Alexandria", value: "alexandria" },
  { label: "Giza", value: "giza" },
  { label: "Marrakesh", value: "marrakesh" },
  { label: "Casablanca", value: "casablanca" },

  { label: "Rio de Janeiro", value: "rio-de-janeiro" },
  { label: "São Paulo", value: "sao-paulo" },
  { label: "Brasilia", value: "brasilia" },
  { label: "Salvador", value: "salvador" },
  { label: "Recife", value: "recife" },

  { label: "Buenos Aires", value: "buenos-aires" },
  { label: "Cordoba", value: "cordoba" },
  { label: "Rosario", value: "rosario" },
  { label: "Santiago", value: "santiago" },
  { label: "Valparaiso", value: "valparaiso" },

  { label: "Lima", value: "lima" },
  { label: "Cusco", value: "cusco" },
  { label: "Bogotá", value: "bogota" },
  { label: "Medellín", value: "medellin" },
  { label: "Cartagena", value: "cartagena" },

  { label: "Mexico City", value: "mexico-city" },
  { label: "Guadalajara", value: "guadalajara" },
  { label: "Monterrey", value: "monterrey" },
  { label: "Cancun", value: "cancun" },
  { label: "Tulum", value: "tulum" },

  { label: "Havana", value: "havana" },
  { label: "Panama City", value: "panama-city" },
  { label: "San Jose", value: "san-jose" },
  { label: "San Salvador", value: "san-salvador" },
  { label: "Guatemala City", value: "guatemala-city" }
];
