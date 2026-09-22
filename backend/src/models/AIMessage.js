import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIConversation",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    metadata: {
      intent: {
        name: String,
        confidence: Number,
      },
      agentsUsed: [String],
      toolsUsed: [String],
      dataSources: [String],
      actions: [mongoose.Schema.Types.Mixed],
      contextData: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

aiMessageSchema.index({ conversation: 1, createdAt: 1 });

const AIMessage = mongoose.model("AIMessage", aiMessageSchema);

export default AIMessage;
