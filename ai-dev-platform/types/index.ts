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

// Learning Path Types
export interface LearningPath {
  id: string;
  projectId: string;
  name: string;
  description: string;
  modules: LearningModule[];
  knowledgeLevel: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  estimatedDuration: number; // in minutes
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // in minutes
  type: "concept" | "implementation" | "architecture" | "checkpoint";
  prerequisites: string[]; // IDs of prerequisite modules
  resources: LearningResource[];
  checkpoint?: Checkpoint;
  completed?: boolean;
  completedAt?: string;
}

export interface LearningResource {
  title: string;
  type: "documentation" | "example" | "video" | "article";
  url?: string;
  content?: string;
}

export interface Checkpoint {
  id: string;
  questions: CheckpointQuestion[];
  passingScore: number;
}

export interface CheckpointQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "code" | "true-false";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserProgress {
  userId: string;
  projectId: string;
  learningPathId: string;
  completedModules: string[];
  currentModule?: string;
  checkpointScores: Record<string, number>;
  totalTimeSpent: number; // in minutes
  startedAt: string;
  lastActivityAt: string;
  completionPercentage: number;
}

// Impact Analysis Types
export interface ImpactAnalysis {
  moduleId: string;
  changeDescription: string;
  directImpacts: ModuleImpact[];
  indirectImpacts: ModuleImpact[];
  potentialBreakingChanges: BreakingChange[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface ModuleImpact {
  moduleId: string;
  moduleName: string;
  impactType: "direct" | "indirect";
  reason: string;
  affectedFunctions: string[];
  severity: "low" | "medium" | "high";
}

export interface BreakingChange {
  type: string;
  description: string;
  affectedModules: string[];
  mitigation: string;
}

// Conversation Types
export interface Conversation {
  id: string;
  projectId: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    moduleId?: string;
    codeSnippet?: string;
    references?: string[];
  };
}
