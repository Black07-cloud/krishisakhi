import mongoose from "mongoose";

const farmTaskSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "irrigation",
        "fertilizer",
        "pest",
        "harvest",
        "general",
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    dueAt: {
      type: Date,
    },

    source: {
      type: String,
      enum: ["manual", "automation", "ai"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

farmTaskSchema.index({ owner: 1, farm: 1 });
farmTaskSchema.index({ owner: 1, status: 1 });
farmTaskSchema.index({ farm: 1, status: 1 });
farmTaskSchema.index({ source: 1 });

const FarmTask = mongoose.model("FarmTask", farmTaskSchema);

export default FarmTask;