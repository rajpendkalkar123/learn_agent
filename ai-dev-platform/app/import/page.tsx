"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowLeft, Loader2, Link as LinkIcon } from "lucide-react";

export default function ImportProject() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!repoUrl.trim()) return;

    setIsImporting(true);

    try {
      const response = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/workspace/${data.projectId}`);
      }
    } catch (error) {
      console.error("Error importing project:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
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
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            Import from GitHub
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Import an existing repository to automatically analyze its architecture,
            map dependencies, and visualize the entire system structure
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
            GitHub Repository URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 pl-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Public repositories only (private coming soon)
            </p>
            <button
              onClick={handleImport}
              disabled={!repoUrl.trim() || isImporting}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  Import & Analyze
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">What Happens Next?</h3>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Codebase Analysis",
                description: "AI scans all files to understand structure and dependencies",
              },
              {
                step: "2",
                title: "Architecture Mapping",
                description: "Generates visual maps of components, services, and APIs",
              },
              {
                step: "3",
                title: "Dependency Graphing",
                description: "Creates interactive graphs showing how everything connects",
              },
              {
                step: "4",
                title: "Ready to Explore",
                description: "Navigate, understand, and extend your codebase intelligently",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-semibold">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
