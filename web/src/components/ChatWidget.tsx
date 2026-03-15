"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "What is your biggest prospecting challenge?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: 16, width: 420, height: 600, maxHeight: "80vh", background: "#0a0a0b", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 60px rgba(139, 92, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111113" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image src="/logo.svg" alt="Forage" width={40} height={40} style={{ borderRadius: 10 }} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fafafa", margin: 0 }}>Forage AI</h3>
                  <p style={{ fontSize: 12, color: "#71717a", margin: 0 }}>Ask anything about Forage</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 8, cursor: "pointer", color: "#71717a", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#71717a" }}><p style={{ margin: 0, fontSize: 14 }}>Hey! What brings you to Forage today?</p></div>}
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", padding: "12px 16px", borderRadius: 16, background: msg.role === "user" ? "#8b5cf6" : "#18181b", color: "#fafafa", fontSize: 14, lineHeight: 1.5 }}>
                  {msg.content}
                </div>
              ))}
              {isLoading && <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: 16, background: "#18181b", color: "#71717a", fontSize: 14 }}>Thinking...</div>}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", background: "#111113" }}>
              <div style={{ display: "flex", gap: 8, background: "#0a0a0b", borderRadius: 12, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about Forage..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fafafa", fontSize: 14 }}
                />
                <button onClick={send} disabled={isLoading || !input.trim()} style={{ background: "#8b5cf6", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "white", display: "flex", opacity: isLoading || !input.trim() ? 0.5 : 1 }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 0 30px rgba(139,92,246,0.4), 0 8px 32px rgba(139, 92, 246, 0.3)", overflow: "hidden" }}
      >
        {isOpen ? <X size={26} /> : <Image src="/logo.svg" alt="Forage" width={36} height={36} />}
      </motion.button>
    </div>
  );
}
