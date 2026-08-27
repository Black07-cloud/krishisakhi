import mongoose from "mongoose";

import MarketPrice from "../models/MarketPrice.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

/* -------------------------------------------------------
   Escape regex
------------------------------------------------------- */

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/* -------------------------------------------------------
   Get latest prices
------------------------------------------------------- */

export const getLatestMarketPrices = async ({
  crop,
  state,
  district,
  market,
  limit = 20,
} = {}) => {
  const filter = {
    isActive: true,
  };

  if (crop) {
    filter.crop = new RegExp(
      `^${escapeRegex(crop)}$`,
      "i"
    );
  }

  if (state) {
    filter.state = new RegExp(
      `^${escapeRegex(state)}$`,
      "i"
    );
  }

  if (district) {
    filter.district = new RegExp(
      `^${escapeRegex(district)}$`,
      "i"
    );
  }

  if (market) {
    filter.market = new RegExp(
      `^${escapeRegex(market)}$`,
      "i"
    );
  }

  const parsedLimit = Number(limit);

  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 20;

  return MarketPrice.find(filter)
    .sort({
      priceDate: -1,
      createdAt: -1,
    })
    .limit(safeLimit)
    .lean();
};

/* -------------------------------------------------------
   Get by ID
------------------------------------------------------- */

export const getMarketPriceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return MarketPrice.findOne({
    _id: id,
    isActive: true,
  }).lean();
};

/* -------------------------------------------------------
   Price trend
------------------------------------------------------- */

const calculatePriceTrend = (records) => {
  if (!records || records.length < 2) {
    return {
      direction: "stable",
      percentage: 0,
    };
  }

  const latest = Number(
    records[0].modalPrice
  );

  const previous = Number(
    records[1].modalPrice
  );

  if (
    !Number.isFinite(latest) ||
    !Number.isFinite(previous) ||
    previous === 0
  ) {
    return {
      direction: "stable",
      percentage: 0,
    };
  }

  const percentage =
    ((latest - previous) / previous) * 100;

  let direction = "stable";

  if (percentage > 2) {
    direction = "up";
  } else if (percentage < -2) {
    direction = "down";
  }

  return {
    direction,
    percentage: Number(
      percentage.toFixed(2)
    ),
  };
};

/* -------------------------------------------------------
   Farm market intelligence
------------------------------------------------------- */

export const getFarmMarketIntelligence =
  async (farmId, ownerId) => {
    if (
      !mongoose.Types.ObjectId.isValid(farmId)
    ) {
      return null;
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: ownerId,
      isActive: true,
    }).lean();

    if (!farm) {
      return null;
    }

    const crop = await Crop.findOne({
      farm: farmId,
      owner: ownerId,
      status: "active",
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!crop) {
      return {
        farm: {
          id: farm._id,
          name: farm.name,
          state:
            farm.location?.state || null,
          district:
            farm.location?.district || null,
        },

        crop: null,

        prices: [],

        trend: {
          direction: "stable",
          percentage: 0,
        },

        message:
          "No active crop found for this farm.",
      };
    }

    const prices =
      await getLatestMarketPrices({
        crop: crop.name,
        state: farm.location?.state,
        district: farm.location?.district,
        limit: 20,
      });
      console.log("=== FARM MARKET DEBUG ===");

console.log("Farm state:", farm.location?.state);
console.log("Farm district:", farm.location?.district);
console.log("Crop name:", crop.name);

const allGovernmentPrices = await MarketPrice.find({
  source: "government",
  isActive: true,
})
  .select("crop market district state modalPrice priceDate")
  .limit(20)
  .lean();

console.log(
  "Government records:",
  JSON.stringify(allGovernmentPrices, null, 2)
);

console.log("Filtered prices:", prices);

    const trend =
      calculatePriceTrend(prices);

    const modalPrices = prices
      .map((item) =>
        Number(item.modalPrice)
      )
      .filter(Number.isFinite);

    const averageModalPrice =
      modalPrices.length > 0
        ? Number(
            (
              modalPrices.reduce(
                (sum, price) =>
                  sum + price,
                0
              ) /
              modalPrices.length
            ).toFixed(2)
          )
        : null;

    const minPrices = prices
      .map((item) =>
        Number(item.minPrice)
      )
      .filter(Number.isFinite);

    const maxPrices = prices
      .map((item) =>
        Number(item.maxPrice)
      )
      .filter(Number.isFinite);

    return {
      farm: {
        id: farm._id,
        name: farm.name,
        state:
          farm.location?.state || null,
        district:
          farm.location?.district || null,
      },

      crop: {
        id: crop._id,
        name: crop.name,
        variety: crop.variety || null,
        currentStage:
          crop.currentStage,
      },

      prices,

      summary: {
        marketCount: prices.length,

        averageModalPrice,

        latestModalPrice:
          prices.length > 0
            ? prices[0].modalPrice
            : null,

        minPrice:
          minPrices.length > 0
            ? Math.min(...minPrices)
            : null,

        maxPrice:
          maxPrices.length > 0
            ? Math.max(...maxPrices)
            : null,
      },

      trend,

      recommendation:
        prices.length > 0
          ? trend.direction === "up"
            ? "Market prices are showing an upward trend. Monitor prices before selling."
            : trend.direction === "down"
              ? "Market prices are showing a downward trend. Compare nearby markets before selling."
              : "Market prices are relatively stable. Compare nearby markets before deciding where to sell."
          : "No recent government market price data was found for this crop and location.",
    };
  };