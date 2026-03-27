import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Trash2, Bot, User } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "How am I doing with my budget this month?",
  "Which category am I overspending on?",
  "Give me tips to reduce my expenses",
  "Summarise my spending this month",
  "How do I build an emergency fund?",
  "What's the 50/30/20 budgeting rule?",
];

const TypingIndicator = () => (
  <div className="flex items-end gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
      <Bot className="h-4 w-4 text-primary" />
    </div>
    <div className="glass-card flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  </div>
);

const formatContent = (content: string) => {
  // Convert **bold** to bold spans and bullet points to styled list
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            {line.replace(/^[-•] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
          </span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="leading-relaxed">
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-semibold text-foreground">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </p>
    );
  });
};

const Chat = () => {
  const { current: workspace } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your Emwrap financial assistant. I have access to your workspace data and can help you understand your spending, set better budgets, or answer any financial questions.\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Build history from previous messages (exclude welcome)
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post("/ai/chat", {
        message: messageText,
        history,
        workspace_id: workspace.id !== "0" ? workspace.id : undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check that your backend is running and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your Emwrap financial assistant. I have access to your workspace data and can help you understand your spending, set better budgets, or answer any financial questions.\n\nWhat would you like to know?`,
        timestamp: new Date(),
      },
    ]);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Aware of your {workspace.name} workspace · asks anything
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-expense/50 hover:text-expense"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant" ? "bg-primary/20" : "bg-muted"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "glass-card rounded-bl-sm text-muted-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-0.5">
                    {formatContent(msg.content)}
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
                <p
                  className={`mt-1.5 text-[10px] ${
                    msg.role === "user"
                      ? "text-primary-foreground/60 text-right"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="glass-card flex items-end gap-3 p-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your finances..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          style={{ maxHeight: "120px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </motion.button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default Chat;
