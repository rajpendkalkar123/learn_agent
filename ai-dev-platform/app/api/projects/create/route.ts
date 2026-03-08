import { NextRequest, NextResponse } from "next/server";
import { generateArchitecture } from "@/lib/bedrock";
import { createProject, createModule } from "@/lib/dynamodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || idea.trim() === "") {
      return NextResponse.json(
        { error: "Project idea is required" },
        { status: 400 }
      );
    }

    // Generate architecture using AI
    const architecture = await generateArchitecture(idea);

    // Create project in database
    const projectId = uuidv4();
    const project = {
      id: projectId,
      name: architecture.projectName,
      idea,
      architecture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createProject(project);

    // Create modules
    for (const module of architecture.modules) {
      await createModule({
        ...module,
        projectId,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      projectId,
      project,
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
