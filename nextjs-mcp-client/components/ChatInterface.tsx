"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onResearch: (topic: string, query: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onResearch,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [topic, setTopic] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim() || !topic.trim() || isLoading) return;

    onResearch(topic, inputValue);
    setInputValue("");
    setTopic("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Topic Input */}
      <div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Research topic..."
          className="w-full px-3 py-2 border rounded text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-input)",
            borderColor: "var(--color-border)",
            color: "var(--color-foreground)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-ring)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
          disabled={isLoading}
        />
      </div>

      {/* Query Input with Send Button */}
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your research query..."
          className="w-full px-3 py-2 pr-12 border rounded resize-none text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-input)",
            borderColor: "var(--color-border)",
            color: "var(--color-foreground)",
            minHeight: "80px",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-ring)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
          disabled={isLoading}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !topic.trim() || isLoading}
          className="absolute bottom-2 right-2 p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              !inputValue.trim() || !topic.trim() || isLoading
                ? "var(--color-muted)"
                : "var(--color-primary)",
            color:
              !inputValue.trim() || !topic.trim() || isLoading
                ? "var(--color-muted-foreground)"
                : "white",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && inputValue.trim() && topic.trim()) {
              e.currentTarget.style.opacity = "0.9";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          aria-label="Start research"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
