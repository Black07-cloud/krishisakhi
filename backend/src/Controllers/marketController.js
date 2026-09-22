import mongoose from "mongoose";
import MarketPrice from "../models/MarketPrice.js";
import {
  syncDailyMarketPrices,
  calculatePriceChangesForRecords,
} from "../services/marketDataService.js";
import {
  createListingService,
  getPublicListingsService,
  getMyListingsService,
  getListingByIdService,
  updateListingService,
  updateListingStatusService,
  deleteListingService,
  createEnquiryService,
  getMyEnquiriesService,
  getSellerEnquiriesService,
  updateEnquiryStatusService,
} from "../services/listingService.js";

/* =======================================================
   MARKET INTELLIGENCE CONTROLLERS
======================================================= */

/*
   GET /api/market/today
   Fetch today's market prices with calculated price change & demo/live indicators
*/
export const getTodayMarketPrices = async (req, res) => {
  try {
    // Ensure today's daily prices exist
    await syncDailyMarketPrices(false);

    const { crop, state, district, market, limit = 50 } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = { isActive: true, priceDate: { $gte: today } };

    if (crop) filter.cropName = new RegExp(`^${crop}$`, "i");
    if (state) filter.state = new RegExp(`^${state}$`, "i");
    if (district) filter.district = new RegExp(`^${district}$`, "i");
    if (market) filter.market = new RegExp(`^${market}$`, "i");

    const rawPrices = await MarketPrice.find(filter)
      .sort({ cropName: 1, modalPrice: -1 })
      .limit(Number(limit) || 50);

    const enriched = await calculatePriceChangesForRecords(rawPrices);

    const lastSynced = rawPrices[0]?.lastSyncedAt || new Date();
    const dataType = rawPrices[0]?.dataType || "demo";

    return res.status(200).json({
      success: true,
      count: enriched.length,
      dataType,
      lastSyncedAt: lastSynced,
      data: enriched,
    });
  } catch (error) {
    console.error("Get Today Market Prices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's market prices",
    });
  }
};

/*
   GET /api/market
   Query historical / latest market prices
*/
export const getMarketPrices = async (req, res) => {
  try {
    const { crop, cropName, state, district, market, limit = 20 } = req.query;

    const filter = { isActive: true };
    const targetCrop = cropName || crop;

    if (targetCrop) filter.cropName = new RegExp(`^${targetCrop}$`, "i");
    if (state) filter.state = new RegExp(`^${state}$`, "i");
    if (district) filter.district = new RegExp(`^${district}$`, "i");
    if (market) filter.market = new RegExp(`^${market}$`, "i");

    const rawPrices = await MarketPrice.find(filter)
      .sort({ priceDate: -1, createdAt: -1 })
      .limit(Math.min(Number(limit) || 20, 100));

    const enriched = await calculatePriceChangesForRecords(rawPrices);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error("Get Market Prices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market prices",
    });
  }
};

/*
   GET /api/market/trend
   Historical price trend over 7 or 30 days
*/
export const getMarketTrend = async (req, res) => {
  try {
    const { crop, cropName, market, days = 7 } = req.query;

    const targetCrop = cropName || crop || "Tomato";
    const daysNum = parseInt(days, 10) || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysNum);

    const filter = {
      isActive: true,
      cropName: new RegExp(`^${targetCrop}$`, "i"),
      priceDate: { $gte: cutoffDate },
    };

    if (market) {
      filter.market = new RegExp(`^${market}$`, "i");
    }

    const records = await MarketPrice.find(filter)
      .sort({ priceDate: 1 })
      .select("cropName market priceDate modalPrice minPrice maxPrice unit")
      .lean();

    return res.status(200).json({
      success: true,
      crop: targetCrop,
      days: daysNum,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get Market Trend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market trend",
    });
  }
};

/*
   GET /api/market/compare
   Compare crop modal prices across different markets/mandis
*/
export const getMarketComparison = async (req, res) => {
  try {
    const { crop, cropName, state, district } = req.query;
    const targetCrop = cropName || crop || "Tomato";

    const filter = {
      isActive: true,
      cropName: new RegExp(`^${targetCrop}$`, "i"),
    };

    if (state) filter.state = new RegExp(`^${state}$`, "i");
    if (district) filter.district = new RegExp(`^${district}$`, "i");

    const rawPrices = await MarketPrice.find(filter)
      .sort({ priceDate: -1, modalPrice: -1 })
      .limit(15);

    const enriched = await calculatePriceChangesForRecords(rawPrices);

    return res.status(200).json({
      success: true,
      crop: targetCrop,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error("Get Market Comparison Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market comparison",
    });
  }
};

/*
   GET /api/market/summary
   Market overview statistics
*/
export const getMarketSummary = async (req, res) => {
  try {
    await syncDailyMarketPrices(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await MarketPrice.countDocuments({
      isActive: true,
      priceDate: { $gte: today },
    });

    const availableCrops = await MarketPrice.distinct("cropName", { isActive: true });
    const availableMarkets = await MarketPrice.distinct("market", { isActive: true });
    const latestRecord = await MarketPrice.findOne({ isActive: true }).sort({ lastSyncedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        todayCount,
        availableCropsCount: availableCrops.length,
        availableMarketsCount: availableMarkets.length,
        availableCrops,
        availableMarkets,
        lastUpdated: latestRecord?.lastSyncedAt || new Date(),
        dataType: latestRecord?.dataType || "demo",
      },
    });
  } catch (error) {
    console.error("Get Market Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch market summary",
    });
  }
};

