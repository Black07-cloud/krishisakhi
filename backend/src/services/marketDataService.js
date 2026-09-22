import crypto from "crypto";
import MarketPrice from "../models/MarketPrice.js";
import { DEMO_MARKET_CROPS } from "../config/marketConfig.js";

/**
 * Deterministic pseudo-random float generator based on seed string
 */
const seedRandom = (seedStr) => {
  const hash = crypto.createHash("sha256").update(seedStr).digest("hex");
  const subInt = parseInt(hash.substring(0, 8), 16);
  return subInt / 0xffffffff;
};

/**
 * GeneratedMarketProvider: Generates realistic DEMO market data per day
 */
export const GeneratedMarketProvider = {
  name: "GeneratedMarketProvider",
  dataType: "demo",

  generateTodayPrices: async (targetDate = new Date()) => {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const dateStr = startOfDay.toISOString().split("T")[0];
    const generatedRecords = [];

    for (const cropConfig of DEMO_MARKET_CROPS) {
      const { cropName, variety, basePrice, unit, markets } = cropConfig;

      for (const marketInfo of markets) {
        const { market, district, state } = marketInfo;

        // Create deterministic seed per day per market per crop
        const seed = `${cropName}-${market}-${dateStr}`;
        const randomFactor = seedRandom(seed); // float between 0 and 1

        // Fluctuation: -5% to +8%
        const variationPct = (randomFactor * 13 - 5) / 100;
        const modalPrice = Math.round(basePrice * (1 + variationPct));

        // Spread: Min is ~3% lower, Max is ~4% higher
        const minPrice = Math.round(modalPrice * 0.97);
        const maxPrice = Math.round(modalPrice * 1.04);

        generatedRecords.push({
          crop: cropName,
          cropName: cropName,
          variety: variety || "Standard",
          market,
          district,
          state,
          minPrice,
          maxPrice,
          modalPrice,
          unit: unit || "quintal",
          priceDate: startOfDay,
          source: "generated",
          dataType: "demo",
          sourceName: "FARMIO_SIMULATED_ENGINE",
          sourceRecordId: `GEN-${cropName}-${market}-${dateStr}`,
          lastSyncedAt: new Date(),
          isActive: true,
        });
      }
    }

    return generatedRecords;
  },
};

/**
 * Sync daily market prices into MongoDB safely
 */
export const syncDailyMarketPrices = async (forceSync = false) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingCount = await MarketPrice.countDocuments({
    priceDate: { $gte: today },
  });

  if (existingCount > 0 && !forceSync) {
    return {
      synced: false,
      message: "Today's market prices are already synced.",
      count: existingCount,
    };
  }

  // Generate today's prices
  const newRecords = await GeneratedMarketProvider.generateTodayPrices(today);

  let inserted = 0;
  let updated = 0;

  for (const record of newRecords) {
    const filter = {
      cropName: record.cropName,
      market: record.market,
      priceDate: record.priceDate,
    };

    const result = await MarketPrice.findOneAndUpdate(filter, record, {
      upsert: true,
      new: true,
      runValidators: true,
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      inserted++;
    } else {
      updated++;
    }
  }

  return {
    synced: true,
    message: "Daily market prices synchronized successfully.",
    inserted,
    updated,
    total: newRecords.length,
    dataType: "demo",
  };
};

/**
 * Calculate price change and percentage against the previous available market date record
 */
export const calculatePriceChangesForRecords = async (records) => {
  if (!records || records.length === 0) return [];

  const enriched = await Promise.all(
    records.map(async (record) => {
      const recObj = record.toObject ? record.toObject() : { ...record };

      // Find previous market price entry for the same crop and market
      const prevRecord = await MarketPrice.findOne({
        cropName: recObj.cropName || recObj.crop,
        market: recObj.market,
        priceDate: { $lt: recObj.priceDate },
        isActive: true,
      })
        .sort({ priceDate: -1 })
        .lean();

      if (prevRecord && prevRecord.modalPrice > 0) {
        const diff = recObj.modalPrice - prevRecord.modalPrice;
        const pct = (diff / prevRecord.modalPrice) * 100;
        recObj.priceChange = Math.round(diff);
        recObj.priceChangePercent = Number(pct.toFixed(2));
      } else {
        recObj.priceChange = 0;
        recObj.priceChangePercent = 0;
      }

      return recObj;
    })
  );

  return enriched;
};
