"use client";

import { useProjectStore } from "@/lib/store";
import { Play, Settings, Download, GitBranch } from "lucide-react";

export default function TopBar() {
  const { currentProject } = useProjectStore();

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      {/* Left: Project Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-medium">
          {currentProject?.name || "Untitled Project"}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Play className="w-4 h-4" />
          Run
        </button>
        <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
