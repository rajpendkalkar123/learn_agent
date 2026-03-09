"use client";

import { useProjectStore } from "@/lib/store";
import { Play, Settings, Download, GitBranch, BookOpen, Code, FileText, FileJson, Share2, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar() {
  const { currentProject } = useProjectStore();
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const startLearningPath = () => {
    if (currentProject?.id) {
      router.push(`/learning/${currentProject.id}`);
    }
  };

  const handleExport = async (format: "markdown" | "json") => {
    if (!currentProject?.id) return;
    
    setExporting(true);
    setShowExportMenu(false);
    
    try {
      const response = await fetch("/api/projects/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          format: format,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      
      // Create download link
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export documentation");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!currentProject?.id) return;
    
    setSharing(true);
    
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          permissions: "view",
          expiresIn: 604800, // 7 days
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Share error:", error);
      alert("Failed to create share link");
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <button 
          onClick={startLearningPath}
          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Start Learning
        </button>
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          disabled={sharing}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          {sharing ? "Sharing..." : "Share"}
        </button>
        
        {/* Export Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>
          
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px]">
              <button
                onClick={() => handleExport("markdown")}
                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 rounded-t-lg"
              >
                <FileText className="w-4 h-4" />
                Markdown
              </button>
              <button
                onClick={() => handleExport("json")}
                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 rounded-b-lg"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </button>
            </div>
          )}
        </div>
        
        <button className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Code className="w-4 h-4" />
          Generate Code
        </button>
        <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      
      {/* Share Dialog */}
      {showShareDialog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowShareDialog(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Share Project
            </h3>
            
            <p className="text-sm text-slate-400 mb-4">
              Anyone with this link can view your project. The link will expire in 7 days.
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowShareDialog(false)}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
