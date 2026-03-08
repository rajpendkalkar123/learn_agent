"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/lib/store";
import TopBar from "@/components/workspace/TopBar";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import CodeEditor from "@/components/workspace/CodeEditor";
import RightPanel from "@/components/workspace/RightPanel";
import BottomPanel from "@/components/workspace/BottomPanel";

export default function WorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProject, setCurrentProject, isGraphVisible } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch project data
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setCurrentProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, setCurrentProject]);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center Area (Editor + Graph) */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className={`${isGraphVisible ? "h-1/2" : "flex-1"} border-b border-slate-800`}>
            <CodeEditor />
          </div>

          {/* Bottom Panel (Graph) */}
          {isGraphVisible && (
            <div className="h-1/2">
              <BottomPanel />
            </div>
          )}
        </div>

        {/* Right Panel (AI Assistant) */}
        <RightPanel />
      </div>
    </div>
  );
}
