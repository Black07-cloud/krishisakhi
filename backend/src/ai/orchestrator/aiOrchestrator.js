import AIConversation from "../../models/AIConversation.js";
import AIMessage from "../../models/AIMessage.js";
import { detectIntentAndEntities } from "./intentRouter.js";
import { buildQueryContext } from "./contextBuilder.js";
import { executeDemoReasoning } from "../reasoning/demoReasoningEngine.js";
import { generateAIResponseContent } from "../response/responseGenerator.js";

export const processAIChatMessage = async (userId, { conversationId, message, language = "en" }) => {
  if (!message || !message.trim()) {
    const error = new Error("Message content is required");
    error.status = 400;
    throw error;
  }

  // 1. Manage or create conversation session
  let conversation = null;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, user: userId, isActive: true });
  }

  if (!conversation) {
    const titleSnippet = message.trim().slice(0, 30);
    conversation = new AIConversation({
      user: userId,
      title: titleSnippet || "New Chat",
      language,
      lastMessageAt: new Date(),
    });
    await conversation.save();
  }

  // 2. Save user message to database
  const userMsgRecord = new AIMessage({
    conversation: conversation._id,
    user: userId,
    role: "user",
    content: message.trim(),
  });
  await userMsgRecord.save();

  // 3. Detect intent and entities
  const intentObj = detectIntentAndEntities(message);

  // 4. Build context selectively from real MongoDB records
  const context = await buildQueryContext(userId, intentObj);

  // 5. Execute reasoning engine
  const reasoningResult = await executeDemoReasoning(message, context);

  // 6. Generate formatted Markdown content
  const responseContent = generateAIResponseContent(reasoningResult);

  // 7. Save assistant message to database
  const assistantMsgRecord = new AIMessage({
    conversation: conversation._id,
    user: userId,
    role: "assistant",
    content: responseContent,
    metadata: {
      intent: {
        name: intentObj.intent,
        confidence: intentObj.confidence,
      },
      agentsUsed: reasoningResult.agentsUsed,
      toolsUsed: reasoningResult.toolsUsed,
      dataSources: reasoningResult.dataSources,
      actions: reasoningResult.actions,
    },
  });
  await assistantMsgRecord.save();

  // Update conversation last message timestamp & title if first message
  conversation.lastMessageAt = new Date();
  if (conversation.title === "New Chat" || conversation.title === "New Conversation") {
    conversation.title = `${intentObj.entities?.crop || intentObj.intent.replace(/_/g, " ")} Chat`;
  }
  await conversation.save();

  return {
    conversationId: conversation._id,
    title: conversation.title,
    message: {
      id: assistantMsgRecord._id,
      role: "assistant",
      content: responseContent,
      createdAt: assistantMsgRecord.createdAt,
    },
    intent: intentObj,
    agentsUsed: reasoningResult.agentsUsed,
    toolsUsed: reasoningResult.toolsUsed,
    dataSources: reasoningResult.dataSources,
    actions: reasoningResult.actions,
  };
};
