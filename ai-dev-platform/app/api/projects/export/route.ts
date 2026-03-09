import { NextRequest, NextResponse } from "next/server";
import { getProject, getModulesByProject } from "@/lib/dynamodb";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, format } = await request.json();
    
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const modules = await getModulesByProject(projectId);
    const knowledgeLevel = (session.user as any).knowledgeLevel || "intermediate";

    // Generate documentation based on format
    if (format === "markdown") {
      const markdown = generateMarkdownDocumentation(project, modules, knowledgeLevel);
      return NextResponse.json({
        content: markdown,
        filename: `${project.name.replace(/\s+/g, "-")}-documentation.md`,
        mimeType: "text/markdown",
      });
    } else if (format === "json") {
      const documentation = {
        project: {
          name: project.name,
          idea: project.idea,
          createdAt: project.createdAt,
        },
        architecture: project.architecture,
        modules: modules,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedFor: session.user.name,
          knowledgeLevel: knowledgeLevel,
        },
      };
      return NextResponse.json({
        content: JSON.stringify(documentation, null, 2),
        filename: `${project.name.replace(/\s+/g, "-")}-export.json`,
        mimeType: "application/json",
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported format. Use 'markdown' or 'json'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error exporting documentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export documentation" },
      { status: 500 }
    );
  }
}

