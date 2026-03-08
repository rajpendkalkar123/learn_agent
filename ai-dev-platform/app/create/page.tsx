"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateProject() {
  const router = useRouter();
  const [projectIdea, setProjectIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!projectIdea.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: projectIdea }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/workspace/${data.projectId}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            Create Your Project with AI
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Describe your project idea and our AI will generate a complete architecture,
            break it into modules, and help you build it step-by-step
          </p>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Project Idea
          </label>
          <textarea
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            placeholder="Example: Build an Amazon clone with Next.js, featuring product catalog, cart, checkout, and order management..."
            className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Be specific about features, tech stack, and functionality
            </p>
            <button
              onClick={handleGenerate}
              disabled={!projectIdea.trim() || isGenerating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Architecture
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Example Ideas</h3>
          <div className="space-y-3">
            {[
              "Build a task management app with real-time collaboration, drag-and-drop boards, and notifications",
              "Create a social media platform with posts, comments, likes, user profiles, and messaging",
              "Develop an e-learning platform with video courses, quizzes, progress tracking, and certificates",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setProjectIdea(example)}
                className="w-full text-left p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
