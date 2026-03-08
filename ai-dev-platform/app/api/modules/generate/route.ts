import { NextRequest, NextResponse } from "next/server";
import { generateModuleCode } from "@/lib/bedrock";
import { getProject, updateModule } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  try {
    const { projectId, moduleId } = await request.json();

    // Get project details
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Find the module
    const module = project.architecture.modules.find(
      (m: any) => m.id === moduleId
    );
    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Update module status to generating
    await updateModule(moduleId, { status: "generating" });

    // Generate code using AI
    const techStack = [
      ...project.architecture.techStack.frontend,
      ...project.architecture.techStack.backend,
    ];

    const codeResult = await generateModuleCode(
      module.name,
      module.description,
      module.dependencies,
      techStack
    );

    // Update module with generated files
    await updateModule(moduleId, {
      status: "completed",
      files: codeResult.files,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      files: codeResult.files,
    });
  } catch (error: any) {
    console.error("Error generating module:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate module" },
      { status: 500 }
    );
  }
}