function generateMarkdownDocumentation(
  project: any,
  modules: any[],
  knowledgeLevel: string
): string {
  const date = new Date().toLocaleDateString();
  
  let markdown = `# ${project.name} - Technical Documentation\n\n`;
  markdown += `**Generated:** ${date}\n`;
  markdown += `**Knowledge Level:** ${knowledgeLevel}\n\n`;
  markdown += `---\n\n`;
  
  // Table of Contents
  markdown += `## Table of Contents\n\n`;
  markdown += `1. [Project Overview](#project-overview)\n`;
  markdown += `2. [System Architecture](#system-architecture)\n`;
  markdown += `3. [Technology Stack](#technology-stack)\n`;
  markdown += `4. [Architecture Layers](#architecture-layers)\n`;
  markdown += `5. [Modules](#modules)\n`;
  markdown += `6. [Data Flow](#data-flow)\n\n`;
  markdown += `---\n\n`;
  
  // Project Overview
  markdown += `## Project Overview\n\n`;
  markdown += `${project.idea}\n\n`;
  
  if (knowledgeLevel === "beginner") {
    markdown += `### What does this project do?\n\n`;
    markdown += `This application is designed to solve specific problems by organizing code into `;
    markdown += `different layers and modules. Each module has a specific responsibility and works `;
    markdown += `together with other modules to create a complete system.\n\n`;
  }
  
  markdown += `**Project Details:**\n`;
  markdown += `- **Created:** ${new Date(project.createdAt).toLocaleDateString()}\n`;
  markdown += `- **Total Modules:** ${modules.length}\n`;
  markdown += `- **Architecture Layers:** ${project.architecture.layers.length}\n\n`;
  markdown += `---\n\n`;
  
  // System Architecture
  markdown += `## System Architecture\n\n`;
  if (knowledgeLevel === "beginner") {
    markdown += `The system is organized into different layers, like floors in a building. `;
    markdown += `Each layer has a specific purpose:\n\n`;
  } else {
    markdown += `The application follows a layered architecture pattern with clear separation of concerns:\n\n`;
  }
  
  // Architecture Diagram
  markdown += `\`\`\`\n`;
  project.architecture.layers.forEach((layer: any, index: number) => {
    const padding = "  ".repeat(index);
    markdown += `${padding}┌${"─".repeat(50)}┐\n`;
    markdown += `${padding}│  ${layer.name.padEnd(48)}│\n`;
    markdown += `${padding}│  ${layer.type.padEnd(48)}│\n`;
    markdown += `${padding}└${"─".repeat(50)}┘\n`;
    if (index < project.architecture.layers.length - 1) {
      markdown += `${padding}        ↓\n`;
    }
  });
  markdown += `\`\`\`\n\n`;
  
  // Technology Stack
  markdown += `## Technology Stack\n\n`;
  const techStack = project.architecture.techStack;
  
  markdown += `### Frontend\n`;
  techStack.frontend?.forEach((tech: string) => {
    markdown += `- **${tech}**`;
    if (knowledgeLevel === "beginner") {
      markdown += getTechExplanation(tech, "frontend");
    }
    markdown += `\n`;
  });
  markdown += `\n`;
  
  markdown += `### Backend\n`;
  techStack.backend?.forEach((tech: string) => {
    markdown += `- **${tech}**`;
    if (knowledgeLevel === "beginner") {
      markdown += getTechExplanation(tech, "backend");
    }
    markdown += `\n`;
  });
  markdown += `\n`;
  
  markdown += `### Database\n`;
  techStack.database?.forEach((tech: string) => {
    markdown += `- **${tech}**`;
    if (knowledgeLevel === "beginner") {
      markdown += getTechExplanation(tech, "database");
    }
    markdown += `\n`;
  });
  markdown += `\n`;
  
  if (techStack.external && techStack.external.length > 0) {
    markdown += `### External Services\n`;
    techStack.external.forEach((tech: string) => {
      markdown += `- **${tech}**\n`;
    });
    markdown += `\n`;
  }
  
  markdown += `---\n\n`;
  
  // Architecture Layers
  markdown += `## Architecture Layers\n\n`;
  project.architecture.layers.forEach((layer: any, index: number) => {
    markdown += `### ${index + 1}. ${layer.name}\n\n`;
    markdown += `**Type:** ${layer.type}\n\n`;
    markdown += `**Description:** ${layer.description}\n\n`;
    
    const layerModules = modules.filter((m) => m.layer === layer.id);
    if (layerModules.length > 0) {
      markdown += `**Modules in this layer:**\n`;
      layerModules.forEach((mod) => {
        markdown += `- ${mod.name}\n`;
      });
      markdown += `\n`;
    }
  });
  
  markdown += `---\n\n`;
  
  // Modules
  markdown += `## Modules\n\n`;
  if (knowledgeLevel === "beginner") {
    markdown += `Modules are the building blocks of the application. Each module handles `;
    markdown += `a specific feature or functionality.\n\n`;
  }
  
  modules.forEach((module, index) => {
    markdown += `### ${index + 1}. ${module.name}\n\n`;
    markdown += `**Layer:** ${module.layer}\n`;
    markdown += `**Type:** ${module.type}\n`;
    markdown += `**Status:** ${module.status}\n\n`;
    markdown += `**Description:**\n`;
    markdown += `${module.description}\n\n`;
    
    if (module.dependencies && module.dependencies.length > 0) {
      markdown += `**Dependencies:**\n`;
      module.dependencies.forEach((dep: string) => {
        const depModule = modules.find((m) => m.id === dep);
        markdown += `- ${depModule ? depModule.name : dep}\n`;
      });
      markdown += `\n`;
    }
    
    if (module.files && module.files.length > 0) {
      markdown += `**Files:**\n`;
      module.files.forEach((file: any) => {
        markdown += `- \`${file.path}\`\n`;
      });
      markdown += `\n`;
    }
  });
  
  markdown += `---\n\n`;
  
  // Data Flow
  markdown += `## Data Flow\n\n`;
  if (knowledgeLevel === "beginner") {
    markdown += `This section shows how data moves through the system:\n\n`;
  } else {
    markdown += `The following diagram illustrates the data flow between components:\n\n`;
  }
  
  markdown += `\`\`\`\n`;
  markdown += `User Request → Frontend → Backend API → Database\n`;
  markdown += `                              ↓\n`;
  markdown += `                        Business Logic\n`;
  markdown += `                              ↓\n`;
  markdown += `Database Response ← Backend ← Processing\n`;
  markdown += `        ↓\n`;
  markdown += `   Frontend ← User Response\n`;
  markdown += `\`\`\`\n\n`;
  
  // Footer
  markdown += `---\n\n`;
  markdown += `**End of Documentation**\n\n`;
  markdown += `*This documentation was automatically generated by AI Dev Platform*\n`;
  
  return markdown;
}

function getTechExplanation(tech: string, category: string): string {
  const explanations: Record<string, string> = {
    "React": " - A JavaScript library for building user interfaces",
    "Next.js": " - A React framework for building web applications",
    "Node.js": " - JavaScript runtime for building server applications",
    "Express": " - Web application framework for Node.js",
    "MongoDB": " - NoSQL database for storing data",
    "PostgreSQL": " - Relational database for structured data",
    "MySQL": " - Popular relational database system",
    "TypeScript": " - JavaScript with type safety",
    "Tailwind CSS": " - Utility-first CSS framework for styling",
  };
  
  return explanations[tech] || "";
}
