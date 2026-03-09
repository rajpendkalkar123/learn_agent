import { LearningPath, LearningModule, UserProgress } from "@/types";

// Generate a learning path based on project architecture and user knowledge level
export function generateLearningPath(
  projectId: string,
  projectName: string,
  architecture: any,
  knowledgeLevel: "beginner" | "intermediate" | "advanced"
): LearningPath {
  const modules: LearningModule[] = [];
  let order = 1;

  // Introduction module
  modules.push({
    id: `intro-${projectId}`,
    title: "Project Overview",
    description: `Understand the high-level architecture of ${projectName}`,
    content: generateIntroContent(projectName, architecture, knowledgeLevel),
    order: order++,
    duration: knowledgeLevel === "beginner" ? 15 : knowledgeLevel === "intermediate" ? 10 : 5,
    type: "concept",
    prerequisites: [],
    resources: [
      {
        title: "System Architecture Basics",
        type: "documentation",
        content: "Learn fundamental architecture concepts",
      },
    ],
  });

  // Technology stack module
  modules.push({
    id: `tech-stack-${projectId}`,
    title: "Technology Stack",
    description: "Learn about the technologies used in this project",
    content: generateTechStackContent(architecture.techStack, knowledgeLevel),
    order: order++,
    duration: knowledgeLevel === "beginner" ? 20 : knowledgeLevel === "intermediate" ? 15 : 10,
    type: "concept",
    prerequisites: [`intro-${projectId}`],
    resources: generateTechStackResources(architecture.techStack),
  });

  // Layer-by-layer modules
  for (const layer of architecture.layers || []) {
    modules.push({
      id: `layer-${layer.id}`,
      title: `Understanding ${layer.name}`,
      description: layer.description,
      content: generateLayerContent(layer, architecture, knowledgeLevel),
      order: order++,
      duration: knowledgeLevel === "beginner" ? 25 : knowledgeLevel === "intermediate" ? 18 : 12,
      type: "architecture",
      prerequisites: [`tech-stack-${projectId}`],
      resources: [
        {
          title: `${layer.name} Design Patterns`,
          type: "documentation",
          content: `Common patterns for ${layer.type} layer`,
        },
      ],
      checkpoint: knowledgeLevel === "beginner" ? generateCheckpoint(layer.name, "basic") : undefined,
    });
  }

  // Module-specific learning
  const projectModules = architecture.modules || [];
  for (const mod of projectModules.slice(0, 5)) { // Limit to first 5 modules
    const prereqs = [
      ...mod.dependencies.map((dep: string) => `module-${dep}`),
      `layer-${mod.layer}`,
    ].filter((p) => modules.some((m) => m.id === p));

    modules.push({
      id: `module-${mod.id}`,
      title: `Building ${mod.name}`,
      description: mod.description,
      content: generateModuleContent(mod, knowledgeLevel),
      order: order++,
      duration: knowledgeLevel === "beginner" ? 30 : knowledgeLevel === "intermediate" ? 20 : 15,
      type: "implementation",
      prerequisites: prereqs.length > 0 ? prereqs : [`layer-${mod.layer}`],
      resources: [
        {
          title: `${mod.name} Implementation Guide`,
          type: "example",
          content: `Step-by-step implementation of ${mod.name}`,
        },
      ],
    });
  }

  // Final checkpoint
  modules.push({
    id: `final-checkpoint-${projectId}`,
    title: "Knowledge Verification",
    description: "Test your understanding of the entire system",
    content: "Complete this checkpoint to verify your understanding of the project architecture and implementation.",
    order: order++,
    duration: 20,
    type: "checkpoint",
    prerequisites: modules.slice(-3).map((m) => m.id),
    resources: [],
    checkpoint: generateFinalCheckpoint(projectName, knowledgeLevel),
  });

  const totalDuration = modules.reduce((sum, mod) => sum + mod.duration, 0);

  return {
    id: `path-${projectId}`,
    projectId,
    name: `${projectName} Learning Path`,
    description: `A comprehensive learning path to master ${projectName} from ${knowledgeLevel} level`,
    modules,
    knowledgeLevel,
    createdAt: new Date().toISOString(),
    estimatedDuration: totalDuration,
  };
}

