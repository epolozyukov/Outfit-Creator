import type { Product } from "@/types";

// Mock catalogue for the workshop concept. Names, prices and images are
// illustrative placeholders, not real Adidas products or prices.
export const products: Product[] = [
  {
    "id": "pulse-runner",
    "name": "Pulse Runner",
    "category": "shoes",
    "image": "/products/pulse-runner.svg",
    "priceMinor": 52999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Lightweight cushioned road shoe for daily miles."
  },
  {
    "id": "storm-runner",
    "name": "Storm Runner",
    "category": "shoes",
    "image": "/products/storm-runner.svg",
    "priceMinor": 59999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "running"
    ],
    "weatherTags": [
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "streetwear"
    ],
    "description": "Weather-resistant running shoe with a grippy outsole."
  },
  {
    "id": "tempo-racer",
    "name": "Tempo Racer",
    "category": "shoes",
    "image": "/products/tempo-racer.svg",
    "priceMinor": 47999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "running",
      "casual"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "rainy"
    ],
    "styleTags": [
      "bold",
      "streetwear"
    ],
    "description": "Responsive everyday runner with a bold colourway."
  },
  {
    "id": "iron-trainer",
    "name": "Iron Trainer",
    "category": "shoes",
    "image": "/products/iron-trainer.svg",
    "priceMinor": 44999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "gym"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "bold"
    ],
    "description": "Stable flat-sole trainer for lifting and circuits."
  },
  {
    "id": "studio-flex",
    "name": "Studio Flex",
    "category": "shoes",
    "image": "/products/studio-flex.svg",
    "priceMinor": 39999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "gym",
      "casual"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "minimal",
      "streetwear",
      "performance"
    ],
    "description": "Flexible low-profile shoe from studio to street."
  },
  {
    "id": "court-classic",
    "name": "Court Classic",
    "category": "shoes",
    "image": "/products/court-classic.svg",
    "priceMinor": 34999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "casual",
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold"
    ],
    "styleTags": [
      "minimal",
      "streetwear"
    ],
    "description": "Retro-inspired court shoe, also suited to indoor football."
  },
  {
    "id": "goal-strike",
    "name": "Goal Strike",
    "category": "shoes",
    "image": "/products/goal-strike.svg",
    "priceMinor": 57999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "bold"
    ],
    "description": "Firm-ground football boot built for sharp cuts."
  },
  {
    "id": "turf-pro",
    "name": "Turf Pro",
    "category": "shoes",
    "image": "/products/turf-pro.svg",
    "priceMinor": 49999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "minimal",
      "streetwear"
    ],
    "description": "Versatile turf shoe with a clean, minimal look."
  },
  {
    "id": "breeze-tee",
    "name": "Breeze Tee",
    "category": "top",
    "image": "/products/breeze-tee.svg",
    "priceMinor": 12999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "running",
      "gym",
      "casual"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Breathable lightweight tee for warm days."
  },
  {
    "id": "thermal-long",
    "name": "Thermal Long Sleeve",
    "category": "top",
    "image": "/products/thermal-long.svg",
    "priceMinor": 18999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym"
    ],
    "weatherTags": [
      "cold"
    ],
    "styleTags": [
      "performance",
      "minimal",
      "streetwear"
    ],
    "description": "Warm long-sleeve base layer for cold sessions."
  },
  {
    "id": "blaze-tee",
    "name": "Blaze Tee",
    "category": "top",
    "image": "/products/blaze-tee.svg",
    "priceMinor": 13999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "running",
      "gym",
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "bold"
    ],
    "description": "Quick-dry training tee with an expressive print."
  },
  {
    "id": "matchday-jersey",
    "name": "Matchday Jersey",
    "category": "top",
    "image": "/products/matchday-jersey.svg",
    "priceMinor": 24999,
    "currency": "PLN",
    "color": "blue",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "bold"
    ],
    "description": "Lightweight football jersey with moisture control."
  },
  {
    "id": "frost-longsleeve",
    "name": "Frost Long Sleeve",
    "category": "top",
    "image": "/products/frost-longsleeve.svg",
    "priceMinor": 21999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "football",
      "running"
    ],
    "weatherTags": [
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Cold-weather football and running long sleeve."
  },
  {
    "id": "street-tee",
    "name": "Oversized Street Tee",
    "category": "top",
    "image": "/products/street-tee.svg",
    "priceMinor": 15999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "casual",
      "gym"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "minimal",
      "streetwear"
    ],
    "description": "Relaxed oversized tee for everyday wear."
  },
  {
    "id": "graphic-tee",
    "name": "Graphic Tee",
    "category": "top",
    "image": "/products/graphic-tee.svg",
    "priceMinor": 14999,
    "currency": "PLN",
    "color": "orange",
    "activities": [
      "casual",
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "rainy"
    ],
    "styleTags": [
      "bold",
      "streetwear"
    ],
    "description": "Statement graphic tee with a fan-inspired vibe."
  },
  {
    "id": "fleece-hoodie",
    "name": "Fleece Hoodie",
    "category": "top",
    "image": "/products/fleece-hoodie.svg",
    "priceMinor": 31999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "casual",
      "gym",
      "running"
    ],
    "weatherTags": [
      "cold",
      "rainy"
    ],
    "styleTags": [
      "streetwear",
      "minimal"
    ],
    "description": "Soft fleece hoodie for warm-ups and casual days."
  },
  {
    "id": "run-shorts",
    "name": "Run Shorts",
    "category": "bottom",
    "image": "/products/run-shorts.svg",
    "priceMinor": 12999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym",
      "casual"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Light split-leg shorts for running and training."
  },
  {
    "id": "run-tights",
    "name": "Run Tights",
    "category": "bottom",
    "image": "/products/run-tights.svg",
    "priceMinor": 21999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym"
    ],
    "weatherTags": [
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Compression-fit tights for cold-weather runs."
  },
  {
    "id": "bold-shorts",
    "name": "Bold Training Shorts",
    "category": "bottom",
    "image": "/products/bold-shorts.svg",
    "priceMinor": 13999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "running",
      "gym",
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "bold"
    ],
    "description": "Training shorts with bold side panels."
  },
  {
    "id": "match-shorts",
    "name": "Match Shorts",
    "category": "bottom",
    "image": "/products/match-shorts.svg",
    "priceMinor": 11999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Classic football shorts, light and breathable."
  },
  {
    "id": "wide-shorts",
    "name": "Wide Street Shorts",
    "category": "bottom",
    "image": "/products/wide-shorts.svg",
    "priceMinor": 15999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "casual",
      "running",
      "gym",
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "streetwear",
      "bold"
    ],
    "description": "Wide-cut shorts with a streetwear silhouette."
  },
  {
    "id": "track-joggers",
    "name": "Track Joggers",
    "category": "bottom",
    "image": "/products/track-joggers.svg",
    "priceMinor": 22999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "casual",
      "gym",
      "running"
    ],
    "weatherTags": [
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "streetwear",
      "minimal"
    ],
    "description": "Tapered joggers for training and casual days."
  },
  {
    "id": "match-socks",
    "name": "Match Socks",
    "category": "socks",
    "image": "/products/match-socks.svg",
    "priceMinor": 4999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Cushioned football socks with arch support."
  },
  {
    "id": "bold-socks",
    "name": "Bold Match Socks",
    "category": "socks",
    "image": "/products/bold-socks.svg",
    "priceMinor": 4999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "bold",
      "performance"
    ],
    "description": "High-contrast football socks."
  },
  {
    "id": "street-socks",
    "name": "Street Crew Socks",
    "category": "socks",
    "image": "/products/street-socks.svg",
    "priceMinor": 3999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "football"
    ],
    "weatherTags": [
      "hot",
      "mild",
      "cold",
      "rainy"
    ],
    "styleTags": [
      "streetwear",
      "minimal"
    ],
    "description": "Crew-length socks for a lifestyle look."
  },
  {
    "id": "rain-shell",
    "name": "Rain Shell",
    "category": "jacket",
    "image": "/products/rain-shell.svg",
    "priceMinor": 39999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym",
      "football",
      "casual"
    ],
    "weatherTags": [
      "rainy"
    ],
    "styleTags": [
      "performance",
      "minimal"
    ],
    "description": "Packable waterproof shell jacket."
  },
  {
    "id": "insulated-jacket",
    "name": "Insulated Jacket",
    "category": "jacket",
    "image": "/products/insulated-jacket.svg",
    "priceMinor": 54999,
    "currency": "PLN",
    "color": "grey",
    "activities": [
      "running",
      "gym",
      "football",
      "casual"
    ],
    "weatherTags": [
      "cold"
    ],
    "styleTags": [
      "performance",
      "streetwear"
    ],
    "description": "Warm insulated jacket for cold, dry days."
  },
  {
    "id": "track-jacket",
    "name": "Bold Track Jacket",
    "category": "jacket",
    "image": "/products/track-jacket.svg",
    "priceMinor": 36999,
    "currency": "PLN",
    "color": "red",
    "activities": [
      "running",
      "gym",
      "football",
      "casual"
    ],
    "weatherTags": [
      "mild",
      "cold"
    ],
    "styleTags": [
      "bold",
      "streetwear"
    ],
    "description": "Retro-inspired track jacket with bold stripes."
  },
  {
    "id": "sun-cap",
    "name": "Sun Cap",
    "category": "accessory",
    "image": "/products/sun-cap.svg",
    "priceMinor": 8999,
    "currency": "PLN",
    "color": "white",
    "activities": [
      "running",
      "gym",
      "football",
      "casual"
    ],
    "weatherTags": [
      "hot",
      "mild"
    ],
    "styleTags": [
      "performance",
      "minimal",
      "streetwear"
    ],
    "description": "Lightweight cap with sun protection."
  },
  {
    "id": "knit-beanie",
    "name": "Knit Beanie",
    "category": "accessory",
    "image": "/products/knit-beanie.svg",
    "priceMinor": 7999,
    "currency": "PLN",
    "color": "black",
    "activities": [
      "running",
      "gym",
      "football",
      "casual"
    ],
    "weatherTags": [
      "cold",
      "rainy"
    ],
    "styleTags": [
      "minimal",
      "streetwear",
      "performance"
    ],
    "description": "Soft knit beanie for cold weather."
  }
];
