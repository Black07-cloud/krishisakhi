import mongoose from "mongoose";

import MarketPrice from "../models/MarketPrice.js";

import syncGovernmentMarketPrices from "../services/governmentMarketService.js";

import {
  getLatestMarketPrices,
  getMarketPriceById,
  getFarmMarketIntelligence,
} from "../services/marketService.js";

/* -------------------------------------------------------
   Validation
------------------------------------------------------- */

const validateManualPrice = (body) => {
  const {
    crop,
    market,
    minPrice,
    maxPrice,
    modalPrice,
  } = body;

  if (
    !crop ||
    typeof crop !== "string"
  ) {
    return "Crop is required";
  }

  if (
    !market ||
    typeof market !== "string"
  ) {
    return "Market is required";
  }

  const min = Number(minPrice);
  const max = Number(maxPrice);
  const modal = Number(modalPrice);

  if (
    !Number.isFinite(min) ||
    min < 0
  ) {
    return "minPrice must be a valid non-negative number";
  }

  if (
    !Number.isFinite(max) ||
    max < 0
  ) {
    return "maxPrice must be a valid non-negative number";
  }

  if (
    !Number.isFinite(modal) ||
    modal < 0
  ) {
    return "modalPrice must be a valid non-negative number";
  }

  if (min > max) {
    return "minPrice cannot be greater than maxPrice";
  }

  if (
    modal < min ||
    modal > max
  ) {
    return "modalPrice must be between minPrice and maxPrice";
  }

  return null;
};

/* -------------------------------------------------------
   GET /api/market
------------------------------------------------------- */

export const getMarketPrices =
  async (req, res) => {
    try {
      const {
        crop,
        state,
        district,
        market,
        limit,
        sync,
      } = req.query;

      let syncResult = null;

      if (sync === "true") {
        syncResult =
          await syncGovernmentMarketPrices({
            crop,
            state,
            district,
            market,
            limit:
              limit || 100,
          });
      }

      let prices =
        await getLatestMarketPrices({
          crop,
          state,
          district,
          market,
          limit,
        });

      /*
       * Auto sync only if cache is empty.
       */

      if (
        prices.length === 0 &&
        sync !== "false"
      ) {
        syncResult =
          await syncGovernmentMarketPrices({
            crop,
            state,
            district,
            market,
            limit:
              limit || 100,
          });

        prices =
          await getLatestMarketPrices({
            crop,
            state,
            district,
            market,
            limit,
          });
      }

      return res.status(200).json({
        success: true,
        count: prices.length,
        synced:
          syncResult !== null,
        sync: syncResult,
        data: prices,
      });
    } catch (error) {
      console.error(
        "Get Market Prices Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch market prices",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

/* -------------------------------------------------------
   GET /api/market/:id
------------------------------------------------------- */

export const getMarketPrice =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid market price ID",
        });
      }

      const price =
        await getMarketPriceById(id);

      if (!price) {
        return res.status(404).json({
          success: false,
          message:
            "Market price not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: price,
      });
    } catch (error) {
      console.error(
        "Get Market Price Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch market price",
      });
    }
  };

/* -------------------------------------------------------
   POST /api/market
------------------------------------------------------- */

export const createManualMarketPrice =
  async (req, res) => {
    try {
      const validationError =
        validateManualPrice(req.body);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const price =
        await MarketPrice.create({
          crop: req.body.crop.trim(),

          variety:
            req.body.variety?.trim() ||
            null,

          market:
            req.body.market.trim(),

          district:
            req.body.district?.trim() ||
            null,

          state:
            req.body.state?.trim() ||
            null,

          minPrice:
            Number(req.body.minPrice),

          maxPrice:
            Number(req.body.maxPrice),

          modalPrice:
            Number(req.body.modalPrice),

          unit:
            req.body.unit?.trim() ||
            "quintal",

          priceDate:
            req.body.priceDate
              ? new Date(
                  req.body.priceDate
                )
              : new Date(),

          source: "manual",

          sourceName: "FARMIO",

          sourceRecordId: null,

          isActive: true,
        });

      return res.status(201).json({
        success: true,
        message:
          "Market price created successfully",
        data: price,
      });
    } catch (error) {
      console.error(
        "Create Manual Market Price Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create market price",
      });
    }
  };

/* -------------------------------------------------------
   POST /api/market/sync
------------------------------------------------------- */

export const syncMarketPrices =
  async (req, res) => {
    try {
      const result =
        await syncGovernmentMarketPrices({
          crop: req.body?.crop,
          state: req.body?.state,
          district: req.body?.district,
          market: req.body?.market,
          limit:
            req.body?.limit || 100,
        });

      return res.status(200).json({
        success: true,
        message:
          "Government market prices synchronized successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Market Sync Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to synchronize government market prices",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

/* -------------------------------------------------------
   GET /api/market/farm/:farmId/intelligence
------------------------------------------------------- */

export const getFarmMarketIntelligenceController =
  async (req, res) => {
    try {
      const { farmId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          farmId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid farm ID",
        });
      }

      const intelligence =
        await getFarmMarketIntelligence(
          farmId,
          req.user.userId
        );

      if (!intelligence) {
        return res.status(404).json({
          success: false,
          message:
            "Farm not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: intelligence,
      });
    } catch (error) {
      console.error(
        "Farm Market Intelligence Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate market intelligence",
      });
    }
  };