function generateIntroContent(
  projectName: string,
  architecture: any,
  level: string
): string {
  const beginner = `# Welcome to ${projectName}!

This project is designed to help you build a real-world application. Let's start with the basics.

## What is this project about?

${projectName} is a software system made up of different components that work together. Think of it like building blocks - each block (component) has a specific job, and they all connect to create the complete application.

## Key Components:

${architecture.layers?.map((l: any) => `- **${l.name}**: ${l.description}`).join('\n') || 'Various layers working together'}

## What you'll learn:

1. How different parts of the system connect
2. Why we organize code in layers
3. How data flows through the application
4. How to build each component step by step

Don't worry if some terms seem unfamiliar - we'll explain everything as we go!`;

  const intermediate = `# ${projectName} Architecture Overview

## System Design

This project follows a layered architecture pattern with the following structure:

${architecture.layers?.map((l: any) => `### ${l.name}\n${l.description}`).join('\n\n') || ''}

## Key Architectural Decisions:

- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Management**: Clear dependencies between modules
- **Scalability**: Designed to handle growth in users and features

You'll learn how these design decisions impact development and maintenance.`;

  const advanced = `# ${projectName} - Technical Architecture

## System Overview

${architecture.layers?.map((l: any) => `**${l.name}** (${l.type}): ${l.description}`).join(' | ') || ''}

## Architecture Patterns:
- Layered architecture with clear boundaries
- Dependency injection for loose coupling
- Event-driven components where applicable

Focus: Understanding architectural trade-offs and implementation patterns.`;

  return level === "beginner" ? beginner : level === "intermediate" ? intermediate : advanced;
}

function generateTechStackContent(techStack: any, level: string): string {
  const technologies = [
    ...techStack.frontend || [],
    ...techStack.backend || [],
    ...techStack.database || [],
    ...techStack.external || [],
  ];

  if (level === "beginner") {
    return `# Technologies Used

This project uses several technologies (tools and frameworks) to build the application:

## Frontend (What users see):
${techStack.frontend?.map((t: string) => `- **${t}**: Creates the user interface`).join('\n') || 'N/A'}

## Backend (Server logic):
${techStack.backend?.map((t: string) => `- **${t}**: Handles business logic and data`).join('\n') || 'N/A'}

## Database (Data storage):
${techStack.database?.map((t: string) => `- **${t}**: Stores application data`).join('\n') || 'N/A'}

Don't worry about memorizing everything - you'll learn each technology as you build!`;
  }

  return `# Technology Stack

${Object.entries(techStack).map(([key, values]: [string, any]) => 
  `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n${values?.map((v: string) => `- ${v}`).join('\n') || 'N/A'}`
).join('\n\n')}`;
}

function generateLayerContent(layer: any, architecture: any, level: string): string {
  const modulesInLayer = architecture.modules?.filter((m: any) => m.layer === layer.id) || [];

  if (level === "beginner") {
    return `# ${layer.name}

${layer.description}

## What does this layer do?

This layer is responsible for ${layer.type}-related tasks. It contains ${modulesInLayer.length} main components:

${modulesInLayer.map((m: any) => `- **${m.name}**: ${m.description}`).join('\n')}

## Why is this important?

Separating our code into layers helps keep things organized and makes it easier to:
- Find and fix bugs
- Add new features
- Test each part independently
- Work as a team

In the next lessons, you'll build each component in this layer step by step.`;
  }

  return `# ${layer.name}

**Type**: ${layer.type}

${layer.description}

## Modules in this layer:
${modulesInLayer.map((m: any) => `- ${m.name}: ${m.description}`).join('\n')}

## Dependencies:
${modulesInLayer.length > 0 ? modulesInLayer[0].dependencies?.join(', ') || 'None' : 'None'}`;
}

function generateModuleContent(module: any, level: string): string {
  if (level === "beginner") {
    return `# Building ${module.name}

## What is ${module.name}?

${module.description}

## What you'll build:

In this lesson, you'll create the ${module.name} component. This component ${module.type === 'component' ? 'is a visual part users interact with' : 'handles important backend logic'}.

## Dependencies:

${module.dependencies.length > 0 ? 
  `This module needs these other components to work:\n${module.dependencies.map((d: string) => `- ${d}`).join('\n')}` : 
  'This module works independently!'}

## Step-by-step guide:

1. Set up the basic structure
2. Implement core functionality
3. Connect to dependencies
4. Test the component
5. Integrate with the rest of the system

Ready to build? Let's start!`;
  }

  return `# ${module.name}

${module.description}

**Type**: ${module.type}
**Dependencies**: ${module.dependencies.join(', ') || 'None'}

## Implementation approach:
1. Module structure and interfaces
2. Core logic implementation
3. Integration with dependencies
4. Error handling and validation
5. Unit testing`;
}

