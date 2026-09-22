import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  Sprout,
  Droplets,
  FlaskConical,
  ScanLine,
  CloudSun,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sendAIMessage } from "../../api/aiService";
import "./AI.css";

// ── Quick prompt suggestions ─────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: Sprout,       label: "Crop Advice",         text: "What crops should I plant this season?" },
  { icon: Droplets,     label: "Irrigation",          text: "How often should I irrigate my wheat crop?" },
  { icon: FlaskConical, label: "Soil Health",         text: "How can I improve my soil pH levels?" },
  { icon: ScanLine,     label: "Disease",             text: "My crop leaves are turning yellow. What could it be?" },
  { icon: CloudSun,     label: "Weather",             text: "How does the upcoming rainfall affect my crops?" },
  { icon: BookOpen,     label: "Govt. Schemes",       text: "What government schemes are available for small farmers?" },
];

// ── Message component ────────────────────────────────────────────────────────
const Message = ({ role, content, initials }) => (
  <div className={`ai-message ${role}`}>
    <div className={`ai-message-avatar ${role === "bot" ? "bot" : "user-avatar"}`}>
      {role === "bot" ? <Bot size={14} color="#4ade80" /> : initials}
    </div>
    <div className="ai-bubble">{content}</div>
  </div>
);

// ── Main AI Page ─────────────────────────────────────────────────────────────
const AI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const conversationIdRef = useRef(null);

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "FA";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
    }
  };

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      // Add user message immediately
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setSending(true);

      try {
        const res = await sendAIMessage(trimmed, conversationIdRef.current);
        // Store conversation ID for follow-up messages
        if (res?.conversationId) {
          conversationIdRef.current = res.conversationId;
        }
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: res?.reply || res?.message || "Response received." },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "The AI service is not connected yet. This UI is ready — wire up the backend /api/ai endpoints to enable responses.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickPrompt = (text) => {
    sendMessage(text);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="ai-page">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-icon">
          <Bot size={22} color="#4ade80" />
        </div>
        <div className="ai-chat-header-info">
          <h3>Farmio AI Assistant</h3>
          <p>
            <span className="ai-status-dot" aria-hidden="true" />
            Powered by Gemini · Agriculture specialist
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages" id="ai-messages-area" aria-live="polite">
        {showWelcome ? (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">
              <Bot size={30} color="#4ade80" />
            </div>
            <h3>Hello, {user?.name || "Farmer"}! 🌱</h3>
            <p>
              I&apos;m your AI farming assistant. Ask me anything about crops, soil,
              irrigation, weather, disease, or government schemes.
            </p>
            <div className="ai-quick-prompts" id="ai-quick-prompts">
              {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  className="ai-quick-btn"
                  onClick={() => handleQuickPrompt(text)}
                  id={`ai-quick-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  disabled={sending}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message
                key={i}
                role={msg.role}
                content={msg.content}
                initials={initials}
              />
            ))}
            {sending && (
              <div className="ai-message bot">
                <div className="ai-message-avatar bot">
                  <Bot size={14} color="#4ade80" />
                </div>
                <div className="ai-bubble" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="ai-input-area">
        <div className="ai-input-row">
          <textarea
            ref={textareaRef}
            className="ai-input"
            id="ai-message-input"
            placeholder="Ask about crops, soil, weather, diseases…"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
            disabled={sending}
          />
          <button
            className="ai-send-btn"
            id="ai-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            aria-label="Send message"
          >
            <Send size={18} color="#fff" />
          </button>
        </div>
        <div className="ai-input-hint">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AI;
