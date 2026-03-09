"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Github, Code2, GitBranch, User, BarChart3 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col p-4">
      {/* Header */}
      {session && (
        <div className="max-w-6xl w-full mx-auto mb-8">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl w-full"
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Code2 className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Dev Platform
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Build Smarter, Understand Deeper
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            No more vibe coding. Visualize your architecture, generate code module-by-module, 
            and understand every connection in your system.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create New Project */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => router.push("/create")}
            className="glass glass-hover p-8 rounded-2xl cursor-pointer group"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Create with AI</h2>
            <p className="text-slate-400 mb-4">
              Describe your project idea and let AI generate a complete architecture 
              with modular components, services, and visual dependency graphs.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                AI-powered architecture planning
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Module-by-module code generation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Interactive dependency visualization
              </li>
            </ul>
          </motion.div>

          {/* Import from GitHub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => router.push("/import")}
            className="glass glass-hover p-8 rounded-2xl cursor-pointer group"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Github className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Import from GitHub</h2>
            <p className="text-slate-400 mb-4">
              Import an existing repository and automatically generate architecture maps, 
              dependency graphs, and understand the entire codebase structure.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Automatic codebase analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Service dependency mapping
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Function relationship graphs
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            Why Use This Platform?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <strong className="text-white">Visual Architecture</strong>
              <p className="text-slate-400 mt-1">
                See how every component, API, and service connects in real-time
              </p>
            </div>
            <div>
              <strong className="text-white">Modular Development</strong>
              <p className="text-slate-400 mt-1">
                Build features step-by-step with AI guidance and clear dependencies
              </p>
            </div>
            <div>
              <strong className="text-white">Deep Understanding</strong>
              <p className="text-slate-400 mt-1">
                No more black-box AI coding - know exactly how your system works
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
