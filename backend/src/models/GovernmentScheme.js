import mongoose from "mongoose";

const governmentSchemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    shortName: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      enum: ["central", "state"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "crop",
        "irrigation",
        "equipment",
        "insurance",
        "finance",
        "soil",
        "fertilizer",
        "farmer_welfare",
        "horticulture",
        "organic_farming",
        "solar",
        "infrastructure",
        "other",
      ],
      required: true,
    },

    benefits: {
      type: [String],
      default: [],
    },

    eligibility: {
      type: [String],
      default: [],
    },

    requiredDocuments: {
      type: [String],
      default: [],
    },

    applicationProcess: {
      type: [String],
      default: [],
    },

    officialUrl: {
      type: String,
      trim: true,
    },

    informationUrl: {
      type: String,
      trim: true,
    },

    helpline: {
      type: String,
      trim: true,
    },

    lastUpdated: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

governmentSchemeSchema.index({ category: 1 });
governmentSchemeSchema.index({ state: 1 });
governmentSchemeSchema.index({ level: 1 });
governmentSchemeSchema.index({ isActive: 1 });
governmentSchemeSchema.index({ name: "text", description: "text" });

const GovernmentScheme = mongoose.model(
  "GovernmentScheme",
  governmentSchemeSchema,
);

export default GovernmentScheme;
