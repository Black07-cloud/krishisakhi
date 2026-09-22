import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sprout,
  Droplets,
  FlaskConical,
  CloudSun,
  ScanLine,
  Store,
  Wallet,
  Landmark,
  MessageSquare,
  Sidebar as SidebarIcon,
  Info,
  ChevronRight,
  Database,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  sendChatMessage,
  getAIConversations,
  getAIConversation,
  createAIConversation,
  deleteAIConversation,
} from "../../api/aiService";
import "./AI.css";

const QUICK_SUGGESTIONS = [
  {
    topic: "Irrigation",
    icon: Droplets,
    prompt: "When should I irrigate my tomato crop?",
  },
  {
    topic: "Market",
    icon: Store,
    prompt: "What is today's tomato market price?",
  },
  {
    topic: "Finance",
    icon: Wallet,
    prompt: "Show my farm finance expenses",
  },
  {
    topic: "Government Schemes",
    icon: Landmark,
    prompt: "Which government schemes are available?",
  },
  {
    topic: "Soil Health",
    icon: FlaskConical,
    prompt: "How is my soil health status?",
  },
  {
    topic: "Disease",
    icon: ScanLine,
    prompt: "Check my latest disease scan",
  },
];

const AI = () => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "FA";

  // Conversations & Chat State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [traceStep, setTraceStep] = useState(""); // Step trace animation

  // Context drawer & Sidebar state
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, traceStep]);

  // Load conversation list on mount
  const loadConversationsList = useCallback(async () => {
    try {
      const res = await getAIConversations();
      if (res && res.success) {
        setConversations(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load AI conversations:", err);
    }
  }, []);

  useEffect(() => {
    loadConversationsList();
  }, [loadConversationsList]);

  // Load single conversation details
  const handleSelectConversation = async (convId) => {
    setCurrentConversationId(convId);
    setLoadingMessages(true);
    try {
      const res = await getAIConversation(convId);
      if (res && res.success) {
        const historyMsgs = (res.data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          metadata: m.metadata,
        }));
        setMessages(historyMsgs);
      }
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const [loadingMessages, setLoadingMessages] = useState(false);

  // Start new chat session
  const handleNewChat = async () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputMessage("");
  };

  // Delete conversation
  const handleDeleteChat = async (convId, e) => {
    e.stopPropagation();
    try {
      await deleteAIConversation(convId);
      if (currentConversationId === convId) {
        handleNewChat();
      }
      loadConversationsList();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Send message to AI Assistant
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending) return;

    // Add user message to UI
    const newUserMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);

    // Simulate Agent Activity Trace Steps
    setTraceStep("Understanding your query & detecting intent...");
    await new Promise((r) => setTimeout(r, 400));
    setTraceStep("Gathering relevant farm, crop & weather database records...");
    await new Promise((r) => setTimeout(r, 400));
    setTraceStep("Running Farmio Reasoning Engine...");

    try {
      const res = await sendChatMessage({
        conversationId: currentConversationId,
        message: text,
      });

      if (res && res.success && res.data) {
        const { conversationId, message: assistantMsg, metadata } = res.data;

        if (!currentConversationId && conversationId) {
          setCurrentConversationId(conversationId);
          loadConversationsList();
        }

        const newAssistantMsg = {
          role: "assistant",
          content: assistantMsg.content,
          metadata: res.data,
        };

        setMessages((prev) => [...prev, newAssistantMsg]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble processing your request right now. Please verify your connection and try again.",
        },
      ]);
    } finally {
      setTraceStep("");
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeMetadata = messages
    .slice()
    .reverse()
    .find((m) => m.metadata)?.metadata;

  return (
    <div className="ai-page-layout">
      {/* Left History Sidebar */}
      <aside
        className={`ai-history-sidebar ${showHistorySidebar ? "open" : ""}`}
      >
        <div className="history-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="history-list">
          {conversations.map((c) => (
            <div
              key={c._id}
              className={`history-item ${currentConversationId === c._id ? "active" : ""}`}
              onClick={() => handleSelectConversation(c._id)}
            >
              <div className="history-title-box">
                <MessageSquare size={15} />
                <span>{c.title || "Farm Chat"}</span>
              </div>
              <button
                className="delete-chat-btn"
                onClick={(e) => handleDeleteChat(c._id, e)}
                title="Delete conversation"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Main Chat Area */}
      <main className="ai-main-chat">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="header-left-info">
            <button
              className="icon-action-btn mobile-only"
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            >
              <SidebarIcon size={18} />
            </button>
            <div className="ai-bot-avatar">
              <Bot size={22} />
            </div>
            <div className="header-title-text">
              <h3>Farmio AI Assistant</h3>
              <p>
                <span className="ai-status-dot" />
                Farmio AI — Demo AI Engine
              </p>
            </div>
          </div>

          <div className="header-actions-group">
            <button
              className="icon-action-btn"
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              title="Toggle Context Panel"
            >
              <Database size={18} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="ai-messages-feed">
          {messages.length === 0 ? (
            <div className="ai-welcome-box">
              <div className="welcome-bot-icon">
                <Bot size={32} />
              </div>
              <h2>Hello, {user?.name || "Farmer"}! 🌱</h2>
              <p>
                I am your central AI farming assistant. Ask me anything about
                your crops, irrigation, soil health, weather forecasts, disease
                scans, market prices, or government schemes.
              </p>

              {/* Suggested Prompts Grid */}
              <div className="suggested-prompts-grid">
                {QUICK_SUGGESTIONS.map(({ topic, icon: Icon, prompt }) => (
                  <button
                    key={topic}
                    className="prompt-card"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={sending}
                  >
                    <span>{prompt}</span>
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              {/* Quick Topic Pills */}
              <div className="topic-pills-row">
                {QUICK_SUGGESTIONS.map(({ topic, icon: Icon }) => (
                  <button
                    key={topic}
                    className="topic-pill-btn"
                    onClick={() =>
                      handleSendMessage(
                        `Tell me about my ${topic.toLowerCase()}`,
                      )
                    }
                    disabled={sending}
                  >
                    <Icon size={12} />
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={`message-row ${isUser ? "user" : "bot"}`}
                  >
                    <div
                      className={`message-avatar ${isUser ? "user" : "bot"}`}
                    >
                      {isUser ? initials : <Bot size={16} />}
                    </div>

                    <div className="message-bubble">
                      <div
                        className="formatted-markdown"
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/### (.*)/g, "<h3>$1</h3>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.*?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br />"),
                        }}
                      />

                      {!isUser && (
                        <div className="message-meta-bar">
                          <button
                            className="copy-btn"
                            onClick={() => handleCopyText(msg.content, index)}
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={12} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          {msg.metadata?.agentsUsed && (
                            <span>
                              Agents: {msg.metadata.agentsUsed.join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Agent Activity Trace Loader */}
              {sending && (
                <div className="message-row bot">
                  <div className="message-avatar bot">
                    <Bot size={16} />
                  </div>
                  <div className="agent-activity-trace">
                    <Sparkles size={16} className="spin" />
                    <span>{traceStep || "Farmio AI is analyzing data..."}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Composer */}
        <div className="ai-composer-container">
          <div className="composer-input-box">
            <textarea
              ref={textareaRef}
              className="composer-textarea"
              placeholder="Ask Farmio AI about irrigation, soil, weather, market rates..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className="send-message-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || sending}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="composer-hints">
            Press Enter to send · Shift+Enter for new line · Farmio AI — Demo AI
            Engine
          </div>
        </div>
      </main>

      {/* Right Side Context Panel */}
      {showContextDrawer && (
        <aside className="ai-context-drawer">
          <div className="context-header">
            <h4>Context & Agents Trace</h4>
            <p>Retrieved farm database state</p>
          </div>

          <div className="context-card">
            <div className="context-card-title">
              <Sprout size={14} />
              <span>Active Agent</span>
            </div>
            <div className="context-card-val">
              {activeMetadata?.intent?.name
                ? `${activeMetadata.intent.name} Agent`
                : "General Agent"}
            </div>
          </div>

          <div className="context-card">
            <div className="context-card-title">
              <Database size={14} />
              <span>Data Sources Used</span>
            </div>
            <div
              className="context-card-val"
              style={{ fontSize: "0.825rem", color: "#64748b" }}
            >
              {activeMetadata?.dataSources?.length > 0
                ? activeMetadata.dataSources.join(", ")
                : "farm, crop"}
            </div>
          </div>

          <div className="context-card">
            <div className="context-card-title">
              <Info size={14} />
              <span>Demo Engine Note</span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#64748b",
                lineHeight: 1.4,
              }}
            >
              Demonstrating full multi-agent orchestration & real database
              retrieval without external LLM API costs.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default AI;
