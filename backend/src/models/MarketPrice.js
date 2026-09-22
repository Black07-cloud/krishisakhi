import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    cropName: {
      type: String,
      trim: true,
      index: true,
    },

    variety: {
      type: String,
      trim: true,
      default: null,
    },

    market: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    district: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    minPrice: {
      type: Number,
      required: true,
      min: [0, "minPrice must be non-negative"],
    },

    maxPrice: {
      type: Number,
      required: true,
      min: [0, "maxPrice must be non-negative"],
    },

    modalPrice: {
      type: Number,
      required: true,
      min: [0, "modalPrice must be non-negative"],
    },

    unit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "quintal",
      trim: true,
    },

    priceDate: {
      type: Date,
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "api", "government", "generated", "system"],
      default: "generated",
      index: true,
    },

    dataType: {
      type: String,
      enum: ["live", "demo"],
      default: "demo",
      index: true,
    },

    sourceName: {
      type: String,
      trim: true,
      default: null,
    },

    sourceRecordId: {
      type: String,
      trim: true,
      default: null,
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Populate cropName from crop before save if missing
marketPriceSchema.pre("save", function (next) {
  if (!this.cropName && this.crop) {
    this.cropName = this.crop;
  } else if (!this.crop && this.cropName) {
    this.crop = this.cropName;
  }
  next();
});

// Compound indexes
marketPriceSchema.index({ cropName: 1, district: 1, priceDate: -1 });
marketPriceSchema.index({ market: 1, cropName: 1, priceDate: -1 });
marketPriceSchema.index({ state: 1, cropName: 1, priceDate: -1 });
marketPriceSchema.index({ crop: 1, market: 1, priceDate: -1 });
marketPriceSchema.index({ source: 1, dataType: 1, priceDate: -1 });

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);

export default MarketPrice;
