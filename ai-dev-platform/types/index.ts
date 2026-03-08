// Types for the platform

export interface Project {
  id: string;
  name: string;
  idea: string;
  architecture: Architecture;
  createdAt: string;
  updatedAt: string;
}

export interface Architecture {
  layers: Layer[];
  techStack: TechStack;
  modules: Module[];
}

export interface Layer {
  id: string;
  name: string;
  type: "frontend" | "backend" | "database" | "infrastructure" | "external";
  description: string;
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  external: string[];
}

export interface Module {
  id: string;
  name: string;
  layer: string;
  type: string;
  description: string;
  dependencies: string[];
  status: "pending" | "generating" | "completed" | "error";
  files?: FileNode[];
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

export interface GraphNode {
  id: string;
  type: "component" | "service" | "api" | "database" | "function" | "external";
  data: {
    label: string;
    module?: string;
    description?: string;
    inputs?: Parameter[];
    outputs?: Parameter[];
    connections?: string[];
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "calls" | "queries" | "depends_on" | "returns_data";
  label?: string;
  animated?: boolean;
}

export interface Parameter {
  name: string;
  type: string;
  description?: string;
}

export interface FunctionDetail {
  name: string;
  description: string;
  inputs: Parameter[];
  outputs: Parameter[];
  dependencies: string[];
  connectedServices: string[];
  code?: string;
}
