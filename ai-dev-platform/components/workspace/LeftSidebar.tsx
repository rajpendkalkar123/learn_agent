"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store";
import { FileNode, Module } from "@/types";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Layers,
  Box,
  Zap,
  Loader2,
  CheckCircle,
  Search,
  X,
} from "lucide-react";

export default function LeftSidebar() {
  const { modules, selectedModule, setSelectedModule, setSelectedFile, currentProject, updateModule } =
    useProjectStore();
  const [activeTab, setActiveTab] = useState<"files" | "modules">("modules");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [generatingModules, setGeneratingModules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGenerateCode = async (module: Module, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setGeneratingModules(prev => new Set(prev).add(module.id));
    updateModule(module.id, { status: "generating" });

    try {
      const response = await fetch("/api/modules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject?.id,
          moduleId: module.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        updateModule(module.id, {
          status: "completed",
          files: data.files,
        });
      } else {
        updateModule(module.id, { status: "error" });
      }
    } catch (error) {
      console.error("Error generating module:", error);
      updateModule(module.id, { status: "error" });
    } finally {
      setGeneratingModules(prev => { const next = new Set(prev); next.delete(module.id); return next; });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim() || !currentProject?.id) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          query: query,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 cursor-pointer text-sm`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              setSelectedFile(node);
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-slate-400" />
            </>
          )}
          <span className="text-slate-300">{node.name}</span>
        </div>
        {node.type === "folder" &&
          isExpanded &&
          node.children?.map((child) => renderFileTree(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("modules")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "modules"
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Modules
          </div>
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "files"
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Folder className="w-4 h-4" />
            Files
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search in project..."
            className="w-full pl-9 pr-8 py-2 bg-slate-800 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery && searchResults.length > 0 ? (
          // Search Results
          <div className="p-2">
            <div className="text-xs text-slate-400 mb-2 px-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (result.type === "module") {
                    const module = modules.find(m => m.id === result.moduleId);
                    if (module) setSelectedModule(module);
                  }
                }}
                className="p-3 rounded-lg cursor-pointer mb-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-1">
                    {result.type === "module" && <Box className="w-4 h-4 text-blue-400" />}
                    {result.type === "layer" && <Layers className="w-4 h-4 text-purple-400" />}
                    {result.type === "technology" && <Zap className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {result.highlights?.[0] || result.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-300 capitalize">
                        {result.type}
                      </span>
                      {result.layer && (
                        <span className="text-xs text-slate-500">{result.layer}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && isSearching ? (
          <div className="text-slate-500 text-sm text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Searching...
          </div>
        ) : searchQuery && searchResults.length === 0 && !isSearching ? (
          <div className="text-slate-500 text-sm text-center py-8">
            No results found
          </div>
        ) : activeTab === "modules" ? (
          <div className="p-2">
            {modules.length === 0 ? (
              <div className="text-slate-500 text-sm text-center py-8">
                No modules yet
              </div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                    selectedModule?.id === module.id
                      ? "bg-blue-500/20 border border-blue-500/50"
                      : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Box
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        module.status === "completed"
                          ? "text-green-400"
                          : module.status === "generating"
                          ? "text-yellow-400"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {module.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {module.layer}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                          {module.status === "completed" && <CheckCircle className="w-3 h-3 text-green-400" />}
                          {module.status === "generating" && <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />}
                          {module.status}
                        </div>
                        {module.status === "pending" && (
                          <button
                            onClick={(e) => handleGenerateCode(module, e)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="py-2">
            {/* File tree would go here */}
            <div className="text-slate-500 text-sm text-center py-8">
              File explorer coming soon
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
