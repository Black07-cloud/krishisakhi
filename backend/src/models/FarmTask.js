import mongoose from "mongoose";

const farmTaskSchema = new mongoose.Schema(
  {
    owner: {
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "irrigation",
        "fertilizer",
        "pest",
        "disease",
        "harvest",
        "planting",
        "inspection",
        "weather",
        "market",
        "general",
      ],
      default: "general",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    dueAt: {
      type: Date,
      required: true,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      enum: ["manual", "automation", "ai"],
      default: "manual",
      index: true,
    },

    automationKey: {
      type: String,
      default: null,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

farmTaskSchema.index({ owner: 1, farm: 1, dueAt: 1 });
farmTaskSchema.index({ owner: 1, status: 1, dueAt: 1 });
farmTaskSchema.index({ owner: 1, crop: 1, status: 1 });
farmTaskSchema.index({ owner: 1, source: 1 });

const FarmTask = mongoose.model("FarmTask", farmTaskSchema);

export default FarmTask;