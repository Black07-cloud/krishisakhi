import express from "express";
import protect from "../middleware/authMiddleware.js";
import AIConversation from "../models/AIConversation.js";
import AIMessage from "../models/AIMessage.js";
import { processAIChatMessage } from "../ai/orchestrator/aiOrchestrator.js";

const router = express.Router();

// Require authentication for AI assistant endpoints
router.use(protect);

/*
 * POST /api/ai/chat
 * Central AI Chat endpoint
 */
router.post("/chat", async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await processAIChatMessage(userId, req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "AI processing failed",
    });
  }
});

/*
 * GET /api/ai/conversations
 * Fetch user's conversation history
 */
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await AIConversation.find({ user: userId, isActive: true })
      .sort({ lastMessageAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
});

/*
 * GET /api/ai/conversations/:id
 * Fetch single conversation with messages
 */
router.get("/conversations/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const conversation = await AIConversation.findOne({ _id: id, user: userId, isActive: true });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await AIMessage.find({ conversation: id, user: userId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get Conversation Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation details",
    });
  }
});

/*
 * POST /api/ai/conversations
 * Start new conversation
 */
router.post("/conversations", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title = "New Chat", language = "en" } = req.body;

    const conversation = new AIConversation({
      user: userId,
      title: title.trim(),
      language,
    });
    await conversation.save();

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});

/*
 * DELETE /api/ai/conversations/:id
 * Delete conversation
 */
router.delete("/conversations/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await AIConversation.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false }
    );
    await AIMessage.deleteMany({ conversation: id, user: userId });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
});

export default router;