/*
   POST /api/market/sync
*/
export const syncMarketPrices = async (req, res) => {
  try {
    const result = await syncDailyMarketPrices(true);
    return res.status(200).json({
      success: true,
      message: "Market prices synced successfully",
      data: result,
    });
  } catch (error) {
    console.error("Sync Market Prices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync market prices",
    });
  }
};

/*
   GET /api/market/:id
*/
export const getMarketPrice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const price = await MarketPrice.findById(id).lean();
    if (!price) {
      return res.status(404).json({ success: false, message: "Market price not found" });
    }

    return res.status(200).json({ success: true, data: price });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch price" });
  }
};

/*
   POST /api/market
   Manual price creation for backward compatibility
*/
export const createManualMarketPrice = async (req, res) => {
  try {
    const price = await MarketPrice.create({
      crop: req.body.crop,
      cropName: req.body.crop,
      variety: req.body.variety || "Standard",
      market: req.body.market,
      district: req.body.district,
      state: req.body.state,
      minPrice: Number(req.body.minPrice),
      maxPrice: Number(req.body.maxPrice),
      modalPrice: Number(req.body.modalPrice),
      unit: req.body.unit || "quintal",
      priceDate: req.body.priceDate ? new Date(req.body.priceDate) : new Date(),
      source: "manual",
      dataType: "demo",
    });

    return res.status(201).json({ success: true, data: price });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create manual market price" });
  }
};

/*
   GET /api/market/farm/:farmId/intelligence
   Farm market intelligence for backward compatibility
*/
export const getFarmMarketIntelligenceController = async (req, res) => {
  try {
    const { farmId } = req.params;
    const latest = await MarketPrice.find({ isActive: true }).sort({ priceDate: -1 }).limit(10);
    return res.status(200).json({
      success: true,
      data: {
        farm: { id: farmId },
        prices: latest,
        trend: { direction: "stable", percentage: 0 },
        recommendation: "Compare nearby markets before deciding where to sell.",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch farm market intelligence" });
  }
};

/* =======================================================
   CROP SELLING / MARKETPLACE CONTROLLERS
======================================================= */

export const createListing = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { farmId, farm, cropName, title, quantity, expectedPrice } = req.body;

    if (!farmId && !farm) {
      return res.status(400).json({ success: false, message: "Farm is required" });
    }

    if (!cropName || !title) {
      return res.status(400).json({ success: false, message: "Crop name and title are required" });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
    }

    if (!expectedPrice || Number(expectedPrice) <= 0) {
      return res.status(400).json({ success: false, message: "Expected price must be greater than 0" });
    }

    const listing = await createListingService(sellerId, req.body);

    return res.status(201).json({
      success: true,
      message: "Your crop listing has been published.",
      data: listing,
    });
  } catch (error) {
    console.error("Create Listing Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create crop listing",
    });
  }
};

export const getPublicListings = async (req, res) => {
  try {
    const result = await getPublicListingsService(req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get Public Listings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch crop listings" });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const result = await getMyListingsService(sellerId, req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get My Listings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch your listings" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const requesterId = req.user?.userId;
    const listing = await getListingByIdService(req.params.id, requesterId);
    return res.status(200).json({ success: true, data: listing });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch listing",
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const updated = await updateListingService(sellerId, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update listing",
    });
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { status } = req.body;
    const updated = await updateListingStatusService(sellerId, req.params.id, status);
    return res.status(200).json({
      success: true,
      message: `Listing status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    await deleteListingService(sellerId, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete listing",
    });
  }
};

export const generateListingDescription = async (req, res) => {
  try {
    const { cropName, quantity, quantityUnit, expectedPrice, priceUnit, location } = req.body;
    const desc = `Fresh harvested ${cropName || "produce"} (${quantity || ""} ${quantityUnit || "quintal"}) available for immediate purchase. Offered at ₹${expectedPrice || ""}/${priceUnit || "quintal"}. Located in ${location?.district || location?.state || "local market region"}. Well maintained crop quality.`;
    return res.status(200).json({
      success: true,
      description: desc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate description" });
  }
};

/* =======================================================
   ENQUIRIES CONTROLLERS
======================================================= */

export const createEnquiry = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { listingId } = req.params;
    const { message } = req.body;

    const enquiry = await createEnquiryService(buyerId, listingId, message);

    return res.status(201).json({
      success: true,
      message: "Enquiry sent successfully to the seller.",
      data: enquiry,
    });
  } catch (error) {
    console.error("Create Enquiry Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to send enquiry",
    });
  }
};

export const getMyEnquiries = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const enquiries = await getMyEnquiriesService(buyerId);
    return res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
};

export const getSellerEnquiries = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const enquiries = await getSellerEnquiriesService(sellerId);
    return res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch seller enquiries" });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateEnquiryStatusService(sellerId, id, status);

    return res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update enquiry status",
    });
  }
};