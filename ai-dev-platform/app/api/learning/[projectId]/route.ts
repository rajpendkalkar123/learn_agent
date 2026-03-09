import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/dynamodb";
import { generateLearningPath } from "@/lib/learning";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    const project = await getProject(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const knowledgeLevel = (session.user as any).knowledgeLevel || "intermediate";

    const learningPath = generateLearningPath(
      projectId,
      project.name,
      project.architecture,
      knowledgeLevel
    );

    return NextResponse.json(learningPath);
  } catch (error: any) {
    console.error("Error generating learning path:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate learning path" },
      { status: 500 }
    );
  }
}
