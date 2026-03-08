"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store";
import {
  Sparkles,
  Send,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function RightPanel() {
  const { selectedModule, currentProject, addModule, updateModule } =
    useProjectStore();
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const handleGenerate = async () => {
    if (!selectedModule) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/modules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject?.id,
          moduleId: selectedModule.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        updateModule(selectedModule.id, {
          status: "completed",
          files: data.files,
        });
      }
    } catch (error) {
      console.error("Error generating module:", error);
      updateModule(selectedModule.id, { status: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setChatHistory([...chatHistory, { role: "user", content: userMessage }]);

    // TODO: Implement AI chat
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI assistant response will appear here.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 flex items-center px-4">
        <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
        <span className="text-white font-medium">AI Assistant</span>
      </div>

      {/* Module Info */}
      {selectedModule && (
        <div className="p-4 border-b border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">
              {selectedModule.name}
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              {selectedModule.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              {selectedModule.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : selectedModule.status === "generating" ? (
                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-300 capitalize">
                {selectedModule.status}
              </span>
            </div>

            {selectedModule.status === "pending" && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Code
                  </>
                )}
              </button>
            )}

            {selectedModule.dependencies.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-2">Dependencies:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedModule.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-400"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            Ask me anything about your project
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500/20 ml-4"
                  : "bg-slate-800/50 mr-4"
              }`}
            >
              <p className="text-sm text-slate-300">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask AI..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
