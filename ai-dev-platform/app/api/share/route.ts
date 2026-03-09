import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/dynamodb";
import { auth } from "@/lib/auth";
import { inMemoryStore } from "@/lib/mock-data";

interface ShareLink {
  id: string;
  projectId: string;
  createdBy: string;
  sharedWith: string[];
  permissions: "view" | "edit";
  expiresAt?: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, permissions, expiresIn } = await request.json();
    
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

    // Create share link
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shareLink: ShareLink = {
      id: shareId,
      projectId: projectId,
      createdBy: (session.user as any).id || session.user.email || "anonymous",
      sharedWith: [],
      permissions: permissions || "view",
      expiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Store share link (in demo mode)
    if (!inMemoryStore.shareLinks) {
      inMemoryStore.shareLinks = new Map();
    }
    inMemoryStore.shareLinks.set(shareId, shareLink);

    const shareUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/shared/${shareId}`;

    return NextResponse.json({
      shareId: shareId,
      shareUrl: shareUrl,
      permissions: shareLink.permissions,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error: any) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    
    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    if (!inMemoryStore.shareLinks) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    const shareLink = inMemoryStore.shareLinks.get(shareId);
    
    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    // Check if expired
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
    }

    const project = await getProject(shareLink.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      shareLink: {
        id: shareLink.id,
        permissions: shareLink.permissions,
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt,
      },
      project: {
        id: project.id,
        name: project.name,
        idea: project.idea,
        architecture: project.architecture,
        createdAt: project.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching share link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    
    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    if (!inMemoryStore.shareLinks) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    const shareLink = inMemoryStore.shareLinks.get(shareId);
    
    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    const userId = (session.user as any).id || session.user.email;
    if (shareLink.createdBy !== userId) {
      return NextResponse.json(
        { error: "Only the creator can revoke this share link" },
        { status: 403 }
      );
    }

    inMemoryStore.shareLinks.delete(shareId);

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully",
    });
  } catch (error: any) {
    console.error("Error revoking share link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
