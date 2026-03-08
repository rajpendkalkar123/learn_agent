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
} from "lucide-react";

export default function LeftSidebar() {
  const { modules, selectedModule, setSelectedModule, setSelectedFile } =
    useProjectStore();
  const [activeTab, setActiveTab] = useState<"files" | "modules">("modules");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "modules" ? (
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
                      className={`w-4 h-4 mt-0.5 ${
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
                      <div className="text-xs text-slate-500 mt-1 capitalize">
                        {module.status}
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
