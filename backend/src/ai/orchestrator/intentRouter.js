/**
 * Intent Router for Farmio AI Engine
 * Multi-lingual (English, Tamil, Thanglish, Hindi, Malayalam) pattern & keyword classifier.
 */

const INTENTS = {
  GREETING: "GREETING",
  HELP: "HELP",
  FARM_INFO: "FARM_INFO",
  CROP_ADVISORY: "CROP_ADVISORY",
  SOIL_ANALYSIS: "SOIL_ANALYSIS",
  WEATHER: "WEATHER",
  IRRIGATION: "IRRIGATION",
  DISEASE: "DISEASE",
  MARKET: "MARKET",
  SELL_CROP: "SELL_CROP",
  FINANCE: "FINANCE",
  GOVERNMENT_SCHEME: "GOVERNMENT_SCHEME",
  TASK: "TASK",
  GENERAL_CHAT: "GENERAL_CHAT",
};

const CROP_NAME_MAP = {
  tomato: "Tomato",
  thakkali: "Tomato",
  தக்காளி: "Tomato",
  टमाटर: "Tomato",
  തക്കാളി: "Tomato",

  onion: "Onion",
  vengayam: "Onion",
  வெங்காயம்: "Onion",
  प्याज़: "Onion",

  potato: "Potato",
  urulai: "Potato",
  உருளை: "Potato",
  आलू: "Potato",

  paddy: "Paddy",
  rice: "Paddy",
  nellu: "Paddy",
  நெல்: "Paddy",
  धान: "Paddy",

  maize: "Maize",
  corn: "Maize",
  makka: "Maize",
  मक्का: "Maize",

  cotton: "Cotton",
  paruthi: "Cotton",
  பருத்தி: "Cotton",
  कपास: "Cotton",

  groundnut: "Groundnut",
  peanut: "Groundnut",
  kadalai: "Groundnut",
  நிலக்கடலை: "Groundnut",

  banana: "Banana",
  valai: "Banana",
  வாழை: "Banana",
  केला: "Banana",

  chilli: "Chilli",
  milagai: "Chilli",
  மிளகாய்: "Chilli",
  मिर्च: "Chilli",

  coconut: "Coconut",
  thengai: "Coconut",
  தேங்காய்: "Coconut",
  नारियल: "Coconut",
};

export const detectIntentAndEntities = (userMessage = "") => {
  const msg = userMessage.toLowerCase().trim();

  // Extract entities
  let detectedCrop = null;
  for (const [key, normalizedName] of Object.entries(CROP_NAME_MAP)) {
    if (msg.includes(key)) {
      detectedCrop = normalizedName;
      break;
    }
  }

  let actionRequested = false;
  if (
    msg.includes("schedule") ||
    msg.includes("create") ||
    msg.includes("set") ||
    msg.includes("podu") ||
    msg.includes("pannu") ||
    msg.includes("remind")
  ) {
    actionRequested = true;
  }

  // 1. GREETING
  if (/^(hi|hello|vanakkam|namaste|hey|good morning|good evening)$/i.test(msg)) {
    return {
      intent: INTENTS.GREETING,
      confidence: 0.98,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 2. HELP / WHAT CAN YOU DO
  if (msg.includes("help") || msg.includes("what can you do") || msg.includes("enna panna mudium") || msg.includes("kya kar sakte ho")) {
    return {
      intent: INTENTS.HELP,
      confidence: 0.95,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 3. IRRIGATION
  if (
    msg.includes("water") ||
    msg.includes("irrigate") ||
    msg.includes("irrigation") ||
    msg.includes("tanneer") ||
    msg.includes("thani") ||
    msg.includes("thannir") ||
    msg.includes("nanaykka") ||
    msg.includes("पानी")
  ) {
    return {
      intent: INTENTS.IRRIGATION,
      confidence: 0.94,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 4. WEATHER
  if (
    msg.includes("weather") ||
    msg.includes("rain") ||
    msg.includes("forecast") ||
    msg.includes("mazhai") ||
    msg.includes("malai") ||
    msg.includes("vanilai") ||
    msg.includes("बारिश") ||
    msg.includes("मौसम")
  ) {
    return {
      intent: INTENTS.WEATHER,
      confidence: 0.92,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 5. DISEASE
  if (
    msg.includes("disease") ||
    msg.includes("pest") ||
    msg.includes("leaf") ||
    msg.includes("spots") ||
    msg.includes("fungus") ||
    msg.includes("noy") ||
    msg.includes("poochi") ||
    msg.includes("scan") ||
    msg.includes("बीमारी") ||
    msg.includes("कीड़ा")
  ) {
    return {
      intent: INTENTS.DISEASE,
      confidence: 0.93,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 6. SELL CROP
  if (
    msg.includes("sell crop") ||
    msg.includes("sell panna") ||
    msg.includes("virka") ||
    msg.includes("selling") ||
    msg.includes("bechna") ||
    msg.includes("list produce")
  ) {
    return {
      intent: INTENTS.SELL_CROP,
      confidence: 0.91,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 7. MARKET
  if (
    msg.includes("market") ||
    msg.includes("price") ||
    msg.includes("mandi") ||
    msg.includes("rate") ||
    msg.includes("vilai") ||
    msg.includes("bhav") ||
    msg.includes("भाव")
  ) {
    return {
      intent: INTENTS.MARKET,
      confidence: 0.95,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 8. FINANCE
  if (
    msg.includes("finance") ||
    msg.includes("expense") ||
    msg.includes("income") ||
    msg.includes("profit") ||
    msg.includes("loss") ||
    msg.includes("selavu") ||
    msg.includes("varavu") ||
    msg.includes("kharcha") ||
    msg.includes("खर्च")
  ) {
    return {
      intent: INTENTS.FINANCE,
      confidence: 0.94,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 9. GOVERNMENT SCHEME
  if (
    msg.includes("scheme") ||
    msg.includes("government") ||
    msg.includes("subsidy") ||
    msg.includes("thittam") ||
    msg.includes("yojana") ||
    msg.includes("योजना")
  ) {
    return {
      intent: INTENTS.GOVERNMENT_SCHEME,
      confidence: 0.93,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 10. SOIL ANALYSIS
  if (
    msg.includes("soil") ||
    msg.includes("ph") ||
    msg.includes("npk") ||
    msg.includes("mann") ||
    msg.includes("man") ||
    msg.includes("मिट्टी")
  ) {
    return {
      intent: INTENTS.SOIL_ANALYSIS,
      confidence: 0.91,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 11. TASK / REMINDER
  if (msg.includes("task") || msg.includes("todo") || msg.includes("job") || msg.includes("velai")) {
    return {
      intent: INTENTS.TASK,
      confidence: 0.90,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // 12. CROP ADVISORY / FARM INFO
  if (msg.includes("crop") || msg.includes("stage") || msg.includes("farm") || msg.includes("pannai")) {
    return {
      intent: detectedCrop ? INTENTS.CROP_ADVISORY : INTENTS.FARM_INFO,
      confidence: 0.88,
      entities: { crop: detectedCrop, actionRequested },
    };
  }

  // Default Fallback GENERAL_CHAT
  return {
    intent: INTENTS.GENERAL_CHAT,
    confidence: 0.70,
    entities: { crop: detectedCrop, actionRequested },
  };
};
