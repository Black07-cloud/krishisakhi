import mongoose from "mongoose";
import CropListing from "../models/CropListing.js";
import MarketEnquiry from "../models/MarketEnquiry.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

// Escape regex helper
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* -------------------------------------------------------
   CREATE CROP LISTING
------------------------------------------------------- */
export const createListingService = async (sellerId, data) => {
  const farmId = data.farmId || data.farm;
  const cropId = data.cropId || data.crop || null;

  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    const error = new Error("Invalid farm ID");
    error.status = 400;
    throw error;
  }

  const farm = await Farm.findOne({ _id: farmId, owner: sellerId });
  if (!farm) {
    const error = new Error("Farm not found or unauthorized");
    error.status = 404;
    throw error;
  }

  let crop = null;
  if (cropId) {
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      const error = new Error("Invalid crop ID");
      error.status = 400;
      throw error;
    }

    crop = await Crop.findOne({ _id: cropId, owner: sellerId });
    if (!crop) {
      const error = new Error("Crop not found or unauthorized");
      error.status = 404;
      throw error;
    }
  }

  const listing = new CropListing({
    seller: sellerId,
    farm: farmId,
    crop: cropId || undefined,
    cropName: data.cropName || (crop ? crop.name : "Crop"),
    title: data.title,
    description: data.description,
    quantity: Number(data.quantity),
    quantityUnit: data.quantityUnit || "quintal",
    expectedPrice: Number(data.expectedPrice),
    priceUnit: data.priceUnit || "quintal",
    location: {
      state: farm.location?.state || data.state || "",
      district: farm.location?.district || data.district || "",
      village: farm.location?.village || data.village || "",
    },
    availableFrom: data.availableFrom ? new Date(data.availableFrom) : new Date(),
    availableUntil: data.availableUntil ? new Date(data.availableUntil) : undefined,
    contactPreference: data.contactPreference || "in_app",
    status: "active",
  });

  await listing.save();

  return await CropListing.findById(listing._id)
    .populate("farm", "name location")
    .populate("crop", "name variety")
    .populate("seller", "name email phone");
};

/* -------------------------------------------------------
   PUBLIC ACTIVE LISTINGS
------------------------------------------------------- */
export const getPublicListingsService = async (queryParams = {}) => {
  const {
    crop,
    cropName,
    state,
    district,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 20,
  } = queryParams;

  const filter = { status: "active" };

  const targetCrop = cropName || crop;
  if (targetCrop) {
    filter.cropName = new RegExp(`^${escapeRegex(targetCrop)}$`, "i");
  }

  if (state) {
    filter["location.state"] = new RegExp(`^${escapeRegex(state)}$`, "i");
  }

  if (district) {
    filter["location.district"] = new RegExp(`^${escapeRegex(district)}$`, "i");
  }

  if (minPrice || maxPrice) {
    filter.expectedPrice = {};
    if (minPrice) filter.expectedPrice.$gte = Number(minPrice);
    if (maxPrice) filter.expectedPrice.$lte = Number(maxPrice);
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { title: searchRegex },
      { cropName: searchRegex },
      { description: searchRegex },
      { "location.district": searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    CropListing.find(filter)
      .populate("farm", "name location")
      .populate("crop", "name variety")
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    CropListing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };
};

/* -------------------------------------------------------
   MY SELLER LISTINGS
------------------------------------------------------- */
export const getMyListingsService = async (sellerId, queryParams = {}) => {
  const { status, crop, search, page = 1, limit = 20 } = queryParams;

  const filter = { seller: sellerId };

  if (status) {
    filter.status = status;
  }

  if (crop) {
    filter.cropName = new RegExp(`^${escapeRegex(crop)}$`, "i");
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: searchRegex }, { cropName: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    CropListing.find(filter)
      .populate("farm", "name location")
      .populate("crop", "name variety")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    CropListing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };
};

/* -------------------------------------------------------
   GET SINGLE LISTING DETAILS
------------------------------------------------------- */
export const getListingByIdService = async (id, requesterId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid listing ID");
    error.status = 400;
    throw error;
  }

  const listing = await CropListing.findById(id)
    .populate("farm", "name location")
    .populate("crop", "name variety")
    .populate("seller", "name email phone");

  if (!listing) {
    const error = new Error("Crop listing not found");
    error.status = 404;
    throw error;
  }

  // Filter sensitive contact info if requester is not seller and contactPreference is in_app
  const listObj = listing.toObject();
  if (requesterId && listObj.seller?._id.toString() !== requesterId.toString()) {
    if (listObj.contactPreference === "in_app") {
      delete listObj.seller.phone;
      delete listObj.seller.email;
    }
  }

  return listObj;
};

