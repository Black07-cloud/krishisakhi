import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getMarketPrices,
  getTodayMarketPrices,
  getMarketTrend,
  getMarketComparison,
  getMarketSummary,
  getMarketPrice,
  syncMarketPrices,
  getFarmMarketIntelligenceController,
  createListing,
  getPublicListings,
  getMyListings,
  getListingById,
  updateListing,
  updateListingStatus,
  deleteListing,
  generateListingDescription,
  createEnquiry,
  getMyEnquiries,
  getSellerEnquiries,
  updateEnquiryStatus,
} from "../Controllers/marketController.js";

const router = express.Router();

// Require authentication for all market routes
router.use(protect);

// Market Intelligence endpoints
router.get("/today", getTodayMarketPrices);
router.get("/trend", getMarketTrend);
router.get("/compare", getMarketComparison);
router.get("/summary", getMarketSummary);
router.get("/farm/:farmId/intelligence", getFarmMarketIntelligenceController);
router.post("/sync", syncMarketPrices);

// Crop Selling Marketplace endpoints
router.post("/listings", createListing);
router.get("/listings", getPublicListings);
router.get("/listings/mine", getMyListings);
router.post("/listings/generate-description", generateListingDescription);
router.get("/listings/:id", getListingById);
router.put("/listings/:id", updateListing);
router.patch("/listings/:id/status", updateListingStatus);
router.delete("/listings/:id", deleteListing);

// Enquiry endpoints
router.post("/listings/:listingId/enquiries", createEnquiry);
router.get("/enquiries/mine", getMyEnquiries);
router.get("/enquiries/seller", getSellerEnquiries);
router.patch("/enquiries/:id/status", updateEnquiryStatus);

// Base market prices query and single price details
router.get("/", getMarketPrices);
router.get("/:id", getMarketPrice);

export default router;
