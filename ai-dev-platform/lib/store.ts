import { create } from "zustand";
import { Project, Module, GraphNode, GraphEdge, FileNode } from "@/types";

interface ProjectStore {
  currentProject: Project | null;
  selectedModule: Module | null;
  modules: Module[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  selectedFile: FileNode | null;
  isGraphVisible: boolean;

  setCurrentProject: (project: Project) => void;
  setSelectedModule: (module: Module | null) => void;
  addModule: (module: Module) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  setGraphNodes: (nodes: GraphNode[]) => void;
  setGraphEdges: (edges: GraphEdge[]) => void;
  addGraphNode: (node: GraphNode) => void;
  addGraphEdge: (edge: GraphEdge) => void;
  setSelectedFile: (file: FileNode | null) => void;
  toggleGraph: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  selectedModule: null,
  modules: [],
  graphNodes: [],
  graphEdges: [],
  selectedFile: null,
  isGraphVisible: true,

  setCurrentProject: (project) => set({ currentProject: project }),
  setSelectedModule: (module) => set({ selectedModule: module }),
  addModule: (module) => set((state) => ({ modules: [...state.modules, module] })),
  updateModule: (moduleId, updates) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    })),
  setGraphNodes: (nodes) => set({ graphNodes: nodes }),
  setGraphEdges: (edges) => set({ graphEdges: edges }),
  addGraphNode: (node) =>
    set((state) => ({ graphNodes: [...state.graphNodes, node] })),
  addGraphEdge: (edge) =>
    set((state) => ({ graphEdges: [...state.graphEdges, edge] })),
  setSelectedFile: (file) => set({ selectedFile: file }),
  toggleGraph: () => set((state) => ({ isGraphVisible: !state.isGraphVisible })),
}));
