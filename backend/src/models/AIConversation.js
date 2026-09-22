import mongoose from "mongoose";

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Chat",
    },

    language: {
      type: String,
      enum: ["en", "ta", "hi", "ml", "thanglish"],
      default: "en",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ user: 1, lastMessageAt: -1 });

const AIConversation = mongoose.model("AIConversation", aiConversationSchema);

export default AIConversation;
