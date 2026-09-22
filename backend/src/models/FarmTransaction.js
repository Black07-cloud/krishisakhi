import mongoose from "mongoose";

const farmTransactionSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be a positive number"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "upi", "credit", "other"],
      default: "cash",
    },

    source: {
      type: String,
      enum: ["manual", "sale", "market", "automation", "ai", "other"],
      default: "manual",
    },

    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
farmTransactionSchema.index({ owner: 1, farm: 1, date: -1 });
farmTransactionSchema.index({ owner: 1, crop: 1, date: -1 });
farmTransactionSchema.index({ owner: 1, type: 1, date: -1 });
farmTransactionSchema.index({ owner: 1, category: 1, date: -1 });

const FarmTransaction = mongoose.model("FarmTransaction", farmTransactionSchema);

export default FarmTransaction;
