/**
 * Demo / Reference Crop and Market Configuration
 * Used by the GeneratedMarketProvider when live government API data is offline/unavailable.
 */

export const DEMO_MARKET_CROPS = [
  {
    cropName: "Tomato",
    variety: "Hybrid / Local",
    basePrice: 2600, // INR per quintal
    unit: "quintal",
    markets: [
      { market: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu" },
      { market: "Ottanchathiram Market", district: "Dindigul", state: "Tamil Nadu" },
      { market: "Salem Central Mandi", district: "Salem", state: "Tamil Nadu" },
      { market: "Kolar APMC", district: "Kolar", state: "Karnataka" },
      { market: "Madanapalle Market", district: "Chittoor", state: "Andhra Pradesh" },
    ],
  },
  {
    cropName: "Onion",
    variety: "Red / Nasik",
    basePrice: 3200,
    unit: "quintal",
    markets: [
      { market: "Lasalgaon Mandi", district: "Nashik", state: "Maharashtra" },
      { market: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu" },
      { market: "Dindigul Market", district: "Dindigul", state: "Tamil Nadu" },
      { market: "Mahuva Mandi", district: "Bhavnagar", state: "Gujarat" },
      { market: "Azadpur Mandi", district: "Delhi", state: "Delhi" },
    ],
  },
  {
    cropName: "Potato",
    variety: "Jyoti / Kufri",
    basePrice: 1850,
    unit: "quintal",
    markets: [
      { market: "Agra APMC", district: "Agra", state: "Uttar Pradesh" },
      { market: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu" },
      { market: "Hooghly Mandi", district: "Hooghly", state: "West Bengal" },
      { market: "Indore Mandi", district: "Indore", state: "Madhya Pradesh" },
    ],
  },
  {
    cropName: "Paddy",
    variety: "Common / BPT",
    basePrice: 2180,
    unit: "quintal",
    markets: [
      { market: "Thanjavur Regulated Market", district: "Thanjavur", state: "Tamil Nadu" },
      { market: "Karnal Grain Market", district: "Karnal", state: "Haryana" },
      { market: "Nalgonda Mandi", district: "Nalgonda", state: "Telangana" },
    ],
  },
  {
    cropName: "Maize",
    variety: "Yellow Feed Grade",
    basePrice: 2050,
    unit: "quintal",
    markets: [
      { market: "Davangere APMC", district: "Davangere", state: "Karnataka" },
      { market: "Coimbatore Market", district: "Coimbatore", state: "Tamil Nadu" },
      { market: "Gulabbagh Mandi", district: "Purnea", state: "Bihar" },
    ],
  },
  {
    cropName: "Cotton",
    variety: "Medium Staple",
    basePrice: 6800,
    unit: "quintal",
    markets: [
      { market: "Rajkot APMC", district: "Rajkot", state: "Gujarat" },
      { market: "Warangal Mandi", district: "Warangal", state: "Telangana" },
      { market: "Yavatmal Mandi", district: "Yavatmal", state: "Maharashtra" },
    ],
  },
  {
    cropName: "Groundnut",
    variety: "Bold / Shell",
    basePrice: 6250,
    unit: "quintal",
    markets: [
      { market: "Junagadh Mandi", district: "Junagadh", state: "Gujarat" },
      { market: "Vellore Regulated Market", district: "Vellore", state: "Tamil Nadu" },
      { market: "Adoni APMC", district: "Kurnool", state: "Andhra Pradesh" },
    ],
  },
  {
    cropName: "Banana",
    variety: "Robusta / Grand Naine",
    basePrice: 1600,
    unit: "quintal",
    markets: [
      { market: "Trichy Banana Market", district: "Tiruchirappalli", state: "Tamil Nadu" },
      { market: "Jalgaon APMC", district: "Jalgaon", state: "Maharashtra" },
      { market: "Theni Market", district: "Theni", state: "Tamil Nadu" },
    ],
  },
  {
    cropName: "Chilli",
    variety: "Dry Red Guntur",
    basePrice: 14500,
    unit: "quintal",
    markets: [
      { market: "Guntur Mirchi Yard", district: "Guntur", state: "Andhra Pradesh" },
      { market: "Byadgi APMC", district: "Haveri", state: "Karnataka" },
      { market: "Ramnad Market", district: "Ramanathapuram", state: "Tamil Nadu" },
    ],
  },
  {
    cropName: "Coconut",
    variety: "De-husked Large",
    basePrice: 2800,
    unit: "quintal",
    markets: [
      { market: "Pollachi Coconut Market", district: "Coimbatore", state: "Tamil Nadu" },
      { market: "Kozhikode Mandi", district: "Kozhikode", state: "Kerala" },
      { market: "Tiptur APMC", district: "Tumkur", state: "Karnataka" },
    ],
  },
];
