import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
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
      trim: true,
      default: null,
    },

    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    modalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
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
      enum: ["manual", "api", "government", "system"],
      default: "manual",
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

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Query indexes
 */
marketPriceSchema.index({
  crop: 1,
  market: 1,
  priceDate: -1,
});

marketPriceSchema.index({
  state: 1,
  district: 1,
  crop: 1,
  priceDate: -1,
});

marketPriceSchema.index(
  {
    sourceName: 1,
    sourceRecordId: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);

export default MarketPrice;
