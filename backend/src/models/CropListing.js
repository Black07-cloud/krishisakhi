import mongoose from "mongoose";

const cropListingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },

    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      default: null,
      index: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    quantity: {
      type: Number,
      required: true,
      min: [0.01, "Quantity must be greater than 0"],
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "quintal",
    },

    expectedPrice: {
      type: Number,
      required: true,
      min: [0.01, "Expected price must be greater than 0"],
    },

    priceUnit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "quintal",
    },

    location: {
      state: String,
      district: String,
      village: String,
      latitude: Number,
      longitude: Number,
    },

    availableFrom: {
      type: Date,
      default: Date.now,
    },

    availableUntil: {
      type: Date,
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "reserved", "sold", "closed", "cancelled"],
      default: "active",
      index: true,
    },

    contactPreference: {
      type: String,
      enum: ["phone", "in_app", "both"],
      default: "in_app",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cropListingSchema.index({ status: 1, cropName: 1, createdAt: -1 });
cropListingSchema.index({ "location.state": 1, "location.district": 1, status: 1 });
cropListingSchema.index({ seller: 1, status: 1, createdAt: -1 });

const CropListing = mongoose.model("CropListing", cropListingSchema);

export default CropListing;
