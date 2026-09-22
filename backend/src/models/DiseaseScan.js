import mongoose from "mongoose";

const diseaseScanSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    detectedDisease: {
      type: String,
      default: null,
      trim: true,
    },
    confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: ["healthy", "mild", "moderate", "severe", "unknown"],
      default: "unknown",
    },
    symptoms: {
      type: [String],
      default: [],
    },
    treatment: {
      type: [String],
      default: [],
    },
    organicTreatment: {
      type: [String],
      default: [],
    },
    prevention: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "analyzed", "failed"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["ai", "manual", "expert"],
      default: "ai",
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add useful indexes
diseaseScanSchema.index({ owner: 1 });
diseaseScanSchema.index({ farm: 1 });
diseaseScanSchema.index({ crop: 1 });
diseaseScanSchema.index({ scannedAt: -1 });
diseaseScanSchema.index({ status: 1 });

const DiseaseScan = mongoose.model("DiseaseScan", diseaseScanSchema);

export default DiseaseScan;