/* -------------------------------------------------------
   UPDATE LISTING
------------------------------------------------------- */
export const updateListingService = async (sellerId, id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid listing ID");
    error.status = 400;
    throw error;
  }

  const listing = await CropListing.findOne({ _id: id, seller: sellerId });
  if (!listing) {
    const error = new Error("Listing not found or unauthorized");
    error.status = 404;
    throw error;
  }

  if (updateData.title) listing.title = updateData.title;
  if (updateData.description !== undefined) listing.description = updateData.description;
  if (updateData.quantity !== undefined) listing.quantity = Number(updateData.quantity);
  if (updateData.quantityUnit) listing.quantityUnit = updateData.quantityUnit;
  if (updateData.expectedPrice !== undefined) listing.expectedPrice = Number(updateData.expectedPrice);
  if (updateData.priceUnit) listing.priceUnit = updateData.priceUnit;
  if (updateData.availableFrom) listing.availableFrom = new Date(updateData.availableFrom);
  if (updateData.availableUntil) listing.availableUntil = new Date(updateData.availableUntil);
  if (updateData.status) listing.status = updateData.status;
  if (updateData.contactPreference) listing.contactPreference = updateData.contactPreference;

  await listing.save();

  return await CropListing.findById(listing._id)
    .populate("farm", "name location")
    .populate("crop", "name variety");
};

/* -------------------------------------------------------
   UPDATE STATUS (E.G. MARK AS SOLD)
------------------------------------------------------- */
export const updateListingStatusService = async (sellerId, id, status) => {
  const allowedStatuses = ["active", "reserved", "sold", "closed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${allowedStatuses.join(", ")}`);
    error.status = 400;
    throw error;
  }

  const listing = await CropListing.findOneAndUpdate(
    { _id: id, seller: sellerId },
    { status },
    { new: true, runValidators: true }
  );

  if (!listing) {
    const error = new Error("Listing not found or unauthorized");
    error.status = 404;
    throw error;
  }

  return listing;
};

/* -------------------------------------------------------
   DELETE LISTING
------------------------------------------------------- */
export const deleteListingService = async (sellerId, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid listing ID");
    error.status = 400;
    throw error;
  }

  const listing = await CropListing.findOneAndDelete({ _id: id, seller: sellerId });
  if (!listing) {
    const error = new Error("Listing not found or unauthorized");
    error.status = 404;
    throw error;
  }

  return { success: true };
};

/* =======================================================
   ENQUIRIES SERVICE
======================================================= */

export const createEnquiryService = async (buyerId, listingId, message) => {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    const error = new Error("Invalid listing ID");
    error.status = 400;
    throw error;
  }

  const listing = await CropListing.findById(listingId);
  if (!listing) {
    const error = new Error("Listing not found");
    error.status = 404;
    throw error;
  }

  if (listing.status !== "active") {
    const error = new Error("Cannot send enquiry on an inactive or sold crop listing.");
    error.status = 400;
    throw error;
  }

  if (listing.seller.toString() === buyerId.toString()) {
    const error = new Error("You cannot send an enquiry on your own listing.");
    error.status = 400;
    throw error;
  }

  const existingEnquiry = await MarketEnquiry.findOne({
    listing: listingId,
    buyer: buyerId,
  });

  if (existingEnquiry) {
    const error = new Error("You have already sent an enquiry for this crop listing.");
    error.status = 400;
    throw error;
  }

  const enquiry = new MarketEnquiry({
    listing: listingId,
    buyer: buyerId,
    seller: listing.seller,
    message: message || "I am interested in purchasing this crop. Please get in touch.",
    status: "pending",
  });

  await enquiry.save();

  return await MarketEnquiry.findById(enquiry._id)
    .populate("listing", "title cropName expectedPrice priceUnit quantity quantityUnit")
    .populate("seller", "name phone email");
};

export const getMyEnquiriesService = async (buyerId) => {
  return await MarketEnquiry.find({ buyer: buyerId })
    .populate("listing", "title cropName expectedPrice priceUnit location status")
    .populate("seller", "name phone email")
    .sort({ createdAt: -1 });
};

export const getSellerEnquiriesService = async (sellerId) => {
  return await MarketEnquiry.find({ seller: sellerId })
    .populate("listing", "title cropName expectedPrice priceUnit quantity quantityUnit status")
    .populate("buyer", "name email phone")
    .sort({ createdAt: -1 });
};

export const updateEnquiryStatusService = async (sellerId, enquiryId, status) => {
  const allowed = ["accepted", "rejected", "closed"];
  if (!allowed.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${allowed.join(", ")}`);
    error.status = 400;
    throw error;
  }

  const enquiry = await MarketEnquiry.findOneAndUpdate(
    { _id: enquiryId, seller: sellerId },
    { status },
    { new: true, runValidators: true }
  )
    .populate("listing", "title cropName expectedPrice priceUnit")
    .populate("buyer", "name email phone");

  if (!enquiry) {
    const error = new Error("Enquiry not found or unauthorized");
    error.status = 404;
    throw error;
  }

  return enquiry;
};
