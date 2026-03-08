import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/bedrock";
import { createProject, createModule } from "@/lib/dynamodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl || repoUrl.trim() === "") {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    // Analyze repository using AI
    const architecture = await analyzeRepository(repoUrl);

    // Create project in database
    const projectId = uuidv4();
    const project = {
      id: projectId,
      name: architecture.projectName,
      idea: `Imported from ${repoUrl}`,
      repoUrl,
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
    console.error("Error importing project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import project" },
      { status: 500 }
    );
  }
}
