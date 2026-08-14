"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseMaterial, setCourseMaterial] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const material = sessionStorage.getItem("courseMaterial");
    const name = sessionStorage.getItem("fileName");
    if (!material) {
      router.push("/");
      return;
    }
    setCourseMaterial(material);
    setFileName(name);
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm your RUET Study Buddy. I've loaded **${name || "your course material"}** and I'm ready to help.\n\nYou can:\n- Ask any question about the material\n- Request explanations of difficult concepts\n- Click "Generate Study Plan" for a structured study guide\n\nWhat would you like to know?`,
      },
    ]);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || !courseMaterial || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          courseMaterial,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const generateStudyPlan = async () => {
    if (!courseMaterial || loading) return;

    const userMessage: Message = {
      role: "user",
      content: "Generate a study plan for this material",
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseMaterial,
          action: "study-plan",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate plan");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error generating study plan: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Summarize the key concepts",
    "Explain the most important formulas",
    "What topics should I focus on for the exam?",
    "Create practice questions",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white py-3 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-green-200 hover:text-white transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <div className="h-6 w-px bg-green-500" />
            <div>
              <h1 className="font-bold">RUET Study Buddy</h1>
              <p className="text-green-200 text-xs">{fileName}</p>
            </div>
          </div>
          <button
            onClick={generateStudyPlan}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            📋 Study Plan
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-green-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-green-100 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      AI
                    </div>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content.split("**").map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className={msg.role === "user" ? "text-white" : "text-green-800"}>
                        {part}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-green-100 rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    AI
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-typing" />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-typing" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-typing" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-sm bg-white border border-green-200 text-green-700 px-4 py-2 rounded-full hover:bg-green-50 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-green-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your course material..."
              className="flex-1 resize-none border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-32"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Answers are based on your uploaded course material
          </p>
        </div>
      </div>
    </div>
  );
}
