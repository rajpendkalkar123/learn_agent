"use client";

import { useEffect, useRef } from "react";
import { useProjectStore } from "@/lib/store";
import Editor from "@monaco-editor/react";
import { Code2 } from "lucide-react";

export default function CodeEditor() {
  const { selectedFile, selectedModule } = useProjectStore();
  const editorRef = useRef<any>(null);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const getLanguage = (filename: string) => {
    if (!filename) return "typescript";
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      java: "java",
      go: "go",
      rs: "rust",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
    };
    return languageMap[ext || ""] || "typescript";
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Editor Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4">
        {selectedFile ? (
          <span className="text-sm text-slate-300">{selectedFile.name}</span>
        ) : (
          <span className="text-sm text-slate-500">No file selected</span>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {selectedFile ? (
          <Editor
            height="100%"
            language={getLanguage(selectedFile.name)}
            value={selectedFile.content || "// Code will appear here"}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
            }}
            onMount={handleEditorMount}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Code2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">Select a file to start editing</p>
              {selectedModule && (
                <p className="text-slate-600 text-sm mt-2">
                  Current module: {selectedModule.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
