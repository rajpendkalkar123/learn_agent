import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { inMemoryStore } from "@/lib/mock-data";

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
    const userId = (session.user as any).id;
    
    const progressKey = `${userId}-${projectId}`;
    const progress = inMemoryStore.progress.get(progressKey) || {
      userId,
      learningPathId: projectId,
      completedModules: [],
      currentModuleId: null,
      checkpointScores: {},
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      completionPercentage: 0,
      badges: [],
    };

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const userId = (session.user as any).id;
    const progressData = await request.json();
    
    const progressKey = `${userId}-${projectId}`;
    const existingProgress = inMemoryStore.progress.get(progressKey);
    
    const updatedProgress = {
      ...existingProgress,
      ...progressData,
      userId,
      learningPathId: projectId,
      lastAccessedAt: new Date().toISOString(),
    };

    inMemoryStore.progress.set(progressKey, updatedProgress);

    return NextResponse.json(updatedProgress);
  } catch (error: any) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
