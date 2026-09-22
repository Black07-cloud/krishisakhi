import mongoose from "mongoose";

const marketEnquirySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CropListing",
      required: true,
      index: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "closed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

marketEnquirySchema.index({ seller: 1, status: 1, createdAt: -1 });
marketEnquirySchema.index({ buyer: 1, createdAt: -1 });
marketEnquirySchema.index({ listing: 1, buyer: 1 }, { unique: true });

const MarketEnquiry = mongoose.model("MarketEnquiry", marketEnquirySchema);

export default MarketEnquiry;