function generateTechStackResources(techStack: any): any[] {
  const resources = [];
  
  if (techStack.frontend?.length > 0) {
    resources.push({
      title: `${techStack.frontend[0]} Documentation`,
      type: "documentation" as const,
      url: "#",
    });
  }

  if (techStack.backend?.length > 0) {
    resources.push({
      title: `${techStack.backend[0]} Guide`,
      type: "documentation" as const,
      url: "#",
    });
  }

  return resources;
}

function generateCheckpoint(topicName: string, difficulty: string): any {
  return {
    id: `checkpoint-${topicName.toLowerCase().replace(/\s+/g, '-')}`,
    questions: [
      {
        id: "q1",
        question: `What is the main purpose of the ${topicName}?`,
        type: "multiple-choice" as const,
        options: [
          "Handle user interface",
          "Manage data storage",
          "Process business logic",
          "All of the above",
        ],
        correctAnswer: "Process business logic",
        explanation: `The ${topicName} is responsible for processing business logic and managing application flow.`,
      },
      {
        id: "q2",
        question: `True or False: The ${topicName} can work independently without other layers.`,
        type: "true-false" as const,
        correctAnswer: "false",
        explanation: "Layers typically depend on each other to create a complete application.",
      },
    ],
    passingScore: 70,
  };
}

function generateFinalCheckpoint(projectName: string, level: string): any {
  const basicQuestions = [
    {
      id: "final-q1",
      question: `What architectural pattern does ${projectName} primarily use?`,
      type: "multiple-choice" as const,
      options: [
        "Monolithic architecture",
        "Layered architecture",
        "Microservices",
        "Serverless",
      ],
      correctAnswer: "Layered architecture",
      explanation: "This project uses a layered architecture to separate concerns.",
    },
    {
      id: "final-q2",
      question: "Why is separating code into layers beneficial?",
      type: "multiple-choice" as const,
      options: [
        "Makes code harder to read",
        "Increases development time",
        "Improves maintainability and testing",
        "Has no real benefit",
      ],
      correctAnswer: "Improves maintainability and testing",
      explanation: "Layered architecture makes code more maintainable, testable, and easier to understand.",
    },
  ];

  return {
    id: `final-checkpoint-${projectName}`,
    questions: basicQuestions,
    passingScore: level === "beginner" ? 60 : level === "intermediate" ? 70 : 80,
  };
}

// In-memory storage for user progress
const userProgressStore = new Map<string, UserProgress>();

export function initializeUserProgress(
  userId: string,
  projectId: string,
  learningPathId: string
): UserProgress {
  const progress: UserProgress = {
    userId,
    projectId,
    learningPathId,
    completedModules: [],
    checkpointScores: {},
    totalTimeSpent: 0,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    completionPercentage: 0,
  };

  userProgressStore.set(`${userId}-${projectId}`, progress);
  return progress;
}

export function getUserProgress(userId: string, projectId: string): UserProgress | null {
  return userProgressStore.get(`${userId}-${projectId}`) || null;
}

export function updateModuleCompletion(
  userId: string,
  projectId: string,
  moduleId: string,
  timeSpent: number
): UserProgress | null {
  const key = `${userId}-${projectId}`;
  const progress = userProgressStore.get(key);

  if (!progress) return null;

  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }

  progress.totalTimeSpent += timeSpent;
  progress.lastActivityAt = new Date().toISOString();

  userProgressStore.set(key, progress);
  return progress;
}

export function updateCheckpointScore(
  userId: string,
  projectId: string,
  checkpointId: string,
  score: number
): UserProgress | null {
  const key = `${userId}-${projectId}`;
  const progress = userProgressStore.get(key);

  if (!progress) return null;

  progress.checkpointScores[checkpointId] = score;
  progress.lastActivityAt = new Date().toISOString();

  userProgressStore.set(key, progress);
  return progress;
}

export function calculateCompletionPercentage(
  progress: UserProgress,
  totalModules: number
): number {
  return Math.round((progress.completedModules.length / totalModules) * 100);
}
